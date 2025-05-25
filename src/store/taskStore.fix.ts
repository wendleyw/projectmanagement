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
      // Buscar tarefas do Supabase
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects(*),
          users(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Converter dados do formato do Supabase para o formato da aplicação
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
        parentTaskId: item.parent_task_id,
        project: item.projects ? {
          id: item.projects.id,
          name: item.projects.name,
          description: item.projects.description,
          clientId: item.projects.client_id || '',
          startDate: item.projects.start_date,
          endDate: item.projects.end_date,
          status: item.projects.status,
          budget: item.projects.budget,
          managerId: item.projects.manager_id || '',
          teamMembers: item.projects.team_members || [],
          createdAt: item.projects.created_at,
          updatedAt: item.projects.updated_at
        } : undefined,
        assignee: item.users ? {
          id: item.users.id,
          firstName: item.users.first_name,
          lastName: item.users.last_name,
          email: item.users.email,
          avatar: item.users.avatar,
          role: item.users.role,
          createdAt: item.users.created_at,
          updatedAt: item.users.updated_at
        } : undefined
      }));
      
      set({ tasks, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: errorMessage, isLoading: false });
      showNotification(`Falha ao carregar tarefas: ${errorMessage}`, 'error');
    }
  },
  
  fetchProjectTasks: async (projectId) => {
    set({ isLoading: true, error: null });
    
    try {
      // Buscar tarefas do projeto específico no Supabase
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          users(*)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Converter dados do formato do Supabase para o formato da aplicação
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
        parentTaskId: item.parent_task_id,
        assignee: item.users ? {
          id: item.users.id,
          firstName: item.users.first_name,
          lastName: item.users.last_name,
          email: item.users.email,
          avatar: item.users.avatar,
          role: item.users.role,
          createdAt: item.users.created_at,
          updatedAt: item.users.updated_at
        } : undefined
      }));
      
      set({ projectTasks, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: errorMessage, isLoading: false });
      showNotification(`Falha ao carregar tarefas do projeto: ${errorMessage}`, 'error');
    }
  },
  
  getTask: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Buscar tarefa específica do Supabase
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects(*),
          users(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Tarefa não encontrada');
      
      // Converter dados do formato do Supabase para o formato da aplicação
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
        parentTaskId: data.parent_task_id,
        project: data.projects ? {
          id: data.projects.id,
          name: data.projects.name,
          description: data.projects.description,
          clientId: data.projects.client_id || '',
          startDate: data.projects.start_date,
          endDate: data.projects.end_date,
          status: data.projects.status,
          budget: data.projects.budget,
          managerId: data.projects.manager_id || '',
          teamMembers: data.projects.team_members || [],
          createdAt: data.projects.created_at,
          updatedAt: data.projects.updated_at
        } : undefined,
        assignee: data.users ? {
          id: data.users.id,
          firstName: data.users.first_name,
          lastName: data.users.last_name,
          email: data.users.email,
          avatar: data.users.avatar,
          role: data.users.role,
          createdAt: data.users.created_at,
          updatedAt: data.users.updated_at
        } : undefined
      };
      
      set({ currentTask: task, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: errorMessage, isLoading: false });
      showNotification(`Falha ao carregar tarefa: ${errorMessage}`, 'error');
    }
  },
  
  createTask: async (task) => {
    set({ isLoading: true, error: null });
    
    try {
      // Converter dados do formato da aplicação para o formato do Supabase
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
      
      // Criar tarefa no Supabase
      const { data, error } = await supabase
        .from('tasks')
        .insert([supabaseData])
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Falha ao criar tarefa: Nenhum dado retornado');
      
      // Converter dados do formato do Supabase para o formato da aplicação
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
      
      // Atualizar o estado local
      set(state => ({
        tasks: [newTask, ...state.tasks],
        projectTasks: task.projectId === get().projectTasks[0]?.projectId
          ? [newTask, ...state.projectTasks]
          : state.projectTasks,
        isLoading: false
      }));
      
      showNotification('Tarefa criada com sucesso', 'success');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: errorMessage, isLoading: false });
      showNotification(`Falha ao criar tarefa: ${errorMessage}`, 'error');
      return false;
    }
  },
  
  updateTask: async (id, taskData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Converter dados do formato da aplicação para o formato do Supabase
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
      
      // Atualizar tarefa no Supabase
      const { data, error } = await supabase
        .from('tasks')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Tarefa não encontrada');
      
      // Converter dados do formato do Supabase para o formato da aplicação
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
      
      // Atualizar o estado local
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? updatedTask : t),
        projectTasks: state.projectTasks.map(t => t.id === id ? updatedTask : t),
        currentTask: state.currentTask?.id === id ? updatedTask : state.currentTask,
        isLoading: false
      }));
      
      showNotification('Tarefa atualizada com sucesso', 'success');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: errorMessage, isLoading: false });
      showNotification(`Falha ao atualizar tarefa: ${errorMessage}`, 'error');
      return false;
    }
  },
  
  updateTaskStatus: async (id, status) => {
    return get().updateTask(id, { status });
  },
  
  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Excluir tarefa do Supabase
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar o estado local
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== id),
        projectTasks: state.projectTasks.filter(t => t.id !== id),
        currentTask: state.currentTask?.id === id ? null : state.currentTask,
        isLoading: false
      }));
      
      showNotification('Tarefa excluída com sucesso', 'success');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: errorMessage, isLoading: false });
      showNotification(`Falha ao excluir tarefa: ${errorMessage}`, 'error');
      return false;
    }
  }
}));

export default useTaskStore;
