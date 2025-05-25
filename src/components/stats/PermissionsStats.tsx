import React, { useMemo } from 'react';
import { Shield, Briefcase, CheckSquare, Calendar, Clock } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { useProjectAccess } from '../../hooks/useProjectAccess';
import { useTaskAccess } from '../../hooks/useTaskAccess';
import { useCalendarAccess } from '../../hooks/useCalendarAccess';
import { useTrackingAccess } from '../../hooks/useTrackingAccess';

/**
 * Componente que exibe estatísticas das permissões do usuário
 */
const PermissionsStats: React.FC = () => {
  const { hasRole } = usePermissions();
  const { userProjects, managedProjects } = useProjectAccess();
  const { userTasks } = useTaskAccess();
  const { hasCalendarAccess } = useCalendarAccess();
  const { hasTrackingAccess } = useTrackingAccess();
  
  // Determinar a função do usuário
  const userRole = useMemo(() => {
    if (hasRole('admin')) return 'Administrador';
    if (hasRole('manager')) return 'Gerente';
    if (hasRole('member')) return 'Membro';
    return 'Desconhecido';
  }, [hasRole]);
  
  // Determinar o nível de acesso
  const accessLevel = useMemo(() => {
    if (hasRole('admin')) return 100;
    
    let score = 0;
    if (managedProjects.length > 0) score += 30;
    if (userProjects.length > 0) score += 20;
    if (userTasks.length > 0) score += 20;
    if (hasCalendarAccess) score += 15;
    if (hasTrackingAccess) score += 15;
    
    return score;
  }, [hasRole, managedProjects.length, userProjects.length, userTasks.length, hasCalendarAccess, hasTrackingAccess]);
  
  // Determinar o nível de texto com base na pontuação
  const accessLevelText = useMemo(() => {
    if (accessLevel >= 90) return 'Completo';
    if (accessLevel >= 70) return 'Amplo';
    if (accessLevel >= 40) return 'Moderado';
    if (accessLevel >= 20) return 'Limitado';
    return 'Mínimo';
  }, [accessLevel]);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex items-center mb-4">
        <Shield className="w-5 h-5 text-indigo-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">Suas Permissões</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Função</p>
          <p className="font-medium text-gray-900">{userRole}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Nível de Acesso</p>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${accessLevel}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700">{accessLevelText}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center">
            <Briefcase className="w-4 h-4 text-indigo-600 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Projetos</p>
              <p className="font-medium text-gray-900">{userProjects.length}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <CheckSquare className="w-4 h-4 text-indigo-600 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Tarefas</p>
              <p className="font-medium text-gray-900">{userTasks.length}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-indigo-600 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Calendário</p>
              <p className="font-medium text-gray-900">{hasCalendarAccess ? 'Sim' : 'Não'}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-indigo-600 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Tracking</p>
              <p className="font-medium text-gray-900">{hasTrackingAccess ? 'Sim' : 'Não'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsStats;
