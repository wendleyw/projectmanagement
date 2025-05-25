import { useMemo } from 'react';
import { usePermissions } from './usePermissions';
import { useTaskAccess } from './useTaskAccess';

/**
 * Hook personalizado para gerenciar acesso a recursos de tracking (tempo e progresso)
 * Fornece funu00e7u00f5es para verificar se o usuu00e1rio tem permissu00f5es para acessar e gerenciar registros de tempo
 */
export const useTrackingAccess = () => {
  const { hasPermission, hasRole } = usePermissions();
  const { userTasks, hasTaskAccess } = useTaskAccess();

  // Verifica se o usuu00e1rio tem acesso ao sistema de tracking
  const hasTrackingAccess = useMemo(() => {
    return hasPermission('tracking', 'view');
  }, [hasPermission]);

  /**
   * Verifica se o usuu00e1rio pode ver um registro de tempo especu00edfico
   * @param timeEntry Registro de tempo para verificar
   */
  const canViewTimeEntry = (timeEntry: any) => {
    // Administradores podem ver todos os registros
    if (hasRole('admin')) return true;
    
    // Se o usuu00e1rio nu00e3o tem acesso ao tracking, nu00e3o pode ver nenhum registro
    if (!hasTrackingAccess) return false;

    // Usuu00e1rios podem sempre ver seus pru00f3prios registros de tempo
    if (timeEntry.user_id && hasPermission('user', 'self', { id: timeEntry.user_id })) {
      return true;
    }

    // Verificar se o registro estu00e1 relacionado a uma tarefa que o usuu00e1rio tem acesso
    if (timeEntry.task_id && hasTaskAccess(timeEntry.task_id)) {
      return true;
    }

    // Gerentes de projeto podem ver registros de tempo das tarefas do projeto
    if (timeEntry.project_id && hasPermission('project', 'manage_members', { id: timeEntry.project_id })) {
      return true;
    }

    return false;
  };

  /**
   * Verifica se o usuu00e1rio pode editar um registro de tempo especu00edfico
   * @param timeEntry Registro de tempo para verificar
   */
  const canEditTimeEntry = (timeEntry: any) => {
    // Administradores podem editar todos os registros
    if (hasRole('admin')) return true;

    // Usuu00e1rios podem editar apenas seus pru00f3prios registros de tempo
    if (timeEntry.user_id && hasPermission('user', 'self', { id: timeEntry.user_id })) {
      return true;
    }

    return false;
  };

  /**
   * Filtra uma lista de registros de tempo com base nas permissu00f5es do usuu00e1rio
   * @param timeEntries Lista de registros para filtrar
   */
  const filterAccessibleTimeEntries = (timeEntries: any[]) => {
    // Administradores podem ver todos os registros
    if (hasRole('admin')) return timeEntries;

    // Se o usuu00e1rio nu00e3o tem acesso ao tracking, nu00e3o pode ver nenhum registro
    if (!hasTrackingAccess) return [];

    return timeEntries.filter(canViewTimeEntry);
  };

  /**
   * Filtra uma lista de registros de tempo para mostrar apenas os que o usuu00e1rio pode editar
   * @param timeEntries Lista de registros para filtrar
   */
  const filterEditableTimeEntries = (timeEntries: any[]) => {
    // Administradores podem editar todos os registros
    if (hasRole('admin')) return timeEntries;

    return timeEntries.filter(canEditTimeEntry);
  };

  return {
    hasTrackingAccess,
    canViewTimeEntry,
    canEditTimeEntry,
    filterAccessibleTimeEntries,
    filterEditableTimeEntries,
    userTasks
  };
};
