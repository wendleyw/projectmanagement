import { useMemo } from 'react';
import useAuthStore from '../store/authStore';
import { usePermissions } from './usePermissions';
import { Task } from '../types';
import { useProjectAccess } from './useProjectAccess';

/**
 * Hook personalizado para gerenciar acesso a tarefas
 * Fornece funções e dados relacionados ao acesso do usuário a tarefas
 */
export const useTaskAccess = () => {
  const { user, userTasks, taskAssignments } = useAuthStore();
  const { hasPermission, filterByPermission } = usePermissions();
  const { hasProjectAccess, isProjectManager } = useProjectAccess();

  // Tarefas atribuídas ao usuário
  const assignedTasks = useMemo(() => {
    if (!user) return [];
    
    return taskAssignments
      .map(assignment => userTasks.find(t => t.id === assignment.task_id))
      .filter(Boolean) as Task[];
  }, [user, taskAssignments, userTasks]);

  /**
   * Verifica se o usuário tem acesso a uma tarefa específica
   * @param taskId ID da tarefa
   */
  const hasTaskAccess = (taskId: string): boolean => {
    // Verificar permissão direta para a tarefa
    if (hasPermission('task', 'view', { id: taskId })) {
      return true;
    }

    // Verificar se o usuário tem acesso ao projeto da tarefa
    const task = userTasks.find(t => t.id === taskId);
    if (task && hasProjectAccess(task.project_id)) {
      return true;
    }

    return false;
  };

  /**
   * Verifica se o usuário pode editar uma tarefa específica
   * @param taskId ID da tarefa
   */
  const canEditTask = (taskId: string): boolean => {
    // Verificar permissão direta para editar a tarefa
    if (hasPermission('task', 'edit', { id: taskId })) {
      return true;
    }

    // Verificar se o usuário é gerente do projeto da tarefa
    const task = userTasks.find(t => t.id === taskId);
    if (task && isProjectManager(task.project_id)) {
      return true;
    }

    return false;
  };

  /**
   * Verifica se a tarefa está atribuída ao usuário
   * @param taskId ID da tarefa
   */
  const isTaskAssigned = (taskId: string): boolean => {
    return taskAssignments.some(assignment => assignment.task_id === taskId);
  };

  /**
   * Filtra uma lista de tarefas com base nas permissões do usuário
   * @param tasks Lista de tarefas para filtrar
   */
  const filterAccessibleTasks = (tasks: Task[]): Task[] => {
    // Administradores podem ver todas as tarefas
    if (user?.role === 'admin') return tasks;

    return tasks.filter(task => {
      // Verificar permissão direta para a tarefa
      if (hasPermission('task', 'view', { id: task.id })) {
        return true;
      }

      // Verificar se o usuário tem acesso ao projeto da tarefa
      return hasProjectAccess(task.project_id);
    });
  };

  /**
   * Filtra uma lista de tarefas para mostrar apenas as que o usuário pode editar
   * @param tasks Lista de tarefas para filtrar
   */
  const filterEditableTasks = (tasks: Task[]): Task[] => {
    // Administradores podem editar todas as tarefas
    if (user?.role === 'admin') return tasks;

    return tasks.filter(task => {
      // Verificar permissão direta para editar a tarefa
      if (hasPermission('task', 'edit', { id: task.id })) {
        return true;
      }

      // Verificar se o usuário é gerente do projeto da tarefa
      return isProjectManager(task.project_id);
    });
  };

  return {
    // Dados
    userTasks,
    assignedTasks,
    taskAssignments,
    
    // Funções
    hasTaskAccess,
    canEditTask,
    isTaskAssigned,
    filterAccessibleTasks,
    filterEditableTasks,
  };
};
