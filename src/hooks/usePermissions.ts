import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { Permission } from '../types';

/**
 * Hook personalizado para gerenciar permissões do usuário
 * Fornece funções para verificar se o usuário tem permissões específicas
 */
export const usePermissions = () => {
  const { 
    user, 
    permissions, 
    loadUserPermissions,
    canViewProject,
    canEditProject,
    canViewTask,
    canEditTask,
    hasRole,
    isProjectManager
  } = useAuthStore();

  // Carregar permissões quando o hook for montado
  useEffect(() => {
    if (user && permissions.length === 0) {
      loadUserPermissions();
    }
  }, [user, permissions.length, loadUserPermissions]);

  /**
   * Verifica se o usuário tem uma permissão específica
   * @param resource Tipo de recurso (ex: 'project', 'task')
   * @param action Ação permitida (ex: 'view', 'edit')
   * @param conditions Condições adicionais (ex: { id: 'project-id' })
   */
  const hasPermission = (resource: string, action: string, conditions?: Record<string, any>): boolean => {
    // Administradores têm todas as permissões
    if (user?.role === 'admin') return true;

    // Verificar permissões específicas
    return permissions.some(permission => {
      // Verificar se o recurso e a ação correspondem
      const resourceMatch = permission.resource === resource;
      const actionMatch = permission.action === action;

      // Se não houver condições, apenas verificar recurso e ação
      if (!conditions || !permission.conditions) {
        return resourceMatch && actionMatch;
      }

      // Verificar se todas as condições correspondem
      const conditionsMatch = Object.entries(conditions).every(
        ([key, value]) => permission.conditions?.[key] === value
      );

      return resourceMatch && actionMatch && conditionsMatch;
    });
  };

  /**
   * Filtra uma lista de itens com base nas permissões do usuário
   * @param items Lista de itens para filtrar
   * @param resource Tipo de recurso
   * @param action Ação permitida
   * @param idField Nome do campo que contém o ID do item
   */
  const filterByPermission = <T extends Record<string, any>>(
    items: T[],
    resource: string,
    action: string,
    idField: string = 'id'
  ): T[] => {
    // Administradores podem ver todos os itens
    if (user?.role === 'admin') return items;

    // Filtrar itens com base nas permissões
    return items.filter(item => {
      const itemId = item[idField];
      return hasPermission(resource, action, { id: itemId });
    });
  };

  return {
    // Funções do authStore
    canViewProject,
    canEditProject,
    canViewTask,
    canEditTask,
    hasRole,
    isProjectManager,
    
    // Funções adicionais
    hasPermission,
    filterByPermission,
    permissions,
  };
};
