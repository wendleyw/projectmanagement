import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { showNotification } from '../utils/notifications';

export interface ActivityItem {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  action: string;
  target: string;
  targetId: string;
  timestamp: string;
  createdAt: string;
}

interface ActivityState {
  activities: ActivityItem[];
  isLoading: boolean;
  error: string | null;
  
  fetchActivities: () => Promise<void>;
}

const useActivityStore = create<ActivityState>((set) => ({
  activities: [],
  isLoading: false,
  error: null,
  
  fetchActivities: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Fetch recent activities from Supabase
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      // Convert data from Supabase format to application format
      const activities: ActivityItem[] = data.map(item => ({
        id: item.id,
        user: {
          id: item.user_id || '',
          name: `User`, // Generic name since we don't have the direct relation
          avatar: ''
        },
        action: item.action,
        target: item.target,
        targetId: item.target_id,
        timestamp: formatTimeAgo(new Date(item.created_at)),
        createdAt: item.created_at
      }));
      
      set({ activities, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: errorMessage, isLoading: false });
      showNotification(`Falha ao carregar atividades: ${errorMessage}`, 'error');
    }
  }
}));

// Função auxiliar para formatar o tempo decorrido
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'agora mesmo';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'} atrás`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'} atrás`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'} atrás`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? 'semana' : 'semanas'} atrás`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'mês' : 'meses'} atrás`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${diffInYears === 1 ? 'ano' : 'anos'} atrás`;
}

export default useActivityStore;
