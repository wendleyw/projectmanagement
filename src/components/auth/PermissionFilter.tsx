import React, { ReactNode, useEffect, useState } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { useProjectAccess } from '../../hooks/useProjectAccess';
import { useTaskAccess } from '../../hooks/useTaskAccess';
import { Project, Task } from '../../types';

interface PermissionFilterProps<T> {
  children: (filteredData: T[]) => ReactNode;
  data: T[];
  resourceType: 'projects' | 'tasks' | 'calendar' | 'tracking';
  action?: 'view' | 'edit' | 'manage_members'; // Ação requerida (padrão: 'view')
}

/**
 * Componente que filtra dados com base nas permissões do usuário
 * Útil para exibir apenas os recursos que o usuário tem permissão para acessar
 */
function PermissionFilter<T>({ 
  children, 
  data, 
  resourceType,
  action = 'view'
}: PermissionFilterProps<T>) {
  const { hasPermission, hasRole } = usePermissions();
  const { filterAccessibleProjects, filterEditableProjects } = useProjectAccess();
  const { filterAccessibleTasks, filterEditableTasks } = useTaskAccess();
  const [filteredData, setFilteredData] = useState<T[]>([]);
  
  useEffect(() => {
    // Se os dados forem vazios, retorna array vazio
    if (!data || data.length === 0) {
      setFilteredData([]);
      return;
    }
    
    // Administradores têm acesso a tudo
    if (hasRole('admin')) {
      setFilteredData(data);
      return;
    }
    
    // Filtra os dados com base no tipo de recurso
    switch (resourceType) {
      case 'projects':
        // Filtra projetos que o usuário tem permissão para acessar
        if (action === 'view') {
          setFilteredData(filterAccessibleProjects(data as unknown as Project[]) as unknown as T[]);
        } else if (action === 'edit') {
          setFilteredData(filterEditableProjects(data as unknown as Project[]) as unknown as T[]);
        } else {
          // Para outras ações, filtra com base na permissão específica
          setFilteredData(
            (data as unknown as Project[]).filter(project => 
              hasPermission('project', action, { id: project.id })
            ) as unknown as T[]
          );
        }
        break;
        
      case 'tasks':
        // Filtra tarefas que o usuário tem permissão para acessar
        if (action === 'view') {
          setFilteredData(filterAccessibleTasks(data as unknown as Task[]) as unknown as T[]);
        } else if (action === 'edit') {
          setFilteredData(filterEditableTasks(data as unknown as Task[]) as unknown as T[]);
        } else {
          // Para outras ações, filtra com base na permissão específica
          setFilteredData(
            (data as unknown as Task[]).filter(task => 
              hasPermission('task', action, { id: task.id })
            ) as unknown as T[]
          );
        }
        break;
        
      case 'calendar':
        // Verifica se o usuário tem acesso ao calendário
        if (hasPermission('calendar', action)) {
          // Filtra eventos do calendário relacionados a projetos/tarefas que o usuário tem acesso
          setFilteredData(
            data.filter((event: any) => {
              // Se o evento estiver relacionado a uma tarefa
              if (event.task_id) {
                return hasPermission('task', 'view', { id: event.task_id });
              }
              // Se o evento estiver relacionado a um projeto
              if (event.project_id) {
                return hasPermission('project', 'view', { id: event.project_id });
              }
              // Eventos gerais são mostrados apenas para administradores
              return hasRole('admin');
            }) as T[]
          );
        } else {
          setFilteredData([]);
        }
        break;
        
      case 'tracking':
        // Verifica se o usuário tem acesso ao tracking
        if (hasPermission('tracking', action)) {
          // Filtra registros de tempo relacionados a tarefas que o usuário tem acesso
          setFilteredData(
            data.filter((timeEntry: any) => {
              if (timeEntry.task_id) {
                return hasPermission('task', 'view', { id: timeEntry.task_id });
              }
              if (timeEntry.user_id === hasPermission('user', 'self', { id: timeEntry.user_id })) {
                return true; // Usuário sempre pode ver seus próprios registros
              }
              return false;
            }) as T[]
          );
        } else {
          setFilteredData([]);
        }
        break;
        
      default:
        setFilteredData([]);
    }
  }, [
    data, 
    resourceType, 
    action, 
    hasPermission, 
    hasRole, 
    filterAccessibleProjects, 
    filterEditableProjects, 
    filterAccessibleTasks, 
    filterEditableTasks
  ]);
  
  // Renderiza os filhos passando os dados filtrados
  return <>{children(filteredData)}</>;
}

export default PermissionFilter;
