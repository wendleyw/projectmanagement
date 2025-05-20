import { create } from 'zustand';
import { Task } from '../types';
import { mockTasks } from '../data/mockData';

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
  tasks: mockTasks,
  projectTasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
  
  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, you would fetch data from an API
      set({ tasks: mockTasks, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch tasks', isLoading: false });
    }
  },
  
  fetchProjectTasks: async (projectId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const filteredTasks = mockTasks.filter(task => task.projectId === projectId);
      set({ projectTasks: filteredTasks, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch project tasks', isLoading: false });
    }
  },
  
  getTask: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const task = mockTasks.find(t => t.id === id) || null;
      set({ currentTask: task, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch task details', isLoading: false });
    }
  },
  
  createTask: async (task) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const newTask: Task = {
        ...task,
        id: `task${mockTasks.length + 1}`,
        createdAt: new Date().toISOString()
      };
      
      set(state => ({ 
        tasks: [...state.tasks, newTask],
        projectTasks: task.projectId === state.projectTasks[0]?.projectId 
          ? [...state.projectTasks, newTask] 
          : state.projectTasks,
        isLoading: false 
      }));
      
      return true;
    } catch (error) {
      set({ error: 'Failed to create task', isLoading: false });
      return false;
    }
  },
  
  updateTask: async (id, taskData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, ...taskData } : task
        ),
        projectTasks: state.projectTasks.map(task => 
          task.id === id ? { ...task, ...taskData } : task
        ),
        currentTask: state.currentTask?.id === id 
          ? { ...state.currentTask, ...taskData } 
          : state.currentTask,
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ error: 'Failed to update task', isLoading: false });
      return false;
    }
  },
  
  updateTaskStatus: async (id, status) => {
    return get().updateTask(id, { status });
  },
  
  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        projectTasks: state.projectTasks.filter(task => task.id !== id),
        currentTask: state.currentTask?.id === id ? null : state.currentTask,
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ error: 'Failed to delete task', isLoading: false });
      return false;
    }
  }
}));

export default useTaskStore;