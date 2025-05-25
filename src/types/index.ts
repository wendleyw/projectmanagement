// Core application types

// Re-export all types from auth.ts, project.ts, and task.ts
export * from './auth';
export * from './project';
export * from './task';

// Legacy types - keeping for backward compatibility
// User related types
export interface LegacyUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'member' | 'client';
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  userId: string;
  department: string;
  position: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'on_leave';
  createdAt: string;
  updatedAt: string;
  user?: LegacyUser;
}

export interface LegacyProjectMember {
  projectId: string;
  memberId: string;
  role: 'lead' | 'developer' | 'designer' | 'tester';
  assignedAt: string;
  member?: Member;
}

// Client related types
export interface Client {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

// Project related types
export interface LegacyProject {
  id: string;
  name: string;
  description: string;
  teamMembers?: string[]; // Array de IDs de usuu00e1rios
  clientId: string;
  startDate: string;
  endDate: string;
  actualEndDate?: string;
  status: 'planned' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  budget?: number;
  managerId: string;
  createdAt: string;
  updatedAt: string;
  members?: LegacyProjectMember[];
  client?: Client;
  manager?: LegacyUser;
}

// Task related types
export interface LegacyTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked';
  createdAt: string;
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  parentTaskId?: string;
  project?: LegacyProject;
  assignee?: LegacyUser;
}

// Time entry related types
export interface TimeEntry {
  id: string;
  userId: string;
  taskId: string;
  projectId: string;
  date: string;
  hours: number;
  description: string;
  billable: boolean;
  user?: LegacyUser;
  task?: LegacyTask;
  project?: LegacyProject;
}

// Calendar event types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: 'task' | 'milestone' | 'event';
  userId: string;
  projectId?: string;
  user?: LegacyUser;
  project?: LegacyProject;
}

// Authentication types
export interface AuthState {
  user: LegacyUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<LegacyUser>) => void;
}

// UI related types
export interface SidebarState {
  isOpen: boolean;
  activeItem: string;
}