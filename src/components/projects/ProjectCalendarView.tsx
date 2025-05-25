import React from 'react';
import { Project, Task } from '../../types';

interface ProjectCalendarViewProps {
  project: Project;
  tasks: Task[];
}

const ProjectCalendarView: React.FC<ProjectCalendarViewProps> = ({ project, tasks }) => {
  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calcular progresso do projeto
  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.status === 'completed');
    return Math.round((completedTasks.length / tasks.length) * 100);
  };

  // Calcular progresso baseado no tempo
  const calculateTimeProgress = () => {
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const today = new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 0;
    }

    const totalDuration = endDate.getTime() - startDate.getTime();
    if (totalDuration <= 0) return 0;

    const elapsedDuration = Math.min(today.getTime() - startDate.getTime(), totalDuration);
    return Math.max(0, Math.min(100, (elapsedDuration / totalDuration) * 100));
  };

  // Calcular meses entre duas datas
  const getMonthsBetween = (startDate: Date, endDate: Date) => {
    const months = [];
    const currentDate = new Date(startDate);
    currentDate.setDate(1); // Começar no primeiro dia do mês

    while (currentDate <= endDate) {
      months.push(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  };

  // Obter dias em um mês
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Verificar se uma data está dentro do período do projeto
  const isDateInProject = (date: Date) => {
    const projectStart = new Date(project.startDate);
    const projectEnd = new Date(project.endDate);
    return date >= projectStart && date <= projectEnd;
  };

  // Verificar se uma data tem tarefas
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };

  // Verificar se uma data é um marco do projeto
  const isMilestone = (date: Date) => {
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return false;
    }

    const totalDuration = endDate.getTime() - startDate.getTime();
    if (totalDuration <= 0) return false;

    const quarterPoint = new Date(startDate.getTime() + totalDuration * 0.25);
    const halfwayPoint = new Date(startDate.getTime() + totalDuration * 0.5);
    const threeQuarterPoint = new Date(startDate.getTime() + totalDuration * 0.75);

    // Verificar se a data é um dos marcos (com tolerância de 1 dia)
    const dateTime = date.getTime();
    const isQuarter = Math.abs(dateTime - quarterPoint.getTime()) < 24 * 60 * 60 * 1000;
    const isHalf = Math.abs(dateTime - halfwayPoint.getTime()) < 24 * 60 * 60 * 1000;
    const isThreeQuarter = Math.abs(dateTime - threeQuarterPoint.getTime()) < 24 * 60 * 60 * 1000;

    return isQuarter || isHalf || isThreeQuarter;
  };

  // Obter o tipo de marco
  const getMilestoneType = (date: Date) => {
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return '';
    }

    const totalDuration = endDate.getTime() - startDate.getTime();
    if (totalDuration <= 0) return '';

    const quarterPoint = new Date(startDate.getTime() + totalDuration * 0.25);
    const halfwayPoint = new Date(startDate.getTime() + totalDuration * 0.5);
    const threeQuarterPoint = new Date(startDate.getTime() + totalDuration * 0.75);

    // Verificar qual marco é
    const dateTime = date.getTime();
    if (Math.abs(dateTime - quarterPoint.getTime()) < 24 * 60 * 60 * 1000) {
      return 'Planejamento (25%)';
    } else if (Math.abs(dateTime - halfwayPoint.getTime()) < 24 * 60 * 60 * 1000) {
      return 'Meio-Termo (50%)';
    } else if (Math.abs(dateTime - threeQuarterPoint.getTime()) < 24 * 60 * 60 * 1000) {
      return 'Fase Final (75%)';
    }
    return '';
  };

  // Verificar se uma data é hoje
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Obter cor baseada no status do projeto
  const getStatusColor = () => {
    switch (project.status) {
      case 'planned':
        return 'bg-gray-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'on-hold':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Preparar dados para o calendário
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  
  // Verificar se as datas são válidas
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Calendário do Projeto</h3>
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          <p>Não foi possível gerar o calendário. Verifique se as datas do projeto são válidas.</p>
        </div>
      </div>
    );
  }

  // Ajustar para mostrar o mês completo
  const calendarStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const calendarEndDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
  
  // Obter todos os meses entre as datas
  const months = getMonthsBetween(calendarStartDate, calendarEndDate);
  
  // Calcular progresso
  const taskProgress = calculateProgress();
  const timeProgress = calculateTimeProgress();
  const totalProgress = Math.round((taskProgress + timeProgress) / 2);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Calendário do Projeto</h3>
      
      {/* Barra de progresso */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progresso Geral</span>
          <span className="text-sm text-gray-600">{totalProgress}%</span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${getStatusColor()}`}
            style={{ width: `${totalProgress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>{formatDate(project.startDate)}</span>
          <span>{formatDate(project.endDate)}</span>
        </div>
      </div>
      
      {/* Legenda */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
          <span>Hoje</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
          <span>Marco</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
          <span>Tarefa</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-300 rounded-full mr-1"></div>
          <span>Fora do Projeto</span>
        </div>
      </div>
      
      {/* Calendário */}
      <div className="space-y-6">
        {months.map((month) => {
          const year = month.getFullYear();
          const monthNum = month.getMonth();
          const daysInMonth = getDaysInMonth(year, monthNum);
          const monthName = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          
          // Criar array com todos os dias do mês
          const days = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const date = new Date(year, monthNum, day);
            const inProject = isDateInProject(date);
            const dayTasks = getTasksForDate(date);
            const hasTasks = dayTasks.length > 0;
            const milestone = isMilestone(date);
            const milestoneType = getMilestoneType(date);
            const today = isToday(date);
            
            return { day, date, inProject, hasTasks, milestone, milestoneType, today, tasks: dayTasks };
          });
          
          // Obter o dia da semana do primeiro dia do mês (0 = Domingo, 1 = Segunda, ...)
          const firstDayOfWeek = new Date(year, monthNum, 1).getDay();
          
          return (
            <div key={`${year}-${monthNum}`} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 py-2 px-4 border-b border-gray-200">
                <h4 className="font-medium text-gray-700">{monthName}</h4>
              </div>
              
              <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 border-b border-gray-200 bg-gray-50">
                <div className="py-2">Dom</div>
                <div className="py-2">Seg</div>
                <div className="py-2">Ter</div>
                <div className="py-2">Qua</div>
                <div className="py-2">Qui</div>
                <div className="py-2">Sex</div>
                <div className="py-2">Sáb</div>
              </div>
              
              <div className="grid grid-cols-7 text-sm">
                {/* Espaços vazios para alinhar o primeiro dia do mês */}
                {Array.from({ length: firstDayOfWeek }, (_, i) => (
                  <div key={`empty-${i}`} className="p-2 border-b border-r border-gray-200 bg-gray-50"></div>
                ))}
                
                {/* Dias do mês */}
                {days.map(({ day, inProject, hasTasks, milestone, milestoneType, today, tasks }) => {
                  let bgClass = 'bg-white';
                  let textClass = 'text-gray-700';
                  
                  if (!inProject) {
                    bgClass = 'bg-gray-50';
                    textClass = 'text-gray-400';
                  } else if (today) {
                    bgClass = 'bg-blue-50';
                    textClass = 'text-blue-700 font-medium';
                  } else if (milestone) {
                    bgClass = 'bg-purple-50';
                    textClass = 'text-purple-700';
                  } else if (hasTasks) {
                    bgClass = 'bg-green-50';
                    textClass = 'text-green-700';
                  }
                  
                  const isLastInRow = (firstDayOfWeek + day - 1) % 7 === 6;
                  const borderClass = `border-b ${isLastInRow ? '' : 'border-r'} border-gray-200`;
                  
                  return (
                    <div 
                      key={`day-${day}`} 
                      className={`p-2 ${borderClass} ${bgClass} relative min-h-[60px]`}
                    >
                      <div className={`${textClass}`}>{day}</div>
                      
                      {milestone && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full"></div>
                      )}
                      
                      {hasTasks && (
                        <div className="mt-1">
                          {tasks.slice(0, 2).map((task, i) => (
                            <div key={`task-${i}`} className="text-xs truncate text-green-700">
                              • {task.title}
                            </div>
                          ))}
                          {tasks.length > 2 && (
                            <div className="text-xs text-gray-500">+{tasks.length - 2} mais</div>
                          )}
                        </div>
                      )}
                      
                      {milestone && (
                        <div className="mt-1 text-xs text-purple-700 font-medium">
                          {milestoneType}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectCalendarView;
