export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          contact_name: string
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string
          status: string
        }
        Insert: {
          address?: string | null
          contact_name: string
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone: string
          status: string
        }
        Update: {
          address?: string | null
          contact_name?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string
          status?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          actual_end_date: string | null
          budget: number | null
          client_id: string | null
          created_at: string | null
          description: string
          end_date: string
          id: string
          manager_id: string | null
          name: string
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          actual_end_date?: string | null
          budget?: number | null
          client_id?: string | null
          created_at?: string | null
          description: string
          end_date: string
          id?: string
          manager_id?: string | null
          name: string
          start_date: string
          status: string
          updated_at?: string | null
        }
        Update: {
          actual_end_date?: string | null
          budget?: number | null
          client_id?: string | null
          created_at?: string | null
          description?: string
          end_date?: string
          id?: string
          manager_id?: string | null
          name?: string
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          created_at: string | null
          description: string
          due_date: string | null
          estimated_hours: number | null
          id: string
          parent_task_id: string | null
          priority: string
          project_id: string | null
          start_date: string | null
          status: string
          title: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string | null
          description: string
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          parent_task_id?: string | null
          priority: string
          project_id?: string | null
          start_date?: string | null
          status: string
          title: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string | null
          description?: string
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          parent_task_id?: string | null
          priority?: string
          project_id?: string | null
          start_date?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          role: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
