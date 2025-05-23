import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Member } from '../../types';

export function useMembers() {
  const queryClient = useQueryClient();

  const membersQuery = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          user:users(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createMember = useMutation({
    mutationFn: async (newMember: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase
        .from('members')
        .insert([newMember])
        .select(`
          *,
          user:users(*)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const updateMember = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Member> & { id: string }) => {
      const { data, error } = await supabase
        .from('members')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          user:users(*)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member', data.id] });
    },
  });

  const deleteMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  return {
    members: membersQuery.data ?? [],
    isLoading: membersQuery.isLoading,
    error: membersQuery.error,
    createMember,
    updateMember,
    deleteMember,
  };
}

export function useMember(id: string) {
  return useQuery({
    queryKey: ['member', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          user:users(*),
          project_members!project_members_member_id_fkey(
            *,
            project:projects(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}