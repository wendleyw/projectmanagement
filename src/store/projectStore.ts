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
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateProject: (id: string, projectData: Partial<Project>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  updateProjectTeamMembers: (id: string, team_members: string[]) => Promise<boolean>;
}

const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
  
  // Função para formatar uma data em YYYY-MM-DD ou retornar null se a data for inválida
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
      // Usando diretamente o formato do banco de dados, conforme a definição de Project
      const projects: Project[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        client_id: item.client_id || undefined,
        start_date: item.start_date,
        end_date: item.end_date,
        actual_end_date: item.actual_end_date,
        status: item.status,
        budget: item.budget,
        manager_id: item.manager_id || undefined,
        team_members: item.team_members || [],
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      set({ projects, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: errorMessage, isLoading: false });
      showNotification(`Falha ao carregar projetos: ${errorMessage}`, 'error');
    }
  },
  
  getProject: async (id: string) => {
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
        client_id: data.client_id || undefined,
        start_date: data.start_date,
        end_date: data.end_date,
        actual_end_date: data.actual_end_date,
        status: data.status,
        budget: data.budget,
        manager_id: data.manager_id || undefined,
        team_members: data.team_members || [],
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      set({ currentProject: project, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: errorMessage, isLoading: false });
      showNotification(`Falha ao carregar projeto: ${errorMessage}`, 'error');
    }
  },
  
  createProject: async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      // Função para formatar uma data em YYYY-MM-DD ou retornar null se a data for inválida
      const formatDate = (date: string | undefined): string | null => {
        if (!date) return null;
        const d = new Date(date);
        if (isNaN(d.getTime())) return null; // Data inválida
        return d.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      };

      // Verificar se os campos obrigatórios estão presentes
      if (!project.name || !project.start_date) {
        throw new Error('Nome e data de início são obrigatórios');
      }

      // Formatação das datas para o padrão YYYY-MM-DD
      const startDate = formatDate(project.start_date);
      if (!startDate) {
        throw new Error('Data de início inválida');
      }

      const endDate = formatDate(project.end_date);
      
      // Preparar dados para inserção
      const projectData = {
        name: project.name,
        description: project.description,
        client_id: project.client_id || null,
        start_date: startDate,
        end_date: endDate,
        status: project.status,
        budget: project.budget || null,
        manager_id: project.manager_id || null,
        team_members: project.team_members || []
      };
      
      console.log('Dados sendo enviados para o Supabase:', projectData);
      
      // Criar projeto no Supabase
      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Falha ao criar projeto: Nenhum dado retornado');
      
      set({ isLoading: false });
      showNotification('Projeto criado com sucesso!', 'success');
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: errorMessage, isLoading: false });
      showNotification(`Falha ao criar projeto: ${errorMessage}`, 'error');
      return false;
    }
  },
  
  updateProject: async (id: string, projectData: Partial<Project>): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      // Converter dados do formato da aplicação para o formato do Supabase
      const supabaseData: Record<string, any> = {};
      
      if (projectData.name !== undefined) supabaseData.name = projectData.name;
      if (projectData.description !== undefined) supabaseData.description = projectData.description;
      if (projectData.client_id !== undefined) supabaseData.client_id = projectData.client_id || null;
      if (projectData.start_date !== undefined) supabaseData.start_date = projectData.start_date;
      if (projectData.end_date !== undefined) supabaseData.end_date = projectData.end_date;
      if (projectData.actual_end_date !== undefined) supabaseData.actual_end_date = projectData.actual_end_date;
      if (projectData.status !== undefined) supabaseData.status = projectData.status;
      if (projectData.budget !== undefined) supabaseData.budget = projectData.budget;
      if (projectData.manager_id !== undefined) supabaseData.manager_id = projectData.manager_id || null;
      // Removendo team_members da atualização direta para evitar problemas
      // team_members será atualizado separadamente
      
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
      
      // Se houver membros da equipe para atualizar, fazer separadamente
      if (projectData.team_members !== undefined) {
        try {
          // Atualizar team_members do projeto
          const { error: updateError } = await supabase
            .from('projects')
            .update({ team_members: projectData.team_members })
            .eq('id', id);
          
          if (updateError) {
            console.error('Erro ao atualizar membros da equipe:', updateError);
            // Não vamos lançar erro para não impedir a atualização do projeto
          }
        } catch (updateErr) {
          console.error('Erro ao atualizar membros da equipe:', updateErr);
        }
      }
      
      // Converter dados do formato do Supabase para o formato da aplicação
      const updatedProject: Project = {
        id: data.id,
        name: data.name,
        description: data.description,
        client_id: data.client_id || undefined,
        start_date: data.start_date,
        end_date: data.end_date,
        actual_end_date: data.actual_end_date,
        status: data.status,
        budget: data.budget,
        manager_id: data.manager_id || undefined,
        // Usar os membros da equipe atualizados, se fornecidos
        team_members: projectData.team_members !== undefined ? projectData.team_members : (data.team_members || []),
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      // Atualizar o estado local
      set((state) => ({
        projects: state.projects.map((p) => p.id === id ? updatedProject : p),
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
  
  deleteProject: async (id: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      // Excluir projeto do Supabase
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar o estado local
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
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
  
  updateProjectTeamMembers: async (id: string, team_members: string[]): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      // Atualizar membros da equipe no Supabase
      const { error } = await supabase
        .from('projects')
        .update({ team_members })
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar o estado local
      set((state) => ({
        projects: state.projects.map((p) => 
          p.id === id ? { ...p, team_members } : p
        ),
        currentProject: state.currentProject?.id === id 
          ? { ...state.currentProject, team_members } 
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
