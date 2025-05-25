import React from 'react';
import { Clock, DollarSign, Briefcase, Users } from 'lucide-react';
import useTimeTrackingStore from '../../store/timeTrackingStore';
import useProjectStore from '../../store/projectStore';
import useUserStore from '../../store/userStore';

interface TimeTrackingSummaryProps {
  filter: {
    startDate?: string;
    endDate?: string;
    projectId?: string;
    userId?: string;
  };
}

const TimeTrackingSummary: React.FC<TimeTrackingSummaryProps> = ({ filter }) => {
  const { entries } = useTimeTrackingStore();
  const { projects } = useProjectStore();
  const { users } = useUserStore();
  
  // Filtrar entradas com base nos filtros fornecidos
  const filteredEntries = entries.filter(entry => {
    if (filter?.startDate && entry.date < filter.startDate) return false;
    if (filter?.endDate && entry.date > filter.endDate) return false;
    if (filter?.projectId && entry.projectId !== filter.projectId) return false;
    if (filter?.userId && entry.userId !== filter.userId) return false;
    return true;
  });
  
  // Calcular tempo total (usando hours em vez de duration)
  const totalTime = filteredEntries.reduce((total, entry) => total + (entry.hours || 0) * 3600, 0);
  
  // Calcular tempo faturável (usando hours em vez de duration)
  const billableTime = filteredEntries
    .filter(entry => entry.billable)
    .reduce((total, entry) => total + (entry.hours || 0) * 3600, 0);
  
  // Calcular percentual faturável
  const billablePercentage = totalTime > 0 ? (billableTime / totalTime) * 100 : 0;
  
  // Calcular número de projetos únicos
  const uniqueProjects = new Set(filteredEntries.map(entry => entry.projectId));
  
  // Calcular número de usuários únicos
  const uniqueUsers = new Set(filteredEntries.map(entry => entry.userId));
  
  // Formatar duração
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  };
  
  // Obter nome do projeto
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Projeto desconhecido';
  };
  
  // Obter nome do usuário
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Usuário desconhecido';
  };
  
  // Calcular tempo por projeto
  const timeByProject = Array.from(uniqueProjects).map(projectId => {
    const projectEntries = filteredEntries.filter(entry => entry.projectId === projectId);
    const projectTime = projectEntries.reduce((total, entry) => total + entry.duration, 0);
    const percentage = totalTime > 0 ? (projectTime / totalTime) * 100 : 0;
    
    return {
      projectId: projectId as string,
      name: getProjectName(projectId as string),
      time: projectTime,
      percentage
    };
  }).sort((a, b) => b.time - a.time);
  
  // Calcular tempo por usuário
  const timeByUser = Array.from(uniqueUsers).map(userId => {
    const userEntries = filteredEntries.filter(entry => entry.userId === userId);
    const userTime = userEntries.reduce((total, entry) => total + entry.duration, 0);
    const percentage = totalTime > 0 ? (userTime / totalTime) * 100 : 0;
    
    return {
      userId: userId as string,
      name: getUserName(userId as string),
      time: userTime,
      percentage
    };
  }).sort((a, b) => b.time - a.time);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-blue-600" size={20} />
            <h4 className="text-sm font-medium text-gray-700">Tempo Total</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatDuration(totalTime)}</p>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-green-600" size={20} />
            <h4 className="text-sm font-medium text-gray-700">Tempo Faturável</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatDuration(billableTime)}
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({billablePercentage.toFixed(0)}%)
            </span>
          </p>
        </div>
        
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="text-purple-600" size={20} />
            <h4 className="text-sm font-medium text-gray-700">Projetos</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900">{uniqueProjects.size}</p>
        </div>
        
        <div className="p-4 bg-amber-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-amber-600" size={20} />
            <h4 className="text-sm font-medium text-gray-700">Usuários</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900">{uniqueUsers.size}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tempo por projeto */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Briefcase size={16} />
            Tempo por Projeto
          </h4>
          
          {timeByProject.length > 0 ? (
            <div className="space-y-3">
              {timeByProject.slice(0, 5).map(project => (
                <div key={project.projectId}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700">{project.name}</span>
                    <span className="text-sm text-gray-500">{formatDuration(project.time)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${project.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              
              {timeByProject.length > 5 && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  +{timeByProject.length - 5} outros projetos
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nenhum dado disponível</p>
          )}
        </div>
        
        {/* Tempo por usuário */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Users size={16} />
            Tempo por Usuário
          </h4>
          
          {timeByUser.length > 0 ? (
            <div className="space-y-3">
              {timeByUser.slice(0, 5).map(user => (
                <div key={user.userId}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700">{user.name}</span>
                    <span className="text-sm text-gray-500">{formatDuration(user.time)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${user.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              
              {timeByUser.length > 5 && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  +{timeByUser.length - 5} outros usuários
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nenhum dado disponível</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeTrackingSummary;
