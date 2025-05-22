import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Task } from '../../types';

export function useTasks(projectId?: string) {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['tasks', { projectId }],
    queryFn: async () => {
      let query = supabase.from('tasks').select('*');
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createTask = useMutation({
    mutationFn: async (newTask: Omit<Task, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (data.projectId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', { projectId: data.projectId }] });
      }
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', data.id] });
      if (data.projectId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', { projectId: data.projectId }] });
      }
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    createTask,
    updateTask,
    deleteTask,
  };
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}