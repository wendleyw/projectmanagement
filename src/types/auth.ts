import { Project } from './project';
import { Task } from './task';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'member';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  user_id: string;
  project_id: string;
  role: 'manager' | 'member';
  permissions: Record<string, boolean>;
  assigned_at: string;
  assigned_by: string;
  user?: User;
  project?: Project;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  assigned_to: string;
  assigned_by: string;
  assigned_at: string;
  status: 'assigned' | 'accepted' | 'declined';
  task?: Task;
  assignee?: User;
  assigner?: User;
}

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

// Interface para o contexto de autenticação
export interface AuthContext {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

// Interface para a sessão do usuário
export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

// Interface para o provedor de autenticação
export interface AuthProviderProps {
  children: React.ReactNode;
}

// Interface para o resultado da autenticação
export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: Error | null;
}

// Interface para as permissões do usuário em um projeto
export interface ProjectPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
  canManageTasks: boolean;
}

// Interface para as permissões do usuário em uma tarefa
export interface TaskPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAssign: boolean;
  canTrackTime: boolean;
}
