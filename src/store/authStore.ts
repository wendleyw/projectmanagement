import { create } from 'zustand';
import { 
  User, 
  Session, 
  Permission, 
  ProjectMember, 
  TaskAssignment,
  Project,
  Task
} from '../types';
import { supabase } from '../lib/supabaseClient';

// Interface for authentication and permissions state
interface AuthState {
  user: User | null;
  session: Session | null;
  userProjects: Project[];
  userTasks: Task[];
  permissions: Permission[];
  projectMemberships: ProjectMember[];
  taskAssignments: TaskAssignment[];
  isLoading: boolean;
  error: string | null;
  
  // Authentication actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setUserProjects: (projects: Project[]) => void;
  loadUserPermissions: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<boolean>;
  
  // Verificações de permissões
  canViewProject: (projectId: string) => boolean;
  canEditProject: (projectId: string) => boolean;
  canViewTask: (taskId: string) => boolean;
  canEditTask: (taskId: string) => boolean;
  hasRole: (role: string) => boolean;
  isProjectManager: (projectId: string) => boolean;
}

// Authentication and permissions store
const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  session: null,
  userProjects: [],
  userTasks: [],
  permissions: [],
  projectMemberships: [],
  taskAssignments: [],
  isLoading: false,
  error: null,

  // Actions to manage state
  setUser: (user: User | null) => set({ user }),
  
  setSession: (session: Session | null) => set({ session }),
  
  setUserProjects: (projects: Project[]) => set({ userProjects: projects }),
  
  // Load current user permissions
  loadUserPermissions: async () => {
    const { user } = get();
    if (!user) return;
    
    set({ isLoading: true });
    
    try {
      // Buscar associações de projetos do usuário
      const { data: memberships, error: membershipError } = await supabase
        .from('project_members')
        .select(`
          id,
          user_id,
          project_id,
          role,
          permissions,
          assigned_at,
          assigned_by
        `)
        .eq('user_id', user.id);
      
      if (membershipError) throw membershipError;
      
      // Buscar atribuições de tarefas do usuário
      const { data: assignments, error: assignmentError } = await supabase
        .from('task_assignments')
        .select(`
          id,
          task_id,
          assigned_to,
          assigned_by,
          assigned_at,
          status
        `)
        .eq('assigned_to', user.id);
      
      if (assignmentError) throw assignmentError;
      
      // Buscar projetos associados ao usuário
      const projectIds = memberships.map(m => m.project_id);
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .in('id', projectIds);
      
      if (projectsError) throw projectsError;
      
      // Buscar tarefas associadas ao usuário
      const taskIds = assignments.map(a => a.task_id);
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .in('id', taskIds);
      
      if (tasksError) throw tasksError;
      
      // Preparar os dados para o estado
      const projects = (projectsData || []).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        start_date: p.start_date || new Date().toISOString(),
        created_at: p.created_at || new Date().toISOString(),
        updated_at: p.updated_at || new Date().toISOString()
      })) as Project[];
      
      const tasks = (tasksData || []).map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        project_id: t.project_id,
        created_at: t.created_at || new Date().toISOString()
      })) as Task[];
      
      // Gerar permissões baseadas nas associações
      const permissions: Permission[] = [];
      
      // Adicionar permissões de projeto
      memberships.forEach(membership => {
        if (membership && membership.project_id) {
          // Permissão para visualizar o projeto
          permissions.push({
            resource: 'project',
            action: 'view',
            conditions: { id: membership.project_id }
          });
          
          // Se for gerente do projeto, adicionar permissões adicionais
          if (membership.role === 'manager') {
            permissions.push({
              resource: 'project',
              action: 'edit',
              conditions: { id: membership.project_id }
            });
            
            permissions.push({
              resource: 'project',
              action: 'manage_members',
              conditions: { id: membership.project_id }
            });
          }
        }
      });
      
      // Adicionar permissões de tarefa
      assignments.forEach(assignment => {
        if (assignment && assignment.task_id) {
          // Permissão para visualizar a tarefa
          permissions.push({
            resource: 'task',
            action: 'view',
            conditions: { id: assignment.task_id }
          });
          
          // Permissão para editar a tarefa
          permissions.push({
            resource: 'task',
            action: 'edit',
            conditions: { id: assignment.task_id }
          });
        }
      });
      
      // Atualizar o estado com as permissões carregadas
      set({
        projectMemberships: memberships as ProjectMember[],
        taskAssignments: assignments.map(assignment => {
          // Encontrar a tarefa correspondente
          const task = tasks.find(t => t.id === assignment.task_id);
          return {
            ...assignment,
            task: task
          };
        }) as TaskAssignment[],
        userProjects: projects,
        userTasks: tasks,
        permissions,
        isLoading: false
      });
      
    } catch (error) {
      console.error('Error loading permissions:', error);
      set({ error: 'Failed to load permissions', isLoading: false });
    }
  },
  
  // Authentication with Supabase
  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        set({ error: error.message, isLoading: false });
        return false;
      }
      
      if (!data.user || !data.session) {
        set({ error: 'Authentication failed', isLoading: false });
        return false;
      }
      
      // Check if user exists in profiles table (new system)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      let user: User;
      
      if (profileError) {
        // Check if user exists in users table (old system)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (userError) {
          // Create a profile for the user if it doesn't exist in any table
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email || '',
              full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
              role: 'member'
            });
          
          if (createError) {
            console.error('Error creating profile:', createError);
            set({ error: 'Error creating profile', isLoading: false });
            return false;
          }
          
          // Use auth data to create the user
          user = {
            id: data.user.id,
            email: data.user.email || '',
            full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
            role: 'member',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        } else {
          // Use data from users table (old system)
          user = {
            id: userData.id,
            email: userData.email,
            full_name: `${userData.first_name} ${userData.last_name}`,
            role: userData.role as 'admin' | 'manager' | 'member',
            avatar_url: userData.avatar_url,
            created_at: userData.created_at,
            updated_at: userData.updated_at
          };
        }
      } else {
        // Use data from profiles table (new system)
        user = profileData;
      }
      
      // Create session object
      const session: Session = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + data.session.expires_in,
        user
      };
      
      // Atualizar o estado
      set({ user, session, isLoading: false });
      
      // Load user permissions
      await get().loadUserPermissions();
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      set({ error: 'An error occurred during login', isLoading: false });
      return false;
    }
  },

  // Logout
  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({
        user: null,
        session: null,
        userProjects: [],
        userTasks: [],
        permissions: [],
        projectMemberships: [],
        taskAssignments: []
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },

  // New user registration
  signUp: async (email: string, password: string, userData: Partial<User>) => {
    set({ isLoading: true, error: null });
    
    try {
      // Register the user in the authentication system
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name
          }
        }
      });
      
      if (error) {
        set({ error: error.message, isLoading: false });
        return false;
      }
      
      if (!data.user) {
        set({ error: 'Falha ao criar usuário', isLoading: false });
        return false;
      }
      
      // O trigger handle_new_user no Supabase cuidará da criação do perfil
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      set({ error: 'Ocorreu um erro durante o cadastro', isLoading: false });
      return false;
    }
  },

  // Verificações de permissões
  canViewProject: (projectId: string) => {
    const { user, permissions } = get();
    
    // Administradores podem ver todos os projetos
    if (user?.role === 'admin') return true;
    
    // Verificar permissões específicas
    return permissions.some(
      p => p.resource === 'project' && 
           p.action === 'view' && 
           p.conditions?.id === projectId
    );
  },
  
  canEditProject: (projectId: string) => {
    const { user, permissions } = get();
    
    // Administradores podem editar todos os projetos
    if (user?.role === 'admin') return true;
    
    // Verificar permissões específicas
    return permissions.some(
      p => p.resource === 'project' && 
           p.action === 'edit' && 
           p.conditions?.id === projectId
    );
  },
  
  canViewTask: (taskId: string) => {
    const { user, permissions } = get();
    
    // Administradores podem ver todas as tarefas
    if (user?.role === 'admin') return true;
    
    // Verificar permissões específicas
    return permissions.some(
      p => p.resource === 'task' && 
           p.action === 'view' && 
           p.conditions?.id === taskId
    );
  },
  
  canEditTask: (taskId: string) => {
    const { user, permissions } = get();
    
    // Administradores podem editar todas as tarefas
    if (user?.role === 'admin') return true;
    
    // Verificar permissões específicas
    return permissions.some(
      p => p.resource === 'task' && 
           p.action === 'edit' && 
           p.conditions?.id === taskId
    );
  },
  
  hasRole: (role: string) => {
    const { user } = get();
    return user?.role === role;
  },
  
  isProjectManager: (projectId: string) => {
    const { projectMemberships } = get();
    return projectMemberships.some(
      m => m.project_id === projectId && m.role === 'manager'
    );
  }
}));

export default useAuthStore;

// Hook to check if the user is authenticated
export const useIsAuthenticated = () => {
  const { user, session } = useAuthStore();
  return !!user && !!session;
};

// Hook to check if the user has a specific role
export const useHasRole = (role: string) => {
  const hasRole = useAuthStore(state => state.hasRole);
  return hasRole(role);
};

// Hook to check if the user is an administrator
export const useIsAdmin = () => {
  return useHasRole('admin');
};

// Hook to check if the user is a manager
export const useIsManager = () => {
  return useHasRole('manager');
};

// Hook to check if the user is a regular member
export const useIsMember = () => {
  return useHasRole('member');
};