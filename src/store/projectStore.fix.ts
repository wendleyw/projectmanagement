import { create } from 'zustand';
import { Project } from '../types';
import { supabase } from '../lib/supabaseClient';
import { showNotification } from '../utils/notifications';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  
  fetchProjects: () => Promise<void>;
  getProject: (id: string) => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateProject: (id: string, projectData: Partial<Project>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  updateProjectTeamMembers: (id: string, teamMembers: string[]) => Promise<boolean>;
}

const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
  
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Buscar projetos do Supabase
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Converter dados do formato do Supabase para o formato da aplicação
      const projects: Project[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        clientId: item.client_id || '',
        startDate: item.start_date,
        endDate: item.end_date,
        actualEndDate: item.actual_end_date,
        status: item.status,
        budget: item.budget,
        managerId: item.manager_id || '',
        teamMembers: item.team_members || [],
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
      
      set({ projects, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: errorMessage, isLoading: false });
      showNotification(`Falha ao carregar projetos: ${errorMessage}`, 'error');
    }
  },
  
  getProject: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Buscar projeto específico do Supabase
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          clients(*),
          users!projects_manager_id_fkey(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Projeto não encontrado');
      
      // Converter dados do formato do Supabase para o formato da aplicação
      const project: Project = {
        id: data.id,
        name: data.name,
        description: data.description,
        clientId: data.client_id || '',
        startDate: data.start_date,
        endDate: data.end_date,
        actualEndDate: data.actual_end_date,
        status: data.status,
        budget: data.budget,
        managerId: data.manager_id || '',
        teamMembers: data.team_members || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        client: data.clients ? {
          id: data.clients.id,
          name: data.clients.name,
          contactName: data.clients.contact_name,
          email: data.clients.email,
          phone: data.clients.phone,
          address: data.clients.address,
          createdAt: data.clients.created_at,
          status: data.clients.status
        } : undefined,
        manager: data.users ? {
          id: data.users.id,
          firstName: data.users.first_name,
          lastName: data.users.last_name,
          email: data.users.email,
          avatar: data.users.avatar,
          role: data.users.role,
          createdAt: data.users.created_at,
          updatedAt: data.users.updated_at
        } : undefined
      };
      
      set({ currentProject: project, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: errorMessage, isLoading: false });
      showNotification(`Falha ao carregar projeto: ${errorMessage}`, 'error');
    }
  },
  
  createProject: async (project) => {
    set({ isLoading: true, error: null });
    
    try {
      // Converter dados do formato da aplicação para o formato do Supabase
      const supabaseData = {
        name: project.name,
        description: project.description,
        client_id: project.clientId || null,
        start_date: project.startDate,
        end_date: project.endDate,
        status: project.status,
        budget: project.budget || null,
        manager_id: project.managerId || null,
        team_members: project.teamMembers || []
      };
      
      // Criar projeto no Supabase
      const { data, error } = await supabase
        .from('projects')
        .insert([supabaseData])
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Falha ao criar projeto: Nenhum dado retornado');
      
      // Converter dados do formato do Supabase para o formato da aplicação
      const newProject: Project = {
        id: data.id,
        name: data.name,
        description: data.description,
        clientId: data.client_id || '',
        startDate: data.start_date,
        endDate: data.end_date,
        actualEndDate: data.actual_end_date,
        status: data.status,
        budget: data.budget,
        managerId: data.manager_id || '',
        teamMembers: data.team_members || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      // Atualizar o estado local
      set(state => ({
        projects: [newProject, ...state.projects],
        isLoading: false
      }));
      
      showNotification('Projeto criado com sucesso', 'success');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: errorMessage, isLoading: false });
      showNotification(`Falha ao criar projeto: ${errorMessage}`, 'error');
      return false;
    }
  },
  
  updateProject: async (id, projectData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Converter dados do formato da aplicação para o formato do Supabase
      const supabaseData: Record<string, any> = {};
      
      if (projectData.name !== undefined) supabaseData.name = projectData.name;
      if (projectData.description !== undefined) supabaseData.description = projectData.description;
      if (projectData.clientId !== undefined) supabaseData.client_id = projectData.clientId || null;
      if (projectData.startDate !== undefined) supabaseData.start_date = projectData.startDate;
      if (projectData.endDate !== undefined) supabaseData.end_date = projectData.endDate;
      if (projectData.actualEndDate !== undefined) supabaseData.actual_end_date = projectData.actualEndDate;
      if (projectData.status !== undefined) supabaseData.status = projectData.status;
      if (projectData.budget !== undefined) supabaseData.budget = projectData.budget;
      if (projectData.managerId !== undefined) supabaseData.manager_id = projectData.managerId || null;
      if (projectData.teamMembers !== undefined) supabaseData.team_members = projectData.teamMembers;
      
      // Atualizar a data de atualização
      supabaseData.updated_at = new Date().toISOString();
      
      // Atualizar projeto no Supabase
      const { data, error } = await supabase
        .from('projects')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Projeto não encontrado');
      
      // Converter dados do formato do Supabase para o formato da aplicação
      const updatedProject: Project = {
        id: data.id,
        name: data.name,
        description: data.description,
        clientId: data.client_id || '',
        startDate: data.start_date,
        endDate: data.end_date,
        actualEndDate: data.actual_end_date,
        status: data.status,
        budget: data.budget,
        managerId: data.manager_id || '',
        teamMembers: data.team_members || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      // Atualizar o estado local
      set(state => ({
        projects: state.projects.map(p => p.id === id ? updatedProject : p),
        currentProject: state.currentProject?.id === id ? updatedProject : state.currentProject,
        isLoading: false
      }));
      
      showNotification('Projeto atualizado com sucesso', 'success');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: errorMessage, isLoading: false });
      showNotification(`Falha ao atualizar projeto: ${errorMessage}`, 'error');
      return false;
    }
  },
  
  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Excluir projeto do Supabase
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar o estado local
      set(state => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        isLoading: false
      }));
      
      showNotification('Projeto excluído com sucesso', 'success');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: errorMessage, isLoading: false });
      showNotification(`Falha ao excluir projeto: ${errorMessage}`, 'error');
      return false;
    }
  },
  
  updateProjectTeamMembers: async (id, teamMembers) => {
    set({ isLoading: true, error: null });
    
    try {
      // Atualizar membros da equipe no Supabase
      const { error } = await supabase
        .from('projects')
        .update({ team_members: teamMembers })
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar o estado local
      set(state => ({
        projects: state.projects.map(p => 
          p.id === id ? { ...p, teamMembers: teamMembers } : p
        ),
        currentProject: state.currentProject?.id === id 
          ? { ...state.currentProject, teamMembers } 
          : state.currentProject,
        isLoading: false
      }));
      
      showNotification('Membros da equipe atualizados com sucesso', 'success');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: errorMessage, isLoading: false });
      showNotification(`Falha ao atualizar membros da equipe: ${errorMessage}`, 'error');
      return false;
    }
  }
}));

export default useProjectStore;
