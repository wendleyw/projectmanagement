export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          avatar_url: string | null
          role: 'admin' | 'manager' | 'member' | 'client'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          avatar_url?: string | null
          role: 'admin' | 'manager' | 'member' | 'client'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'member' | 'client'
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          contact_name: string
          email: string
          phone: string
          address: string | null
          status: 'active' | 'inactive'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_name: string
          email: string
          phone: string
          address?: string | null
          status: 'active' | 'inactive'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_name?: string
          email?: string
          phone?: string
          address?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string
          client_id: string | null
          start_date: string
          end_date: string
          actual_end_date: string | null
          status: 'planned' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled'
          budget: number | null
          manager_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          client_id?: string | null
          start_date: string
          end_date: string
          actual_end_date?: string | null
          status: 'planned' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled'
          budget?: number | null
          manager_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          client_id?: string | null
          start_date?: string
          end_date?: string
          actual_end_date?: string | null
          status?: 'planned' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled'
          budget?: number | null
          manager_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string | null
          title: string
          description: string
          assignee_id: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked'
          created_at: string
          start_date: string | null
          due_date: string | null
          estimated_hours: number | null
          parent_task_id: string | null
        }
        Insert: {
          id?: string
          project_id?: string | null
          title: string
          description: string
          assignee_id?: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked'
          created_at?: string
          start_date?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          parent_task_id?: string | null
        }
        Update: {
          id?: string
          project_id?: string | null
          title?: string
          description?: string
          assignee_id?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked'
          created_at?: string
          start_date?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          parent_task_id?: string | null
        }
      }
    }
  }
}