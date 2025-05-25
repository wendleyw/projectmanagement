-- Extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de perfis (estendendo auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'member')) DEFAULT 'member',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

-- Tabela de membros do projeto
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('manager', 'member')) DEFAULT 'member',
  permissions JSONB DEFAULT '{}',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES public.profiles(id),
  UNIQUE(user_id, project_id)
);

-- Tabela de atribuições de tarefas
CREATE TABLE IF NOT EXISTS public.task_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('assigned', 'accepted', 'declined')) DEFAULT 'assigned'
);

-- Índices para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_assigned_to ON task_assignments(assigned_to);

-- Função auxiliar para verificar se um usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função auxiliar para verificar se um usuário é manager de um projeto
CREATE OR REPLACE FUNCTION is_project_manager(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM project_members
    WHERE user_id = auth.uid() 
    AND project_id = $1
    AND role = 'manager'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função auxiliar para verificar se um usuário é membro de um projeto
CREATE OR REPLACE FUNCTION is_project_member(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM project_members
    WHERE user_id = auth.uid() 
    AND project_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função auxiliar para verificar se uma tarefa está atribuída ao usuário
CREATE OR REPLACE FUNCTION is_task_assigned(task_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM task_assignments
    WHERE assigned_to = auth.uid() 
    AND task_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Configurar RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
USING (is_admin());

CREATE POLICY "Managers can view profiles of their project members"
ON profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.user_id = profiles.id
    AND EXISTS (
      SELECT 1 FROM project_members
      WHERE user_id = auth.uid()
      AND project_id = pm.project_id
      AND role = 'manager'
    )
  )
);

CREATE POLICY "Admins can manage all profiles"
ON profiles
FOR ALL
USING (is_admin());

-- Configurar RLS para projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para projects
CREATE POLICY "Admins can view all projects"
ON projects
FOR SELECT
USING (is_admin());

CREATE POLICY "Managers can view their projects"
ON projects
FOR SELECT
USING (is_project_manager(id));

CREATE POLICY "Members can view projects they are assigned to"
ON projects
FOR SELECT
USING (is_project_member(id));

CREATE POLICY "Admins can manage all projects"
ON projects
FOR ALL
USING (is_admin());

CREATE POLICY "Managers can update their projects"
ON projects
FOR UPDATE
USING (is_project_manager(id));

-- Configurar RLS para tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tasks
CREATE POLICY "Admins can view all tasks"
ON tasks
FOR SELECT
USING (is_admin());

CREATE POLICY "Users can view tasks of projects they are members of"
ON tasks
FOR SELECT
USING (is_project_member(project_id));

CREATE POLICY "Users can view tasks assigned to them"
ON tasks
FOR SELECT
USING (is_task_assigned(id));

CREATE POLICY "Admins can manage all tasks"
ON tasks
FOR ALL
USING (is_admin());

CREATE POLICY "Project managers can manage tasks in their projects"
ON tasks
FOR ALL
USING (is_project_manager(project_id));

CREATE POLICY "Users can update tasks assigned to them"
ON tasks
FOR UPDATE
USING (is_task_assigned(id));

-- Configurar RLS para project_members
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para project_members
CREATE POLICY "Users can view their own project memberships"
ON project_members
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Managers can view members of projects they manage"
ON project_members
FOR SELECT
USING (is_project_manager(project_id));

CREATE POLICY "Admins can view all project memberships"
ON project_members
FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can manage all project memberships"
ON project_members
FOR ALL
USING (is_admin());

CREATE POLICY "Managers can manage members in their projects"
ON project_members
FOR ALL
USING (is_project_manager(project_id));

-- Configurar RLS para task_assignments
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para task_assignments
CREATE POLICY "Users can view their own task assignments"
ON task_assignments
FOR SELECT
USING (assigned_to = auth.uid());

CREATE POLICY "Project managers can view task assignments in their projects"
ON task_assignments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_assignments.task_id
    AND is_project_manager(t.project_id)
  )
);

CREATE POLICY "Admins can view all task assignments"
ON task_assignments
FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can manage all task assignments"
ON task_assignments
FOR ALL
USING (is_admin());

CREATE POLICY "Project managers can manage task assignments in their projects"
ON task_assignments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_assignments.task_id
    AND is_project_manager(t.project_id)
  )
);

CREATE POLICY "Users can update their own task assignment status"
ON task_assignments
FOR UPDATE
USING (assigned_to = auth.uid())
WITH CHECK (
  assigned_to = auth.uid() AND
  (NEW.status IN ('accepted', 'declined') AND OLD.assigned_to = NEW.assigned_to)
);

-- Trigger para sincronizar profiles com auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'member');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
