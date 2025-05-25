import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { showNotification } from '../utils/notifications';

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  taskId?: string;
  description: string;
  hours: number;
  date: string; // YYYY-MM-DD format
  billable: boolean;
  createdAt: string;
  updatedAt?: string;
  // Campos virtuais para o timer
  startTime?: string;
  endTime?: string;
  duration?: number; // duration in seconds
  isRunning?: boolean;
  tags?: string[];
}

interface TimeTrackingStore {
  entries: TimeEntry[];
  activeEntry: TimeEntry | null;
  loading: boolean;
  error: string | null;
  fetchEntries: (filter?: { startDate?: string; endDate?: string; projectId?: string; userId?: string }) => Promise<void>;
  startTimer: (data: Omit<TimeEntry, 'id' | 'startTime' | 'duration' | 'isRunning' | 'createdAt'>) => Promise<boolean>;
  stopTimer: (id: string) => Promise<boolean>;
  createEntry: (data: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateEntry: (id: string, data: Partial<TimeEntry>) => Promise<boolean>;
  deleteEntry: (id: string) => Promise<boolean>;
  getProjectTotalTime: (projectId: string) => number;
  getUserTotalTime: (userId: string, timeframe?: 'day' | 'week' | 'month') => number;
  getRunningTimer: () => TimeEntry | null;
}

const useTimeTrackingStore = create<TimeTrackingStore>((set, get) => ({
  entries: [],
  activeEntry: null,
  loading: false,
  error: null,

  fetchEntries: async (filter) => {
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('time_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter?.startDate) {
        query = query.gte('date', filter.startDate);
      }

      if (filter?.endDate) {
        query = query.lte('date', filter.endDate);
      }

      if (filter?.projectId) {
        query = query.eq('project_id', filter.projectId);
      }

      if (filter?.userId) {
        query = query.eq('user_id', filter.userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Mapear os dados do formato snake_case para camelCase
      const entries = data.map(entry => ({
        id: entry.id,
        userId: entry.user_id,
        projectId: entry.project_id,
        taskId: entry.task_id,
        description: entry.description,
        hours: entry.hours,
        date: entry.date,
        billable: entry.billable,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at,
        // Campos virtuais para compatibilidade
        isRunning: false
      })) as TimeEntry[];

      // Como não temos mais o conceito de timer rodando na estrutura atual,
      // vamos definir activeEntry como null
      const activeEntry = null;

      set({ 
        entries, 
        activeEntry,
        loading: false 
      });
    } catch (error: any) {
      console.error('Error fetching time entries:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  startTimer: async (data) => {
    // First check if there's already a running timer
    const activeEntry = get().entries.find(entry => entry.isRunning);
    if (activeEntry) {
      // Stop the current timer first
      await get().stopTimer(activeEntry.id);
    }

    set({ loading: true, error: null });
    try {
      const now = new Date();
      const startTime = now.toISOString();
      const date = now.toISOString().split('T')[0]; // YYYY-MM-DD

      const { data: newEntry, error } = await supabase
        .from('time_entries')
        .insert([
          {
            ...data,
            startTime,
            date,
            duration: 0,
            isRunning: true,
            createdAt: startTime,
          },
        ])
        .select();

      if (error) throw error;

      const createdEntry = newEntry[0] as TimeEntry;

      set(state => ({
        entries: [createdEntry, ...state.entries],
        activeEntry: createdEntry,
        loading: false,
      }));

      showNotification('Timer iniciado com sucesso', 'success');
      return true;
    } catch (error: any) {
      console.error('Error starting timer:', error.message);
      set({ error: error.message, loading: false });
      showNotification(`Erro ao iniciar timer: ${error.message}`, 'error');
      return false;
    }
  },

  stopTimer: async (id) => {
    set({ loading: true, error: null });
    try {
      const entry = get().entries.find(e => e.id === id);
      if (!entry) throw new Error('Timer não encontrado');

      const now = new Date();
      const endTime = now.toISOString();
      const startTime = new Date(entry.startTime);
      const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000); // duration in seconds

      const { error } = await supabase
        .from('time_entries')
        .update({
          endTime,
          duration,
          isRunning: false,
        })
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        entries: state.entries.map(entry =>
          entry.id === id
            ? { ...entry, endTime, duration, isRunning: false }
            : entry
        ),
        activeEntry: null,
        loading: false,
      }));

      showNotification('Timer parado com sucesso', 'success');
      return true;
    } catch (error: any) {
      console.error('Error stopping timer:', error.message);
      set({ error: error.message, loading: false });
      showNotification(`Erro ao parar timer: ${error.message}`, 'error');
      return false;
    }
  },

  createEntry: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: newEntry, error } = await supabase
        .from('time_entries')
        .insert([
          {
            ...data,
            isRunning: false,
            createdAt: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      set(state => ({
        entries: [newEntry[0] as TimeEntry, ...state.entries],
        loading: false,
      }));

      showNotification('Registro de tempo criado com sucesso', 'success');
      return true;
    } catch (error: any) {
      console.error('Error creating time entry:', error.message);
      set({ error: error.message, loading: false });
      showNotification(`Erro ao criar registro de tempo: ${error.message}`, 'error');
      return false;
    }
  },

  updateEntry: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('time_entries')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        entries: state.entries.map(entry =>
          entry.id === id ? { ...entry, ...data } : entry
        ),
        activeEntry: state.activeEntry?.id === id
          ? { ...state.activeEntry, ...data }
          : state.activeEntry,
        loading: false,
      }));

      showNotification('Registro de tempo atualizado com sucesso', 'success');
      return true;
    } catch (error: any) {
      console.error('Error updating time entry:', error.message);
      set({ error: error.message, loading: false });
      showNotification(`Erro ao atualizar registro de tempo: ${error.message}`, 'error');
      return false;
    }
  },

  deleteEntry: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        entries: state.entries.filter(entry => entry.id !== id),
        activeEntry: state.activeEntry?.id === id ? null : state.activeEntry,
        loading: false,
      }));

      showNotification('Registro de tempo removido com sucesso', 'success');
      return true;
    } catch (error: any) {
      console.error('Error deleting time entry:', error.message);
      set({ error: error.message, loading: false });
      showNotification(`Erro ao remover registro de tempo: ${error.message}`, 'error');
      return false;
    }
  },

  getProjectTotalTime: (projectId) => {
    const projectEntries = get().entries.filter(entry => entry.projectId === projectId);
    return projectEntries.reduce((total, entry) => total + entry.duration, 0);
  },

  getUserTotalTime: (userId, timeframe) => {
    let entries = get().entries.filter(entry => entry.userId === userId);

    if (timeframe) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      
      if (timeframe === 'day') {
        entries = entries.filter(entry => entry.date === today.split('T')[0]);
      } else if (timeframe === 'week') {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        entries = entries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= weekStart;
        });
      } else if (timeframe === 'month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        entries = entries.filter(entry => entry.date >= monthStart.split('T')[0]);
      }
    }

    return entries.reduce((total, entry) => total + entry.duration, 0);
  },

  getRunningTimer: () => {
    return get().activeEntry;
  },
}));

export default useTimeTrackingStore;
