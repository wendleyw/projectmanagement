-- Script para criar a tabela meetings no Supabase
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL,
  project_id UUID REFERENCES public.projects(id),
  client_id UUID REFERENCES public.clients(id),
  location TEXT,
  meeting_type TEXT CHECK (meeting_type IN ('presencial', 'online')),
  meeting_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar índices para melhorar a performance
CREATE INDEX IF NOT EXISTS meetings_project_id_idx ON public.meetings(project_id);
CREATE INDEX IF NOT EXISTS meetings_client_id_idx ON public.meetings(client_id);
CREATE INDEX IF NOT EXISTS meetings_date_idx ON public.meetings(date);
