import React from 'react';
import { User } from '../../store/userStore';
import useProjectStore from '../../store/projectStore';
import useTaskStore from '../../store/taskStore';
import useTimeEntryStore from '../../store/timeEntryStore';
import { formatDuration } from '../../utils/dateUtils';

interface TeamMemberStatsProps {
  member: User;
}

const TeamMemberStats: React.FC<TeamMemberStatsProps> = ({ member }) => {
  const { projects } = useProjectStore();
  const { tasks } = useTaskStore();
  const { timeEntries } = useTimeEntryStore();
  
  // Obter projetos atribuídos ao membro
  const assignedProjects = projects ? projects.filter(project => 
    project.teamMembers && Array.isArray(project.teamMembers) && project.teamMembers.includes(member.id)
  ) : [];
  
  // Obter tarefas atribuídas ao membro
  const assignedTasks = tasks ? tasks.filter(task => task.assigneeId === member.id) : [];
  
  // Obter tarefas concluídas
  const completedTasks = assignedTasks.filter(task => task.status === 'completed');
  
  // Calcular taxa de conclusão
  const completionRate = assignedTasks.length > 0 
    ? Math.round((completedTasks.length / assignedTasks.length) * 100) 
    : 0;
  
  // Obter entradas de tempo do membro
  const memberTimeEntries = timeEntries ? timeEntries.filter(entry => entry.userId === member.id) : [];
  
  // Calcular tempo total registrado em segundos (convertendo horas para segundos)
  const totalTimeTracked = memberTimeEntries.reduce((total, entry) => {
    return total + ((entry.hours || 0) * 3600);
  }, 0);
  
  // Calcular tempo médio por tarefa
  const averageTimePerTask = completedTasks.length > 0 
    ? totalTimeTracked / completedTasks.length 
    : 0;
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Estatísticas do Membro</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Projetos</h4>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-blue-600">{assignedProjects.length}</span>
            <span className="text-xs text-blue-500">Atribuídos</span>
          </div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-md">
          <h4 className="text-sm font-medium text-green-800 mb-2">Tarefas</h4>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-green-600">{assignedTasks.length}</span>
            <span className="text-xs text-green-500">Total</span>
          </div>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-sm font-medium text-green-600">{completedTasks.length}</span>
            <span className="text-xs text-green-500">Concluídas</span>
          </div>
        </div>
        
        <div className="bg-purple-50 p-3 rounded-md">
          <h4 className="text-sm font-medium text-purple-800 mb-2">Taxa de Conclusão</h4>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-purple-600 h-2.5 rounded-full" 
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <span className="ml-2 text-sm font-medium text-purple-600">{completionRate}%</span>
          </div>
        </div>
        
        <div className="bg-orange-50 p-3 rounded-md">
          <h4 className="text-sm font-medium text-orange-800 mb-2">Tempo Registrado</h4>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-orange-600">{formatDuration(totalTimeTracked)}</span>
            <span className="text-xs text-orange-500">Total</span>
          </div>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-sm font-medium text-orange-600">{formatDuration(averageTimePerTask)}</span>
            <span className="text-xs text-orange-500">Média/Tarefa</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberStats;
