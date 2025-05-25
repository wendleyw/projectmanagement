export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  created_at: string;
  start_date?: string;
  due_date?: string;
  estimated_hours?: number;
  parent_task_id?: string;
}

export interface TaskWithRelations extends Task {
  project?: {
    id: string;
    name: string;
  };
  assignee?: {
    id: string;
    full_name: string;
    email: string;
  };
  assignments?: {
    id: string;
    assigned_to: string;
    status: 'assigned' | 'accepted' | 'declined';
    assignee: {
      id: string;
      full_name: string;
      email: string;
    };
  }[];
  subtasks?: Task[];
  parent_task?: Task;
  time_entries?: {
    id: string;
    duration: number;
  }[];
  total_time_spent?: number;
}
