import React from 'react';
import { Shield, User, Settings } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { useProjectAccess } from '../../hooks/useProjectAccess';
import { useTaskAccess } from '../../hooks/useTaskAccess';
import { Link } from 'react-router-dom';

interface PermissionsCardProps {
  compact?: boolean;
  showActions?: boolean;
}

/**
 * Componente de cartão que exibe um resumo das permissões do usuário
 * Pode ser usado em diferentes partes da aplicação
 */
const PermissionsCard: React.FC<PermissionsCardProps> = ({ 
  compact = false,
  showActions = true
}) => {
  const { hasRole, hasPermission } = usePermissions();
  const { userProjects } = useProjectAccess();
  const { userTasks } = useTaskAccess();
  
  // Determinar a função do usuário
  const userRole = hasRole('admin') 
    ? 'Administrador' 
    : hasRole('manager') 
      ? 'Gerente' 
      : 'Membro';
  
  // Determinar o status de acesso
  const accessStatus = {
    projects: userProjects.length > 0,
    tasks: userTasks.length > 0,
    calendar: hasPermission('calendar', 'view'),
    tracking: hasPermission('tracking', 'view')
  };
  
  // Contar o número de recursos com acesso
  const accessCount = Object.values(accessStatus).filter(Boolean).length;
  
  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Shield className="w-4 h-4 text-indigo-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-800">Permissões</h3>
          </div>
          <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
            {userRole}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{accessCount}/4 recursos</span>
          {showActions && (
            <Link to="/permissions-docs" className="text-indigo-600 hover:text-indigo-800">
              Detalhes
            </Link>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Shield className="w-5 h-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Permissões</h3>
        </div>
        <span className="text-sm font-medium px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-full">
          {userRole}
        </span>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Projetos</span>
          <span className="text-sm font-medium">
            {accessStatus.projects ? (
              <span className="text-green-600">Acesso</span>
            ) : (
              <span className="text-gray-400">Sem acesso</span>
            )}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Tarefas</span>
          <span className="text-sm font-medium">
            {accessStatus.tasks ? (
              <span className="text-green-600">Acesso</span>
            ) : (
              <span className="text-gray-400">Sem acesso</span>
            )}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Calendário</span>
          <span className="text-sm font-medium">
            {accessStatus.calendar ? (
              <span className="text-green-600">Acesso</span>
            ) : (
              <span className="text-gray-400">Sem acesso</span>
            )}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Tracking</span>
          <span className="text-sm font-medium">
            {accessStatus.tracking ? (
              <span className="text-green-600">Acesso</span>
            ) : (
              <span className="text-gray-400">Sem acesso</span>
            )}
          </span>
        </div>
      </div>
      
      {showActions && (
        <div className="pt-3 border-t border-gray-100 flex justify-between">
          <Link 
            to="/permissions-docs" 
            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <User className="w-4 h-4 mr-1" />
            Documentação
          </Link>
          
          {hasRole('admin') && (
            <Link 
              to="/permissions-example" 
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <Settings className="w-4 h-4 mr-1" />
              Configurar
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default PermissionsCard;
