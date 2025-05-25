import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Tente obter as variáveis de ambiente, ou use valores mock para desenvolvimento
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-supabase-url.com';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';

// Flag para verificar se estamos usando valores reais ou mock
export const isUsingMockSupabase = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

// Criar cliente Supabase (real ou mock)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for type-safe database operations
export const getTypedTable = <T extends keyof Database['public']['Tables']>(
  table: T
) => supabase.from(table);

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};