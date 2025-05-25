import { create } from 'zustand';
import { supabase, isUsingMockSupabase } from '../lib/supabaseClient';
import { showNotification } from '../utils/notifications';
import { mockMeetings } from '../data/mockMeetings';

export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  projectId: string;
  clientId: string;
  location: string;
  meetingType: 'presencial' | 'online';
  meetingLink?: string;
  createdAt: string;
}

interface MeetingStore {
  meetings: Meeting[];
  loading: boolean;
  error: string | null;
  fetchMeetings: () => Promise<void>;
  createMeeting: (meetingData: Omit<Meeting, 'id' | 'createdAt'>) => Promise<boolean>;
  updateMeeting: (id: string, meetingData: Partial<Meeting>) => Promise<boolean>;
  deleteMeeting: (id: string) => Promise<boolean>;
}

const useMeetingStore = create<MeetingStore>((set) => ({
  meetings: [],
  loading: false,
  error: null,

  fetchMeetings: async () => {
    set({ loading: true, error: null });
    
    // Se estiver usando dados mockados ou em modo de desenvolvimento
    if (isUsingMockSupabase) {
      // Simular um pequeno atraso para simular uma chamada de API
      setTimeout(() => {
        set({ meetings: mockMeetings, loading: false });
      }, 300);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        // Se a tabela não existir, usar dados mockados
        if (error.message.includes('does not exist')) {
          console.warn('Tabela meetings não encontrada, usando dados mockados');
          set({ meetings: mockMeetings, loading: false });
          return;
        }
        throw error;
      }

      set({ meetings: data as Meeting[], loading: false });
    } catch (error: any) {
      console.error('Error fetching meetings:', error.message);
      // Em caso de erro, usar dados mockados para não quebrar a UI
      set({ meetings: mockMeetings, error: error.message, loading: false });
    }
  },

  createMeeting: async (meetingData) => {
    set({ loading: true, error: null });
    try {
      // Nota: Combinamos data e hora no backend
      
      const { data, error } = await supabase
        .from('meetings')
        .insert([
          {
            ...meetingData,
            createdAt: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      set(state => ({
        meetings: [...state.meetings, data[0] as Meeting],
        loading: false,
      }));

      showNotification('Reunião agendada com sucesso', 'success');
      return true;
    } catch (error: any) {
      console.error('Error creating meeting:', error.message);
      set({ error: error.message, loading: false });
      showNotification(`Erro ao agendar reunião: ${error.message}`, 'error');
      return false;
    }
  },

  updateMeeting: async (id, meetingData) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('meetings')
        .update(meetingData)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        meetings: state.meetings.map(meeting =>
          meeting.id === id ? { ...meeting, ...meetingData } : meeting
        ),
        loading: false,
      }));

      showNotification('Reunião atualizada com sucesso', 'success');
      return true;
    } catch (error: any) {
      console.error('Error updating meeting:', error.message);
      set({ error: error.message, loading: false });
      showNotification(`Erro ao atualizar reunião: ${error.message}`, 'error');
      return false;
    }
  },

  deleteMeeting: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        meetings: state.meetings.filter(meeting => meeting.id !== id),
        loading: false,
      }));

      showNotification('Reunião removida com sucesso', 'success');
      return true;
    } catch (error: any) {
      console.error('Error deleting meeting:', error.message);
      set({ error: error.message, loading: false });
      showNotification(`Erro ao remover reunião: ${error.message}`, 'error');
      return false;
    }
  },
}));

export default useMeetingStore;
