import { create } from 'zustand';
import { Project } from '../types';
import { mockProjects } from '../data/mockData';

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
}

const useProjectStore = create<ProjectState>((set, get) => ({
  projects: mockProjects,
  currentProject: null,
  isLoading: false,
  error: null,
  
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, you would fetch data from an API
      set({ projects: mockProjects, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch projects', isLoading: false });
    }
  },
  
  getProject: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const project = mockProjects.find(p => p.id === id) || null;
      set({ currentProject: project, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch project details', isLoading: false });
    }
  },
  
  createProject: async (project) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newProject: Project = {
        ...project,
        id: `project${mockProjects.length + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      set(state => ({ 
        projects: [...state.projects, newProject], 
        isLoading: false 
      }));
      
      return true;
    } catch (error) {
      set({ error: 'Failed to create project', isLoading: false });
      return false;
    }
  },
  
  updateProject: async (id, projectData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      set(state => ({
        projects: state.projects.map(project => 
          project.id === id 
            ? { ...project, ...projectData, updatedAt: new Date().toISOString() } 
            : project
        ),
        currentProject: state.currentProject?.id === id 
          ? { ...state.currentProject, ...projectData, updatedAt: new Date().toISOString() } 
          : state.currentProject,
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ error: 'Failed to update project', isLoading: false });
      return false;
    }
  },
  
  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      set(state => ({
        projects: state.projects.filter(project => project.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ error: 'Failed to delete project', isLoading: false });
      return false;
    }
  }
}));

export default useProjectStore;