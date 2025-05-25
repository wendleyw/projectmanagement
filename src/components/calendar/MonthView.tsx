import React from 'react';
import { Project, Task } from '../../types';

interface MonthViewProps {
  currentDate: Date;
  projects: Project[];
  tasks: Task[];
  meetings: any[]; // Tipo temporário, será substituído pelo tipo Meeting quando implementado
}

const MonthView: React.FC<MonthViewProps> = ({ currentDate, projects, tasks, meetings }) => {
  // Funções auxiliares para manipulação de datas
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Obter informações do mês atual
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  // Criar array com todos os dias do mês
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = new Date(year, month, day);
    return { day, date };
  });
  
  // Verificar se uma data tem tarefas
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };
  
  // Verificar se uma data tem reuniões
  const getMeetingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date).toISOString().split('T')[0];
      return meetingDate === dateStr;
    });
  };
  
  // Verificar se uma data tem projetos com início ou fim
  const getProjectEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const projectStarts = projects.filter(project => {
      const startDate = new Date(project.startDate).toISOString().split('T')[0];
      return startDate === dateStr;
    });
    
    const projectEnds = projects.filter(project => {
      const endDate = new Date(project.endDate).toISOString().split('T')[0];
      return endDate === dateStr;
    });
    
    return { starts: projectStarts, ends: projectEnds };
  };
  
  // Verificar se uma data é hoje
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  // Nomes dos dias da semana
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Cabeçalho com os dias da semana */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 border-b border-gray-200 bg-gray-50">
        {weekDays.map(day => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>
      
      {/* Grid do calendário */}
      <div className="grid grid-cols-7 text-sm">
        {/* Espaços vazios para alinhar o primeiro dia do mês */}
        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <div key={`empty-${i}`} className="p-2 border-b border-r border-gray-200 bg-gray-50 min-h-[100px]"></div>
        ))}
        
        {/* Dias do mês */}
        {days.map(({ day, date }) => {
          const dayTasks = getTasksForDate(date);
          const dayMeetings = getMeetingsForDate(date);
          const { starts: projectStarts, ends: projectEnds } = getProjectEventsForDate(date);
          const today = isToday(date);
          
          // Determinar a classe de estilo para o dia
          let dayClass = 'bg-white';
          if (today) dayClass = 'bg-blue-50';
          
          // Determinar se este é o último dia da semana (sábado)
          const isLastInRow = (firstDayOfMonth + day - 1) % 7 === 6;
          const borderClass = `border-b ${isLastInRow ? '' : 'border-r'} border-gray-200`;
          
          return (
            <div 
              key={`day-${day}`} 
              className={`p-2 ${borderClass} ${dayClass} min-h-[100px] relative`}
            >
              <div className={`text-sm ${today ? 'font-bold text-blue-600' : 'text-gray-700'} mb-1`}>
                {day}
              </div>
              
              {/* Eventos do dia */}
              <div className="space-y-1 overflow-y-auto max-h-[80px]">
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
                {dayTasks.slice(0, 2).map((task) => (
                  <div 
                    key={`task-${task.id}`} 
                    className="text-xs px-1 py-0.5 rounded bg-blue-100 text-blue-800 truncate"
                    title={task.title}
                  >
                    ✓ {task.title}
                  </div>
                ))}
                
                {/* Reuniões */}
                {dayMeetings.slice(0, 2).map((meeting, index) => (
                  <div 
                    key={`meeting-${index}`} 
                    className="text-xs px-1 py-0.5 rounded bg-yellow-100 text-yellow-800 truncate"
                    title={meeting.title}
                  >
                    📅 {meeting.title}
                  </div>
                ))}
                
                {/* Indicador de mais eventos */}
                {(projectStarts.length + projectEnds.length + dayTasks.length + dayMeetings.length) > 4 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{(projectStarts.length + projectEnds.length + dayTasks.length + dayMeetings.length) - 4} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
