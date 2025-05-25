export interface Project {
  id: string;
  name: string;
  description?: string;
  client_id?: string;
  start_date: string;
  end_date?: string;
  actual_end_date?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  budget?: number;
  manager_id?: string;
  created_at: string;
  updated_at: string;
  team_members?: string[];
}

export interface ProjectWithRelations extends Project {
  client?: {
    id: string;
    name: string;
  };
  manager?: {
    id: string;
    full_name: string;
    email: string;
  };
  members?: {
    id: string;
    user_id: string;
    role: 'manager' | 'member';
    user: {
      id: string;
      full_name: string;
      email: string;
    };
  }[];
  tasks_count?: number;
  completed_tasks_count?: number;
}
