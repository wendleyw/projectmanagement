import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { useProjectAccess } from '../../hooks/useProjectAccess';
import { useTaskAccess } from '../../hooks/useTaskAccess';
import { useIsAuthenticated } from '../../store/authStore';
import { showNotification } from '../../utils/notifications';

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermission: 'project' | 'task' | 'calendar' | 'tracking';
  action?: 'view' | 'edit' | 'manage_members'; // Ação requerida (padrão: 'view')
  resourceId?: string; // Opcional: ID do projeto ou tarefa específica
  fallbackPath?: string; // Caminho para redirecionar se não tiver permissão
}

/**
 * Componente que protege rotas com base nas permissões do usuário
 * Verifica se o usuário tem permissão para acessar um recurso específico
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermission,
  action = 'view',
  resourceId,
  fallbackPath = '/dashboard'
}) => {
  const isAuthenticated = useIsAuthenticated();
  const { hasPermission, hasRole } = usePermissions();
  const { hasProjectAccess } = useProjectAccess();
  const { hasTaskAccess } = useTaskAccess();
  
  // Se não houver usuário logado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Administradores têm acesso a tudo
  if (hasRole('admin')) {
    return <>{children}</>;
  }
  
  // Verifica permissão com base no tipo requerido
  let hasAccess = false;
  
  switch (requiredPermission) {
    case 'project':
      if (resourceId) {
        // Verificar permissão para um projeto específico
        hasAccess = action === 'view' 
          ? hasProjectAccess(resourceId)
          : hasPermission('project', action, { id: resourceId });
      } else {
        // Se não especificar um projeto, verifica se tem a permissão geral
        hasAccess = hasPermission('project', action);
      }
      break;
      
    case 'task':
      if (resourceId) {
        // Verificar permissão para uma tarefa específica
        hasAccess = action === 'view'
          ? hasTaskAccess(resourceId)
          : hasPermission('task', action, { id: resourceId });
      } else {
        // Se não especificar uma tarefa, verifica se tem a permissão geral
        hasAccess = hasPermission('task', action);
      }
      break;
      
    case 'calendar':
      // Permissão para acessar o calendário (pode ser baseada em projetos ou tarefas)
      hasAccess = hasPermission('calendar', action);
      break;
      
    case 'tracking':
      // Permissão para acessar o tracking (pode ser baseada em projetos ou tarefas)
      hasAccess = hasPermission('tracking', action);
      break;
      
    default:
      hasAccess = false;
  }
  
  // Se não tiver permissão, redireciona e mostra notificação
  if (!hasAccess) {
    showNotification('Você não tem permissão para acessar este recurso', 'error');
    return <Navigate to={fallbackPath} />;
  }
  
  // Se tiver permissão, renderiza os filhos
  return <>{children}</>;
};

export default PermissionGuard;
