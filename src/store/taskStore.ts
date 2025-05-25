import { create } from 'zustand';
import { Task } from '../types';
import { supabase } from '../lib/supabaseClient';
import { showNotification } from '../utils/notifications';

interface TaskState {
  tasks: Task[];
  projectTasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  error: string | null;
  
  fetchTasks: () => Promise<void>;
  fetchProjectTasks: (projectId: string) => Promise<void>;
  getTask: (id: string) => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<boolean>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<boolean>;
  updateTaskStatus: (id: string, status: Task['status']) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
}

const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  projectTasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
  
  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Fetch tasks from Supabase
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert data from Supabase format to application format
      const tasks: Task[] = data.map(item => ({
        id: item.id,
        projectId: item.project_id,
        title: item.title,
        description: item.description,
        assigneeId: item.assignee_id || '',
        priority: item.priority,
        status: item.status,
        createdAt: item.created_at,
        startDate: item.start_date,
        dueDate: item.due_date,
        estimatedHours: item.estimated_hours,
        parentTaskId: item.parent_task_id
      }));
      
      set({ tasks, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, isLoading: false });
      showNotification(`Failed to load tasks: ${errorMessage}`, 'error');
    }
  },
  
  fetchProjectTasks: async (projectId) => {
    set({ isLoading: true, error: null });
    
    try {
      // Fetch tasks for the specific project from Supabase
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert data from Supabase format to application format
      const projectTasks: Task[] = data.map(item => ({
        id: item.id,
        projectId: item.project_id,
        title: item.title,
        description: item.description,
        assigneeId: item.assignee_id || '',
        priority: item.priority,
        status: item.status,
        createdAt: item.created_at,
        startDate: item.start_date,
        dueDate: item.due_date,
        estimatedHours: item.estimated_hours,
        parentTaskId: item.parent_task_id
      }));
      
      set({ projectTasks, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, isLoading: false });
      showNotification(`Failed to load project tasks: ${errorMessage}`, 'error');
    }
  },
  
  getTask: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Fetch specific task from Supabase
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Task not found');
      
      // Convert data from Supabase format to application format
      const task: Task = {
        id: data.id,
        projectId: data.project_id,
        title: data.title,
        description: data.description,
        assigneeId: data.assignee_id || '',
        priority: data.priority,
        status: data.status,
        createdAt: data.created_at,
        startDate: data.start_date,
        dueDate: data.due_date,
        estimatedHours: data.estimated_hours,
        parentTaskId: data.parent_task_id
      };
      
      set({ currentTask: task, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, isLoading: false });
      showNotification(`Failed to load task: ${errorMessage}`, 'error');
    }
  },
  
  createTask: async (task) => {
    set({ isLoading: true, error: null });
    
    try {
      // Convert data from application format to Supabase format
      const supabaseData = {
        project_id: task.projectId,
        title: task.title,
        description: task.description,
        assignee_id: task.assigneeId || null,
        priority: task.priority,
        status: task.status,
        start_date: task.startDate,
        due_date: task.dueDate,
        estimated_hours: task.estimatedHours,
        parent_task_id: task.parentTaskId || null
      };
      
      // Create task in Supabase
      const { error: insertError } = await supabase
        .from('tasks')
        .insert([supabaseData]);
      
      if (insertError) throw insertError;
      
      // Fetch the newly created task using title and other unique fields
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('title', task.title)
        .eq('description', task.description || '')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Failed to create task: No data returned');
      
      // Convert data from Supabase format to application format
      const newTask: Task = {
        id: data.id,
        projectId: data.project_id,
        title: data.title,
        description: data.description,
        assigneeId: data.assignee_id || '',
        priority: data.priority,
        status: data.status,
        createdAt: data.created_at,
        startDate: data.start_date,
        dueDate: data.due_date,
        estimatedHours: data.estimated_hours,
        parentTaskId: data.parent_task_id
      };
      
      // Update local state
      set(state => ({
        tasks: [newTask, ...state.tasks],
        projectTasks: task.projectId === get().projectTasks[0]?.projectId
          ? [newTask, ...state.projectTasks]
          : state.projectTasks,
        isLoading: false
      }));
      
      showNotification('Task created successfully', 'success');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, isLoading: false });
      showNotification(`Failed to create task: ${errorMessage}`, 'error');
      return false;
    }
  },
  
  updateTask: async (id, taskData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Convert data from application format to Supabase format
      const supabaseData: Record<string, any> = {};
      
      if (taskData.title !== undefined) supabaseData.title = taskData.title;
      if (taskData.description !== undefined) supabaseData.description = taskData.description;
      if (taskData.projectId !== undefined) supabaseData.project_id = taskData.projectId;
      if (taskData.assigneeId !== undefined) supabaseData.assignee_id = taskData.assigneeId || null;
      if (taskData.priority !== undefined) supabaseData.priority = taskData.priority;
      if (taskData.status !== undefined) supabaseData.status = taskData.status;
      if (taskData.startDate !== undefined) supabaseData.start_date = taskData.startDate;
      if (taskData.dueDate !== undefined) supabaseData.due_date = taskData.dueDate;
      if (taskData.estimatedHours !== undefined) supabaseData.estimated_hours = taskData.estimatedHours;
      if (taskData.parentTaskId !== undefined) supabaseData.parent_task_id = taskData.parentTaskId || null;
      
      // Update task in Supabase
      const { error: updateError } = await supabase
        .from('tasks')
        .update(supabaseData)
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      // Fetch the updated task
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Task not found');
      
      // Convert data from Supabase format to application format
      const updatedTask: Task = {
        id: data.id,
        projectId: data.project_id,
        title: data.title,
        description: data.description,
        assigneeId: data.assignee_id || '',
        priority: data.priority,
        status: data.status,
        createdAt: data.created_at,
        startDate: data.start_date,
        dueDate: data.due_date,
        estimatedHours: data.estimated_hours,
        parentTaskId: data.parent_task_id
      };
      
      // Update local state
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? updatedTask : t),
        projectTasks: state.projectTasks.map(t => t.id === id ? updatedTask : t),
        currentTask: state.currentTask?.id === id ? updatedTask : state.currentTask,
        isLoading: false
      }));
      
      showNotification('Task updated successfully', 'success');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, isLoading: false });
      showNotification(`Failed to update task: ${errorMessage}`, 'error');
      return false;
    }
  },
  
  updateTaskStatus: async (id, status) => {
    return get().updateTask(id, { status });
  },
  
  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Delete task from Supabase
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== id),
        projectTasks: state.projectTasks.filter(t => t.id !== id),
        currentTask: state.currentTask?.id === id ? null : state.currentTask,
        isLoading: false
      }));
      
      showNotification('Task deleted successfully', 'success');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, isLoading: false });
      showNotification(`Failed to delete task: ${errorMessage}`, 'error');
      return false;
    }
  }
}));

export default useTaskStore;
