import { useMemo } from 'react';
import { usePermissions } from './usePermissions';
import { useProjectAccess } from './useProjectAccess';
import { useTaskAccess } from './useTaskAccess';

/**
 * Hook personalizado para gerenciar acesso a eventos do calendu00e1rio
 * Fornece funu00e7u00f5es para verificar se o usuu00e1rio tem permissu00f5es para acessar eventos
 */
export const useCalendarAccess = () => {
  const { hasPermission, hasRole } = usePermissions();
  const { userProjects, hasProjectAccess } = useProjectAccess();
  const { userTasks, hasTaskAccess } = useTaskAccess();

  // Verifica se o usuu00e1rio tem acesso ao calendu00e1rio
  const hasCalendarAccess = useMemo(() => {
    return hasPermission('calendar', 'view');
  }, [hasPermission]);

  /**
   * Verifica se o usuu00e1rio pode ver um evento especu00edfico do calendu00e1rio
   * @param event Evento do calendu00e1rio para verificar
   */
  const canViewEvent = (event: any) => {
    // Administradores podem ver todos os eventos
    if (hasRole('admin')) return true;
    
    // Se o usuu00e1rio nu00e3o tem acesso ao calendu00e1rio, nu00e3o pode ver nenhum evento
    if (!hasCalendarAccess) return false;

    // Verificar se o evento estu00e1 relacionado a uma tarefa que o usuu00e1rio tem acesso
    if (event.task_id && hasTaskAccess(event.task_id)) {
      return true;
    }

    // Verificar se o evento estu00e1 relacionado a um projeto que o usuu00e1rio tem acesso
    if (event.project_id && hasProjectAccess(event.project_id)) {
      return true;
    }

    // Verificar se o evento estu00e1 relacionado ao pru00f3prio usuu00e1rio
    if (event.user_id && hasPermission('user', 'self', { id: event.user_id })) {
      return true;
    }

    return false;
  };

  /**
   * Filtra uma lista de eventos do calendu00e1rio com base nas permissu00f5es do usuu00e1rio
   * @param events Lista de eventos para filtrar
   */
  const filterAccessibleEvents = (events: any[]) => {
    // Administradores podem ver todos os eventos
    if (hasRole('admin')) return events;

    // Se o usuu00e1rio nu00e3o tem acesso ao calendu00e1rio, nu00e3o pode ver nenhum evento
    if (!hasCalendarAccess) return [];

    return events.filter(canViewEvent);
  };

  return {
    hasCalendarAccess,
    canViewEvent,
    filterAccessibleEvents,
    userProjects,
    userTasks
  };
};
