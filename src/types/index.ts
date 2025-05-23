// Core application types

// User related types
export interface User {
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
  user?: User;
}

export interface ProjectMember {
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
export interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  startDate: string;
  endDate: string;
  actualEndDate?: string;
  status: 'planned' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  budget?: number;
  managerId: string;
  createdAt: string;
  updatedAt: string;
  members?: ProjectMember[];
  client?: Client;
  manager?: User;
}

// Task related types
export interface Task {
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
  project?: Project;
  assignee?: User;
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
  user?: User;
  task?: Task;
  project?: Project;
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
  user?: User;
  project?: Project;
}

// Authentication types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// UI related types
export interface SidebarState {
  isOpen: boolean;
  activeItem: string;
}