import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { showNotification } from '../utils/notifications';

export interface ProjectMember {
  id: string;
  user_id: string;
  project_id: string;
  role: 'manager' | 'member';
  permissions: Record<string, any>;
  assigned_at: string;
  assigned_by: string;
  // Campos antigos para compatibilidade
  userId?: string;
  projectId?: string;
  assignedAt?: string;
  assignedBy?: string;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  assigned_to: string;
  assigned_by: string;
  assigned_at: string;
  status: 'assigned' | 'accepted' | 'declined';
  // Campos antigos para compatibilidade
  taskId?: string;
  assignedTo?: string;
  assignedBy?: string;
  assignedAt?: string;
}

export interface UserPermissions {
  projectIds: string[];  // Projects that the user can access
  taskIds: string[];     // Specific tasks that the user can access
  calendarAccess: boolean; // Whether the user can access the calendar
  trackingAccess: boolean; // Whether the user can access tracking
  projectMemberships?: ProjectMember[]; // Project members (new system)
  taskAssignments?: TaskAssignment[]; // Task assignments (new system)
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'active' | 'inactive';
  avatarUrl?: string;
  createdAt: string;
  lastLogin?: string | null;
  permissions?: UserPermissions; // Permissões do usuário
}

export interface UserCreateData extends Omit<User, 'id' | 'createdAt'> {
  password?: string; // Senha opcional para novos usuários
}

