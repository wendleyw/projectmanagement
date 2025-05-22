import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { TimeEntry } from '../../types';

export function useTimeEntries(userId?: string, projectId?: string) {
  const queryClient = useQueryClient();

  const timeEntriesQuery = useQuery({
    queryKey: ['timeEntries', { userId, projectId }],
    queryFn: async () => {
      let query = supabase.from('time_entries').select('*');
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query.order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createTimeEntry = useMutation({
    mutationFn: async (newEntry: Omit<TimeEntry, 'id'>) => {
      const { data, error } = await supabase
        .from('time_entries')
        .insert([newEntry])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ 
        queryKey: ['timeEntries', { userId: data.userId }] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['timeEntries', { projectId: data.projectId }] 
      });
    },
  });

  const updateTimeEntry = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<TimeEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from('time_entries')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ 
        queryKey: ['timeEntries', { userId: data.userId }] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['timeEntries', { projectId: data.projectId }] 
      });
    },
  });

  const deleteTimeEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });

  return {
    timeEntries: timeEntriesQuery.data ?? [],
    isLoading: timeEntriesQuery.isLoading,
    error: timeEntriesQuery.error,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
  };
}