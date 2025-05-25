import React from 'react';
import { Project, Task } from '../../types';

interface DayViewProps {
  currentDate: Date;
  projects: Project[];
  tasks: Task[];
  meetings: any[]; // Tipo temporário, será substituído pelo tipo Meeting quando implementado
}

const DayView: React.FC<DayViewProps> = ({ currentDate, projects, tasks, meetings }) => {
  // Formatar hora
  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };
  
  // Verificar se uma tarefa está agendada para uma determinada hora
  const getTasksForHour = (hour: number) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      const taskDay = taskDate.getDate();
      const taskMonth = taskDate.getMonth();
      const taskYear = taskDate.getFullYear();
      const taskHour = taskDate.getHours();
      
      return taskDay === currentDate.getDate() &&
             taskMonth === currentDate.getMonth() &&
             taskYear === currentDate.getFullYear() &&
             taskHour === hour;
    });
  };
  
  // Verificar se uma reunião está agendada para uma determinada hora
  const getMeetingsForHour = (hour: number) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      const meetingDay = meetingDate.getDate();
      const meetingMonth = meetingDate.getMonth();
      const meetingYear = meetingDate.getFullYear();
      const meetingHour = meetingDate.getHours();
      
      return meetingDay === currentDate.getDate() &&
             meetingMonth === currentDate.getMonth() &&
             meetingYear === currentDate.getFullYear() &&
             meetingHour === hour;
    });
  };
  
  // Verificar se um projeto começa ou termina em uma determinada hora
  const getProjectEventsForHour = (hour: number) => {
    const projectStarts = projects.filter(project => {
      const startDate = new Date(project.startDate);
      const startDay = startDate.getDate();
      const startMonth = startDate.getMonth();
      const startYear = startDate.getFullYear();
      const startHour = startDate.getHours();
      
      return startDay === currentDate.getDate() &&
             startMonth === currentDate.getMonth() &&
             startYear === currentDate.getFullYear() &&
             startHour === hour;
    });
    
    const projectEnds = projects.filter(project => {
      const endDate = new Date(project.endDate);
      const endDay = endDate.getDate();
      const endMonth = endDate.getMonth();
      const endYear = endDate.getFullYear();
      const endHour = endDate.getHours();
      
      return endDay === currentDate.getDate() &&
             endMonth === currentDate.getMonth() &&
             endYear === currentDate.getFullYear() &&
             endHour === hour;
    });
    
    return { starts: projectStarts, ends: projectEnds };
  };
  
  // Horas do dia (das 6h às 22h)
  const dayHours = Array.from({ length: 17 }, (_, i) => i + 6);
  
  // Formatar data do cabeçalho
  const formatHeaderDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Verificar se a hora atual é a hora atual do dia
  const isCurrentHour = (hour: number) => {
    const now = new Date();
    return now.getHours() === hour &&
           now.getDate() === currentDate.getDate() &&
           now.getMonth() === currentDate.getMonth() &&
           now.getFullYear() === currentDate.getFullYear();
  };
  
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Cabeçalho com a data */}
      <div className="text-center text-sm font-medium text-gray-700 border-b border-gray-200 bg-gray-50 py-3">
        {formatHeaderDate(currentDate)}
      </div>
      
      {/* Grade de horas */}
      <div className="divide-y divide-gray-200">
        {dayHours.map(hour => {
          const hourTasks = getTasksForHour(hour);
          const hourMeetings = getMeetingsForHour(hour);
          const { starts: projectStarts, ends: projectEnds } = getProjectEventsForHour(hour);
          const currentHour = isCurrentHour(hour);
          
          return (
            <div 
              key={`hour-${hour}`} 
              className={`flex ${currentHour ? 'bg-blue-50' : 'bg-white'}`}
            >
              {/* Coluna da hora */}
              <div className="w-20 py-3 px-2 text-gray-500 text-center border-r border-gray-200 flex-shrink-0">
                {formatHour(hour)}
              </div>
              
              {/* Coluna de eventos */}
              <div className="flex-grow p-2 min-h-[80px]">
                <div className="space-y-2">
                  {/* Início de projetos */}
                  {projectStarts.map((project) => (
                    <div 
                      key={`start-${project.id}`} 
                      className="px-3 py-1 rounded-md bg-green-100 text-green-800 text-sm"
                    >
                      🚀 Início do Projeto: {project.name}
                    </div>
                  ))}
                  
                  {/* Fim de projetos */}
                  {projectEnds.map((project) => (
                    <div 
                      key={`end-${project.id}`} 
                      className="px-3 py-1 rounded-md bg-purple-100 text-purple-800 text-sm"
                    >
                      🏁 Fim do Projeto: {project.name}
                    </div>
                  ))}
                  
                  {/* Tarefas */}
                  {hourTasks.map((task) => (
                    <div 
                      key={`task-${task.id}`} 
                      className="px-3 py-1 rounded-md bg-blue-100 text-blue-800 text-sm"
                    >
                      ✓ Tarefa: {task.title}
                    </div>
                  ))}
                  
                  {/* Reuniões */}
                  {hourMeetings.map((meeting, index) => (
                    <div 
                      key={`meeting-${index}`} 
                      className="px-3 py-1 rounded-md bg-yellow-100 text-yellow-800 text-sm flex justify-between items-center"
                    >
                      <div>
                        📅 Reunião: {meeting.title}
                      </div>
                      <div className="text-xs">
                        {meeting.duration} min
                      </div>
                    </div>
                  ))}
                  
                  {/* Mensagem quando não há eventos */}
                  {hourTasks.length === 0 && hourMeetings.length === 0 && projectStarts.length === 0 && projectEnds.length === 0 && (
                    <div className="text-xs text-gray-400 italic">
                      Nenhum evento agendado
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayView;
