import { useMemo } from 'react';
import useAuthStore from '../store/authStore';
import { usePermissions } from './usePermissions';
import { Project } from '../types';

/**
 * Hook personalizado para gerenciar acesso a projetos
 * Fornece funu00e7u00f5es e dados relacionados ao acesso do usuu00e1rio a projetos
 */
export const useProjectAccess = () => {
  const { user, userProjects, projectMemberships } = useAuthStore();
  const { hasPermission, filterByPermission } = usePermissions();

  // Projetos que o usuu00e1rio gerencia
  const managedProjects = useMemo(() => {
    if (!user) return [];
    
    return projectMemberships
      .filter(membership => membership.role === 'manager')
      .map(membership => userProjects.find(p => p.id === membership.project_id))
      .filter(Boolean) as Project[];
  }, [user, projectMemberships, userProjects]);

  // Projetos que o usuu00e1rio u00e9 membro (nu00e3o gerente)
  const memberProjects = useMemo(() => {
    if (!user) return [];
    
    return projectMemberships
      .filter(membership => membership.role === 'member')
      .map(membership => userProjects.find(p => p.id === membership.project_id))
      .filter(Boolean) as Project[];
  }, [user, projectMemberships, userProjects]);

  /**
   * Verifica se o usuu00e1rio tem acesso a um projeto especu00edfico
   * @param projectId ID do projeto
   */
  const hasProjectAccess = (projectId: string): boolean => {
    return hasPermission('project', 'view', { id: projectId });
  };

  /**
   * Verifica se o usuu00e1rio pode editar um projeto especu00edfico
   * @param projectId ID do projeto
   */
  const canEditProject = (projectId: string): boolean => {
    return hasPermission('project', 'edit', { id: projectId });
  };

  /**
   * Verifica se o usuu00e1rio u00e9 gerente de um projeto especu00edfico
   * @param projectId ID do projeto
   */
  const isProjectManager = (projectId: string): boolean => {
    return projectMemberships.some(
      membership => membership.project_id === projectId && membership.role === 'manager'
    );
  };

  /**
   * Filtra uma lista de projetos com base nas permissu00f5es do usuu00e1rio
   * @param projects Lista de projetos para filtrar
   */
  const filterAccessibleProjects = (projects: Project[]): Project[] => {
    return filterByPermission(projects, 'project', 'view');
  };

  /**
   * Filtra uma lista de projetos para mostrar apenas os que o usuu00e1rio pode editar
   * @param projects Lista de projetos para filtrar
   */
  const filterEditableProjects = (projects: Project[]): Project[] => {
    return filterByPermission(projects, 'project', 'edit');
  };

  return {
    // Dados
    userProjects,
    managedProjects,
    memberProjects,
    projectMemberships,
    
    // Funu00e7u00f5es
    hasProjectAccess,
    canEditProject,
    isProjectManager,
    filterAccessibleProjects,
    filterEditableProjects,
  };
};