interface UserStore {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  createUser: (data: UserCreateData) => Promise<User | null>;
  updateUser: (id: string, data: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  getUserProjects: (userId: string) => string[];
  updateUserPermissions: (userId: string, permissions: UserPermissions) => Promise<boolean>;
  hasPermissionForProject: (userId: string, projectId: string) => boolean;
  hasPermissionForTask: (userId: string, taskId: string) => boolean;
  hasCalendarAccess: (userId: string) => boolean;
  hasTrackingAccess: (userId: string) => boolean;
  // Novas funções para o sistema de permissões baseado em project_members e task_assignments
  fetchProjectMemberships: (userId: string) => Promise<ProjectMember[]>;
  fetchTaskAssignments: (userId: string) => Promise<TaskAssignment[]>;
  addProjectMember: (userId: string, projectId: string, role: 'manager' | 'member') => Promise<boolean>;
  removeProjectMember: (membershipId: string) => Promise<boolean>;
  assignTask: (taskId: string, userId: string) => Promise<boolean>;
  unassignTask: (assignmentId: string) => Promise<boolean>;
  updateTaskAssignmentStatus: (assignmentId: string, status: 'accepted' | 'declined') => Promise<boolean>;
}

const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  
  // Implementation of new functions for the permissions system
  fetchProjectMemberships: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      // Mapear os dados mantendo tanto o formato snake_case quanto camelCase para compatibilidade
      const memberships: ProjectMember[] = data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        project_id: item.project_id,
        role: item.role,
        permissions: item.permissions,
        assigned_at: item.assigned_at,
        assigned_by: item.assigned_by,
        // Campos antigos para compatibilidade
        userId: item.user_id,
        projectId: item.project_id,
        assignedAt: item.assigned_at,
        assignedBy: item.assigned_by
      }));

      // Atualizar o usuário com as novas informações de associação
      set(state => {
        const updatedUsers = state.users.map(user => {
          if (user.id === userId && user.permissions) {
            return {
              ...user,
              permissions: {
                ...user.permissions,
                projectMemberships: memberships,
                projectIds: [...(user.permissions.projectIds || []), ...memberships.map(m => m.projectId)]
              }
            } as User;
          }
          return user;
        });

        // Também atualizar o usuário atual se for o mesmo
        const updatedCurrentUser = state.currentUser?.id === userId && state.currentUser?.permissions
          ? {
              ...state.currentUser,
              permissions: {
                ...state.currentUser.permissions,
                projectMemberships: memberships,
                projectIds: [...(state.currentUser.permissions.projectIds || []), ...memberships.map(m => m.projectId)]
              }
            } as User
          : state.currentUser;

        return {
          users: updatedUsers,
          currentUser: updatedCurrentUser
        };
      });

      return memberships;
    } catch (error: any) {
      console.error('Error fetching project memberships:', error.message);
      return [];
    }
  },

  fetchTaskAssignments: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('task_assignments')
        .select('*')
        .eq('assigned_to', userId);

      if (error) throw error;

      // Mapear os dados mantendo tanto o formato snake_case quanto camelCase para compatibilidade
      const assignments: TaskAssignment[] = data.map(item => ({
        id: item.id,
        task_id: item.task_id,
        assigned_to: item.assigned_to,
        assigned_by: item.assigned_by,
        assigned_at: item.assigned_at,
        status: item.status,
        // Campos antigos para compatibilidade
        taskId: item.task_id,
        assignedTo: item.assigned_to,
        assignedBy: item.assigned_by,
        assignedAt: item.assigned_at
      }));

      // Atualizar o usuário com as novas informações de atribuição
      set(state => {
        const updatedUsers = state.users.map(user => {
          if (user.id === userId && user.permissions) {
            return {
              ...user,
              permissions: {
                ...user.permissions,
                taskAssignments: assignments,
                taskIds: [...(user.permissions.taskIds || []), ...assignments.map(a => a.taskId)]
              }
            } as User;
          }
          return user;
        });

        // Também atualizar o usuário atual se for o mesmo
        const updatedCurrentUser = state.currentUser?.id === userId && state.currentUser?.permissions
          ? {
              ...state.currentUser,
              permissions: {
                ...state.currentUser.permissions,
                taskAssignments: assignments,
                taskIds: [...(state.currentUser.permissions.taskIds || []), ...assignments.map(a => a.taskId)]
              }
            } as User
          : state.currentUser;

        return {
          users: updatedUsers,
          currentUser: updatedCurrentUser
        };
      });

      return assignments;
    } catch (error: any) {
      console.error('Error fetching task assignments:', error.message);
      return [];
    }
  },

  addProjectMember: async (userId: string, projectId: string, role: 'manager' | 'member') => {
    set({ loading: true, error: null });
    try {
      // Obter o ID do usuário atual para usar como assigned_by
      const currentUserId = get().currentUser?.id;
      if (!currentUserId) throw new Error('Usuário não autenticado');

      // Removendo .select() e .single() para evitar variável data não utilizada
      const { error } = await supabase
        .from('project_members')
        .insert({
          user_id: userId,
          project_id: projectId,
          role: role,
          assigned_by: currentUserId,
          permissions: {}
        });

      if (error) throw error;

      // Atualizar a lista de membros do projeto para o usuário
      await get().fetchProjectMemberships(userId);

      set({ loading: false });
      showNotification('Membro adicionado ao projeto com sucesso', 'success');
      return true;
    } catch (error: any) {
      console.error('Error adding project member:', error.message);
      set({ error: error.message, loading: false });
      showNotification(`Erro ao adicionar membro ao projeto: ${error.message}`, 'error');
      return false;
    }
  },

  removeProjectMember: async (membershipId: string) => {
    set({ loading: true, error: null });
    try {
      // Primeiro, obter o userId para atualizar o estado depois
      const { data: memberData, error: fetchError } = await supabase
        .from('project_members')
        .select('user_id')
        .eq('id', membershipId)
        .single();

      if (fetchError) throw fetchError;
      const userId = memberData.user_id;

      // Remover o membro do projeto
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', membershipId);

      if (error) throw error;

      // Atualizar a lista de membros do projeto para o usuário
      await get().fetchProjectMemberships(userId);

      set({ loading: false });
      showNotification('Membro removido do projeto com sucesso', 'success');
      return true;
    } catch (error: any) {
      console.error('Error removing project member:', error.message);
      set({ error: error.message, loading: false });
      showNotification(`Erro ao remover membro do projeto: ${error.message}`, 'error');
      return false;
    }
  },

  assignTask: async (taskId: string, userId: string) => {
    set({ loading: true, error: null });
    try {
      // Obter o ID do usuário atual para usar como assigned_by
      const currentUserId = get().currentUser?.id;
      if (!currentUserId) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('task_assignments')
        .insert({
          task_id: taskId,
          assigned_to: userId,
          assigned_by: currentUserId,
          status: 'assigned'
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar a lista de tarefas atribuídas ao usuário
      await get().fetchTaskAssignments(userId);

      set({ loading: false });
      showNotification('Tarefa atribuída com sucesso', 'success');
      return true;
    } catch (error: any) {
      console.error('Error assigning task:', error.message);
      set({ error: error.message, loading: false });
      showNotification(`Erro ao atribuir tarefa: ${error.message}`, 'error');
      return false;
    }
  },

  unassignTask: async (assignmentId: string) => {
    set({ loading: true, error: null });
    try {
      // Primeiro, obter o userId para atualizar o estado depois
      const { data: assignmentData, error: fetchError } = await supabase
        .from('task_assignments')
        .select('assigned_to')
        .eq('id', assignmentId)
        .single();

      if (fetchError) throw fetchError;
      const userId = assignmentData.assigned_to;

      // Remover a atribuição da tarefa
      const { error } = await supabase
        .from('task_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      // Atualizar a lista de tarefas atribuídas ao usuário
      await get().fetchTaskAssignments(userId);

      set({ loading: false });
      showNotification('Atribuição de tarefa removida com sucesso', 'success');
      return true;
    } catch (error: any) {
      console.error('Error unassigning task:', error.message);
      set({ error: error.message, loading: false });
      showNotification(`Erro ao remover atribuição de tarefa: ${error.message}`, 'error');
      return false;
    }
  },

  updateTaskAssignmentStatus: async (assignmentId: string, status: 'accepted' | 'declined') => {
    set({ loading: true, error: null });
    try {
      // Primeiro, obter o userId para atualizar o estado depois
      const { data: assignmentData, error: fetchError } = await supabase
        .from('task_assignments')
        .select('assigned_to')
        .eq('id', assignmentId)
        .single();

      if (fetchError) throw fetchError;
      const userId = assignmentData.assigned_to;

      // Atualizar o status da atribuição
      const { error } = await supabase
        .from('task_assignments')
        .update({ status })
        .eq('id', assignmentId);

      if (error) throw error;

      // Atualizar a lista de tarefas atribuídas ao usuário
      await get().fetchTaskAssignments(userId);

      set({ loading: false });
      showNotification(`Status da tarefa atualizado para ${status}`, 'success');
      return true;
    } catch (error: any) {
      console.error('Error updating task assignment status:', error.message);
      set({ error: error.message, loading: false });
      showNotification(`Erro ao atualizar status da tarefa: ${error.message}`, 'error');
      return false;
    }
  },

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) throw error;
      
      // Buscar permissões dos usuários
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('user_permissions')
        .select('*');
        
      if (permissionsError) {
        console.error('Erro ao buscar permissões:', permissionsError);
      }
      
      // Mapear os dados do formato snake_case para camelCase
      const mappedUsers = data.map(user => {
        // Encontrar permissões do usuário
        const userPermissions = permissionsData?.find(p => p.user_id === user.id);
        
        return {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          status: user.status || 'active',
          avatarUrl: user.avatar_url,
          createdAt: user.created_at,
          lastLogin: user.last_login,
          permissions: userPermissions ? {
            projectIds: userPermissions.project_ids || [],
            taskIds: userPermissions.task_ids || [],
            calendarAccess: userPermissions.calendar_access || false,
            trackingAccess: userPermissions.tracking_access || false
          } : undefined
        };
      });

      set({ users: mappedUsers as User[], loading: false });
    } catch (error: any) {
      console.error('Error fetching users:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  fetchCurrentUser: async () => {
    set({ loading: true, error: null });
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      if (!sessionData.session) {
        set({ currentUser: null, loading: false });
        return;
      }

      const userId = sessionData.session.user.id;

      // Verificar se o usuário existe na tabela profiles (novo sistema)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        // Se não encontrado na tabela profiles, buscar na tabela users (sistema antigo)
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId);
          
        // Verificar se o usuário foi encontrado
        if (error) throw error;
        if (!data || data.length === 0) {
          // Usuário não encontrado em nenhuma tabela
          console.log('Usuário autenticado, mas não encontrado nas tabelas. ID:', userId);
          set({ currentUser: null, loading: false });
          return;
        }
        
        // Usar o primeiro resultado encontrado da tabela users
        const userData = data[0];

        // Buscar permissões do usuário (sistema antigo)
        let permissionsData = null;
        const { data: permData, error: permissionsError } = await supabase
          .from('user_permissions')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (permissionsError) {
          if (permissionsError.code === 'PGRST116') { // PGRST116 = No rows found
            // Criar permissões padrão para o usuário se não existirem
            const { data: newPermData, error: createError } = await supabase
              .from('user_permissions')
              .insert({
                user_id: userId,
                project_ids: [],
                task_ids: [],
                calendar_access: false,
                tracking_access: false
              })
              .select()
              .single();
            
            if (createError) {
              console.error('Erro ao criar permissões padrão para o usuário:', createError);
            } else {
              permissionsData = newPermData;
              console.log('Permissões padrão criadas para o usuário:', userId);
            }
          } else {
            console.error('Erro ao buscar permissões do usuário:', permissionsError);
          }
        } else {
          permissionsData = permData;
        }
        
        // Mapear os dados do formato snake_case para camelCase (sistema antigo)
        const mappedUser = {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          role: userData.role,
          status: userData.status || 'active',
          avatarUrl: userData.avatar_url,
          createdAt: userData.created_at,
          lastLogin: userData.last_login,
          permissions: permissionsData ? {
            projectIds: permissionsData.project_ids || [],
            taskIds: permissionsData.task_ids || [],
            calendarAccess: permissionsData.calendar_access || false,
            trackingAccess: permissionsData.tracking_access || false
          } : undefined
        };

        set({ currentUser: mappedUser as User, loading: false });
      } else {
        // Usuário encontrado na tabela profiles (novo sistema)
        
        // Buscar associações de projetos
        const { data: projectMemberships, error: membershipsError } = await supabase
          .from('project_members')
          .select('*')
          .eq('user_id', userId);
          
        if (membershipsError) {
          console.error('Erro ao buscar associações de projetos:', membershipsError);
        }
        
        // Buscar atribuições de tarefas
        const { data: taskAssignments, error: assignmentsError } = await supabase
          .from('task_assignments')
          .select('*')
          .eq('assigned_to', userId);
          
        if (assignmentsError) {
          console.error('Erro ao buscar atribuições de tarefas:', assignmentsError);
        }
        
        // Mapear os dados do formato snake_case para camelCase (novo sistema)
        const mappedUser = {
          id: profileData.id,
          email: profileData.email,
          firstName: profileData.full_name.split(' ')[0],
          lastName: profileData.full_name.split(' ').slice(1).join(' '),
          role: profileData.role,
          status: 'active',
          avatarUrl: profileData.avatar_url,
          createdAt: profileData.created_at,
          lastLogin: null,
          permissions: {
            // Manter compatibilidade com o sistema antigo
            projectIds: projectMemberships ? projectMemberships.map(pm => pm.project_id) : [],
            taskIds: taskAssignments ? taskAssignments.map(ta => ta.task_id) : [],
            calendarAccess: true, // Por padrão, permitir acesso ao calendário no novo sistema
            trackingAccess: true, // Por padrão, permitir acesso ao tracking no novo sistema
            // Adicionar dados do novo sistema
            projectMemberships: projectMemberships ? projectMemberships.map(pm => ({
              id: pm.id,
              userId: pm.user_id,
              projectId: pm.project_id,
              role: pm.role,
              permissions: pm.permissions,
              assignedAt: pm.assigned_at,
              assignedBy: pm.assigned_by
            })) : [],
            taskAssignments: taskAssignments ? taskAssignments.map(ta => ({
              id: ta.id,
              taskId: ta.task_id,
              assignedTo: ta.assigned_to,
              assignedBy: ta.assigned_by,
              assignedAt: ta.assigned_at,
              status: ta.status
            })) : []
          }
        };

        set({ currentUser: mappedUser as User, loading: false });
      }
    } catch (error: any) {
      console.error('Error fetching current user:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  createUser: async (data) => {
    set({ loading: true, error: null });
    try {
      // Verificar se o usuário já existe pelo email
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', data.email)
        .maybeSingle();

      if (checkError) {
        console.error('Erro ao verificar usuário existente:', checkError);
      } else if (existingUser) {
        throw new Error(`Usuário com email ${data.email} já existe no sistema`);
      }
      
      // Usar a senha fornecida pelo usuário ou gerar uma senha temporária
      const password = data.password || Math.random().toString(36).slice(-8);
      
      // 1. Primeiro, criar o usuário no sistema de autenticação do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: password,
        options: {
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role
          }
        }
      });
      
      if (authError) throw authError;
      if (!authData.user) {
        throw new Error('Falha ao criar usuário no sistema de autenticação');
      }
      
      // O trigger handle_new_user agora cuidará da criação do usuário na tabela 'users'
      // e das permissões padrão, então não precisamos mais fazer isso manualmente.
      // Vamos apenas buscar o usuário que foi criado pelo trigger.
      
      // Aguardar um momento para o trigger ser executado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Buscar o usuário criado
      const { data: newUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();
  
      if (error) {
        console.error('Erro ao buscar usuário criado:', error);
        throw error;
      }
      
      // Verificar se as permissões foram criadas pelo trigger
      const { data: permData } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', authData.user.id)
        .maybeSingle();
        
      // Se as permissões não foram criadas pelo trigger, criar manualmente
      if (!permData) {
        const { error: permError } = await supabase
          .from('user_permissions')
          .insert({
            user_id: authData.user.id,
            project_ids: [],
            task_ids: [],
            calendar_access: false,
            tracking_access: false
          });
    
        if (permError) {
          console.error('Erro ao criar permissões padrão:', permError);
        }
      }
  
      // Mapear os dados retornados do formato snake_case para camelCase
      const createdUser: User = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role,
        status: newUser.status,
        avatarUrl: newUser.avatar_url,
        createdAt: newUser.created_at,
        permissions: {
          projectIds: [],
          taskIds: [],
          calendarAccess: false,
          trackingAccess: false
        }
      };
  
      set(state => ({
        users: [...state.users, createdUser],
        loading: false,
      }));
  
      // Exibir a senha apenas se foi gerada automaticamente
      if (!data.password) {
        console.log(`Senha temporária para ${data.email}: ${password}`);
      }
      
      showNotification(
        data.password 
          ? 'Membro criado com sucesso.' 
          : 'Membro criado com sucesso. Uma senha temporária foi gerada.',
        'success'
      );
      return createdUser;
    } catch (error: any) {
      console.error('Error creating user:', error.message);
      set({ error: error.message, loading: false });
      showNotification(`Erro ao criar membro: ${error.message}`, 'error');
      return null;
    }
  },

  updateUser: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      // Update users list
      set(state => ({
        users: state.users.map(user =>
          user.id === id ? { ...user, ...data } : user
        ),
        // Also update currentUser if it's the same user
        currentUser: state.currentUser?.id === id
          ? { ...state.currentUser, ...data }
          : state.currentUser,
        loading: false,
      }));

      showNotification('Membro atualizado com sucesso', 'success');
      return true;
    } catch (error: any) {
      console.error('Error updating user:', error.message);
      set({ error: error.message, loading: false });
      showNotification(`Erro ao atualizar membro: ${error.message}`, 'error');
      return false;
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null });
    try {
      // 1. Primeiro, obter o email do usuário para referência
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('email')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      
      // 2. Excluir permissões do usuário
      const { error: permError } = await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', id);

      if (permError) {
        console.error('Erro ao excluir permissões do usuário:', permError);
      }

      // 3. Excluir o usuário da tabela 'users'
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 4. Excluir o usuário do sistema de autenticação
      // Nota: Para excluir usuários do sistema de autenticação, é necessário
      // usar a API REST do Supabase ou o painel administrativo
      
      // Como não podemos excluir diretamente via cliente JavaScript,
      // registramos o ID e email do usuário para referência futura
      console.log(`Usuário removido da tabela 'users', mas ainda existe no sistema de autenticação.`);
      console.log(`ID: ${id}, Email: ${userData.email}`);
      console.log(`Para remover completamente, acesse o painel do Supabase > Authentication > Users`);

      set(state => ({
        users: state.users.filter(user => user.id !== id),
        loading: false,
      }));

      showNotification('Membro removido com sucesso', 'success');
      return true;
    } catch (error: any) {
      console.error('Error deleting user:', error.message);
      set({ error: error.message, loading: false });
      showNotification(`Erro ao remover membro: ${error.message}`, 'error');
      return false;
    }
  },

  getUserProjects: (userId) => {
    const { users } = get();
    const user = users.find(u => u.id === userId);
    
    if (user?.permissions?.projectIds) {
      return user.permissions.projectIds;
    }
    
    // Se o usuário for admin, retorna todos os projetos (implementação completa seria feita com o banco de dados)
    if (user?.role === 'admin') {
      return []; // Aqui retornaria todos os IDs de projetos
    }
    
    return [];
  },
  
  updateUserPermissions: async (userId: string, permissions: UserPermissions) => {
    set({ loading: true, error: null });
    try {
      // Verificar se o usuário já tem permissões
      const { error: checkError } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      let updateError = null;
      
      if (checkError && checkError.code === 'PGRST116') {
        // Se não existir, criar novo registro
        const { error } = await supabase
          .from('user_permissions')
          .insert({
            user_id: userId,
            project_ids: permissions.projectIds,
            task_ids: permissions.taskIds,
            calendar_access: permissions.calendarAccess,
            tracking_access: permissions.trackingAccess
          });
        
        updateError = error;
      } else {
        // Se existir, atualizar
        const { error } = await supabase
          .from('user_permissions')
          .update({
            project_ids: permissions.projectIds,
            task_ids: permissions.taskIds,
            calendar_access: permissions.calendarAccess,
            tracking_access: permissions.trackingAccess,
            updated_at: new Date()
          })
          .eq('user_id', userId);
        
        updateError = error;
      }
      
      if (updateError) {
        console.error('Error updating user permissions:', updateError);
        set({ error: updateError.message, loading: false });
        showNotification(`Erro ao atualizar permissões: ${updateError.message}`, 'error');
        return false;
      }
      
      // Atualizar o usuário atual se for o mesmo
      const { currentUser } = get();
      if (currentUser && currentUser.id === userId) {
        set({
          currentUser: {
            ...currentUser,
            permissions
          }
        });
      }
      
      // Atualizar na lista de usuários também
      set(state => ({
        users: state.users.map(user => 
          user.id === userId ? { ...user, permissions } : user
        )
      }));
      
      set({ loading: false });
      showNotification('Permissões atualizadas com sucesso', 'success');
      return true;
    } catch (error: any) {
      console.error('Error updating user permissions:', error);
      set({ error: error.message, loading: false });
      showNotification(`Erro ao atualizar permissões: ${error.message}`, 'error');
      return false;
    }
  },
  
  hasPermissionForProject: (userId, projectId) => {
    const { users } = get();
    const user = users.find(u => u.id === userId);
    
    // Administradores têm acesso a todos os projetos
    if (user?.role === 'admin') return true;
    
    // Verificar se o projeto está na lista de permissões do usuário
    return user?.permissions?.projectIds.includes(projectId) || false;
  },
  
  hasPermissionForTask: (userId, taskId) => {
    const { users } = get();
    const user = users.find(u => u.id === userId);
    
    // Administradores têm acesso a todas as tarefas
    if (user?.role === 'admin') return true;
    
    // Verificar se a tarefa está na lista de permissões do usuário
    return user?.permissions?.taskIds.includes(taskId) || false;
  },
  
  hasCalendarAccess: (userId) => {
    const { users } = get();
    const user = users.find(u => u.id === userId);
    
    // Administradores têm acesso a tudo
    if (user?.role === 'admin') return true;
    
    return user?.permissions?.calendarAccess || false;
  },
  
  hasTrackingAccess: (userId) => {
    const { users } = get();
    const user = users.find(u => u.id === userId);
    
    // Administradores têm acesso a tudo
    if (user?.role === 'admin') return true;
    
    return user?.permissions?.trackingAccess || false;
  },
}));

export default useUserStore;
