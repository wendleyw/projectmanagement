import React from 'react';
import { Project, Task } from '../../types';

interface WeekViewProps {
  currentDate: Date;
  projects: Project[];
  tasks: Task[];
  meetings: any[]; // Tipo temporário, será substituído pelo tipo Meeting quando implementado
}

const WeekView: React.FC<WeekViewProps> = ({ currentDate, projects, tasks, meetings }) => {
  // Funções auxiliares para manipulação de datas
  const getWeekDays = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    
    return Array.from({ length: 7 }, (_, i) => {
      const newDate = new Date(date);
      newDate.setDate(diff + i);
      return newDate;
    });
  };
  
  // Obter dias da semana atual
  const weekDays = getWeekDays(currentDate);
  
  // Formatar hora
  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };
  
  // Verificar se uma data é hoje
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  // Verificar se uma tarefa está agendada para um determinado dia e hora
  const getTasksForDateAndHour = (date: Date, hour: number) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      const taskDateStr = taskDate.toISOString().split('T')[0];
      const taskHour = taskDate.getHours();
      return taskDateStr === dateStr && taskHour === hour;
    });
  };
  
  // Verificar se uma reunião está agendada para um determinado dia e hora
  const getMeetingsForDateAndHour = (date: Date, hour: number) => {
    const dateStr = date.toISOString().split('T')[0];
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      const meetingDateStr = meetingDate.toISOString().split('T')[0];
      const meetingHour = meetingDate.getHours();
      return meetingDateStr === dateStr && meetingHour === hour;
    });
  };
  
  // Verificar se um projeto começa ou termina em um determinado dia e hora
  const getProjectEventsForDateAndHour = (date: Date, hour: number) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const projectStarts = projects.filter(project => {
      const startDate = new Date(project.startDate);
      const startDateStr = startDate.toISOString().split('T')[0];
      const startHour = startDate.getHours();
      return startDateStr === dateStr && startHour === hour;
    });
    
    const projectEnds = projects.filter(project => {
      const endDate = new Date(project.endDate);
      const endDateStr = endDate.toISOString().split('T')[0];
      const endHour = endDate.getHours();
      return endDateStr === dateStr && endHour === hour;
    });
    
    return { starts: projectStarts, ends: projectEnds };
  };
  
  // Horas de trabalho (8h às 18h)
  const workHours = Array.from({ length: 11 }, (_, i) => i + 8);
  
  // Nomes dos dias da semana
  const weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Cabeçalho com os dias da semana */}
      <div className="grid grid-cols-8 text-center text-xs font-medium text-gray-500 border-b border-gray-200 bg-gray-50">
        <div className="py-2 border-r border-gray-200">Hora</div>
        {weekDays.map((date, index) => {
          const dayName = weekDayNames[date.getDay()];
          const day = date.getDate();
          const today = isToday(date);
          
          return (
            <div 
              key={`header-${index}`} 
              className={`py-2 ${today ? 'bg-blue-50 font-bold text-blue-600' : ''}`}
            >
              {dayName} {day}
            </div>
          );
        })}
      </div>
      
      {/* Grade de horas */}
      {workHours.map(hour => (
        <div key={`hour-${hour}`} className="grid grid-cols-8 text-sm border-b border-gray-200">
          {/* Coluna da hora */}
          <div className="py-3 px-2 border-r border-gray-200 text-gray-500 text-center">
            {formatHour(hour)}
          </div>
          
          {/* Colunas dos dias */}
          {weekDays.map((date, dayIndex) => {
            const dayTasks = getTasksForDateAndHour(date, hour);
            const dayMeetings = getMeetingsForDateAndHour(date, hour);
            const { starts: projectStarts, ends: projectEnds } = getProjectEventsForDateAndHour(date, hour);
            const today = isToday(date);
            
            return (
              <div 
                key={`cell-${hour}-${dayIndex}`} 
                className={`p-1 min-h-[60px] ${today ? 'bg-blue-50' : 'bg-white'} ${dayIndex < 6 ? 'border-r border-gray-200' : ''}`}
              >
                {/* Eventos */}
                <div className="space-y-1">
                  {/* Início de projetos */}
                  {projectStarts.map((project) => (
                    <div 
                      key={`start-${project.id}`} 
                      className="text-xs px-1 py-0.5 rounded bg-green-100 text-green-800 truncate"
                      title={`Início: ${project.name}`}
                    >
                      🚀 {project.name}
                    </div>
                  ))}
                  
                  {/* Fim de projetos */}
                  {projectEnds.map((project) => (
                    <div 
                      key={`end-${project.id}`} 
                      className="text-xs px-1 py-0.5 rounded bg-purple-100 text-purple-800 truncate"
                      title={`Fim: ${project.name}`}
                    >
                      🏁 {project.name}
                    </div>
                  ))}
                  
                  {/* Tarefas */}
                  {dayTasks.map((task) => (
                    <div 
                      key={`task-${task.id}`} 
                      className="text-xs px-1 py-0.5 rounded bg-blue-100 text-blue-800 truncate"
                      title={task.title}
                    >
                      ✓ {task.title}
                    </div>
                  ))}
                  
                  {/* Reuniões */}
                  {dayMeetings.map((meeting, index) => (
                    <div 
                      key={`meeting-${index}`} 
                      className="text-xs px-1 py-0.5 rounded bg-yellow-100 text-yellow-800 truncate"
                      title={meeting.title}
                    >
                      📅 {meeting.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default WeekView;
