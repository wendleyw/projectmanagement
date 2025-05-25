import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Desativando o uso de dados mockados para usar o Supabase real
export const isUsingMockSupabase = false;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
