import { create } from 'zustand';
import { TimeEntry } from '../types';
import { mockTimeEntries } from '../data/mockData';

interface TimeEntryState {
  timeEntries: TimeEntry[];
  userTimeEntries: TimeEntry[];
  projectTimeEntries: TimeEntry[];
  taskTimeEntries: TimeEntry[];
  isLoading: boolean;
  error: string | null;
  
  fetchTimeEntries: () => Promise<void>;
  fetchUserTimeEntries: (userId: string) => Promise<void>;
  fetchProjectTimeEntries: (projectId: string) => Promise<void>;
  fetchTaskTimeEntries: (taskId: string) => Promise<void>;
  createTimeEntry: (timeEntry: Omit<TimeEntry, 'id'>) => Promise<boolean>;
  updateTimeEntry: (id: string, timeEntryData: Partial<TimeEntry>) => Promise<boolean>;
  deleteTimeEntry: (id: string) => Promise<boolean>;
}

const useTimeEntryStore = create<TimeEntryState>((set, get) => ({
  timeEntries: mockTimeEntries,
  userTimeEntries: [],
  projectTimeEntries: [],
  taskTimeEntries: [],
  isLoading: false,
  error: null,
  
  fetchTimeEntries: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      set({ timeEntries: mockTimeEntries, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch time entries', isLoading: false });
    }
  },
  
  fetchUserTimeEntries: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const filteredEntries = mockTimeEntries.filter(entry => entry.userId === userId);
      set({ userTimeEntries: filteredEntries, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch user time entries', isLoading: false });
    }
  },
  
  fetchProjectTimeEntries: async (projectId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const filteredEntries = mockTimeEntries.filter(entry => entry.projectId === projectId);
      set({ projectTimeEntries: filteredEntries, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch project time entries', isLoading: false });
    }
  },
  
  fetchTaskTimeEntries: async (taskId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const filteredEntries = mockTimeEntries.filter(entry => entry.taskId === taskId);
      set({ taskTimeEntries: filteredEntries, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch task time entries', isLoading: false });
    }
  },
  
  createTimeEntry: async (timeEntry) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newTimeEntry: TimeEntry = {
        ...timeEntry,
        id: `time${mockTimeEntries.length + 1}`
      };
      
      set(state => ({ 
        timeEntries: [...state.timeEntries, newTimeEntry],
        userTimeEntries: timeEntry.userId === state.userTimeEntries[0]?.userId 
          ? [...state.userTimeEntries, newTimeEntry] 
          : state.userTimeEntries,
        projectTimeEntries: timeEntry.projectId === state.projectTimeEntries[0]?.projectId 
          ? [...state.projectTimeEntries, newTimeEntry] 
          : state.projectTimeEntries,
        taskTimeEntries: timeEntry.taskId === state.taskTimeEntries[0]?.taskId 
          ? [...state.taskTimeEntries, newTimeEntry] 
          : state.taskTimeEntries,
        isLoading: false 
      }));
      
      return true;
    } catch (error) {
      set({ error: 'Failed to create time entry', isLoading: false });
      return false;
    }
  },
  
  updateTimeEntry: async (id, timeEntryData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      set(state => ({
        timeEntries: state.timeEntries.map(entry => 
          entry.id === id ? { ...entry, ...timeEntryData } : entry
        ),
        userTimeEntries: state.userTimeEntries.map(entry => 
          entry.id === id ? { ...entry, ...timeEntryData } : entry
        ),
        projectTimeEntries: state.projectTimeEntries.map(entry => 
          entry.id === id ? { ...entry, ...timeEntryData } : entry
        ),
        taskTimeEntries: state.taskTimeEntries.map(entry => 
          entry.id === id ? { ...entry, ...timeEntryData } : entry
        ),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ error: 'Failed to update time entry', isLoading: false });
      return false;
    }
  },
  
  deleteTimeEntry: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      set(state => ({
        timeEntries: state.timeEntries.filter(entry => entry.id !== id),
        userTimeEntries: state.userTimeEntries.filter(entry => entry.id !== id),
        projectTimeEntries: state.projectTimeEntries.filter(entry => entry.id !== id),
        taskTimeEntries: state.taskTimeEntries.filter(entry => entry.id !== id),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ error: 'Failed to delete time entry', isLoading: false });
      return false;
    }
  }
}));

export default useTimeEntryStore;