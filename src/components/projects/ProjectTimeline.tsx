import React, { useState } from 'react';
import { Calendar, CheckSquare, Flag, AlertCircle, Clock, BarChart2, List } from 'lucide-react';
import { Project, Task } from '../../types';
import ProjectCalendarView from './ProjectCalendarView';

interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  type: 'milestone' | 'task' | 'start' | 'deadline' | 'status-change';
  status?: string;
  description?: string;
}

interface ProjectTimelineProps {
  project: Project;
  tasks: Task[];
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ project, tasks }) => {
  // Estado para controlar o tipo de visualização (timeline ou calendário)
  const [viewType, setViewType] = useState<'timeline' | 'calendar'>('timeline');
  
  // Função para ordenar eventos por data
  const sortByDate = (a: TimelineEvent, b: TimelineEvent) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Criar eventos da timeline
  const generateTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    const today = new Date();
    
    // Garantir que as datas sejam objetos Date válidos
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    
    // Verificar se as datas são válidas
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      // Se as datas não forem válidas, retornar apenas um evento de erro
      return [{
        id: 'error',
        title: 'Erro nas datas do projeto',
        date: today.toISOString().split('T')[0],
        type: 'milestone',
        description: 'As datas de início ou fim do projeto são inválidas',
      }];
    }
    
    // Calcular progresso atual do projeto (baseado no tempo)
    const totalDuration = endDate.getTime() - startDate.getTime();
    
    // Garantir que a duração total seja positiva
    if (totalDuration <= 0) {
      // Se a duração for zero ou negativa, retornar apenas um evento de erro
      return [{
        id: 'error',
        title: 'Erro na duração do projeto',
        date: today.toISOString().split('T')[0],
        type: 'milestone',
        description: 'A data de término deve ser posterior à data de início',
      }];
    }
    
    const elapsedDuration = Math.min(today.getTime() - startDate.getTime(), totalDuration);
    const timeProgress = Math.max(0, Math.min(100, (elapsedDuration / totalDuration) * 100));
    
    // Calcular progresso baseado nas tarefas concluídas
    const taskProgress = tasks.length > 0 
      ? Math.round((tasks.filter(task => task.status === 'completed').length / tasks.length) * 100)
      : 0;
    
    // Adicionar início do projeto (sempre começa do zero)
    events.push({
      id: `project-start-${project.id}`,
      title: 'Início do Projeto',
      date: project.startDate,
      type: 'start',
      description: `Início oficial do projeto (${formatDate(project.startDate)})`,
    });

    // Adicionar evento de status atual (baseado na data atual)
    if (today > startDate && today < endDate) {
      const progressPercent = Math.round((taskProgress + timeProgress) / 2);
      events.push({
        id: `project-current-${project.id}`,
        title: `Progresso Atual: ${progressPercent}%`,
        date: today.toISOString().split('T')[0],
        type: 'status-change',
        status: project.status,
        description: `Progresso baseado em tempo: ${Math.round(timeProgress)}%, Progresso baseado em tarefas: ${taskProgress}%`,
      });
    }
    
    // Adicionar mudanças de status do projeto (se aplicável)
    if (project.status === 'in-progress') {
      // Calcular uma data razoável para o início do projeto em progresso
      // Se o projeto começou há menos de 7 dias, use a data de início
      // Caso contrário, use uma data 7 dias atrás (para não sobrecarregar a timeline)
      const inProgressDate = new Date(Math.max(
        startDate.getTime(), 
        Math.min(today.getTime(), startDate.getTime() + (7 * 24 * 60 * 60 * 1000))
      ));
      
      events.push({
        id: `status-in-progress-${project.id}`,
        title: 'Projeto Iniciado',
        date: inProgressDate.toISOString().split('T')[0],
        type: 'status-change',
        status: 'in-progress',
        description: 'O projeto entrou em fase de execução',
      });
    } else if (project.status === 'completed') {
      // Se o projeto estiver concluído, use a data de término real ou a data atual
      const completedDate = project.actualEndDate || today.toISOString().split('T')[0];
      events.push({
        id: `status-completed-${project.id}`,
        title: 'Projeto Concluído',
        date: completedDate,
        type: 'status-change',
        status: 'completed',
        description: 'Todas as entregas foram finalizadas',
      });
    } else if (project.status === 'on-hold') {
      // Se o projeto estiver em espera, use a data atual
      events.push({
        id: `status-on-hold-${project.id}`,
        title: 'Projeto em Espera',
        date: today.toISOString().split('T')[0],
        type: 'status-change',
        status: 'on-hold',
        description: 'O projeto foi temporariamente pausado',
      });
    }

    // Adicionar prazo final do projeto
    events.push({
      id: `project-end-${project.id}`,
      title: 'Prazo Final',
      date: project.endDate,
      type: 'deadline',
      description: `Data de entrega prevista (${formatDate(project.endDate)})`,
    });

    // Adicionar tarefas como eventos
    tasks.forEach(task => {
      if (task.dueDate) {
        events.push({
          id: `task-${task.id}`,
          title: task.title,
          date: task.dueDate,
          type: 'task',
          status: task.status,
          description: task.description,
        });
      }
    });

    // Adicionar marcos (milestones) baseados no progresso real do projeto
    // em vez de apenas datas fixas baseadas na duração
    const projectDuration = endDate.getTime() - startDate.getTime();
    
    // Calcular pontos de marco baseados no progresso atual e datas do projeto
    // Garantir que os marcos estejam sempre dentro do período do projeto
    const quarterPoint = new Date(startDate.getTime() + projectDuration * 0.25);
    const halfwayPoint = new Date(startDate.getTime() + projectDuration * 0.5);
    const threeQuarterPoint = new Date(startDate.getTime() + projectDuration * 0.75);
    
    // Adicionar sempre os marcos principais, independentemente da data atual
    // Isso garante que a timeline mostre o progresso esperado do projeto
    events.push({
      id: 'milestone-1',
      title: 'Planejamento (25%)',
      date: quarterPoint.toISOString().split('T')[0],
      type: 'milestone',
      description: 'Fase de planejamento do projeto',
    });

    events.push({
      id: 'milestone-2',
      title: 'Meio-Termo (50%)',
      date: halfwayPoint.toISOString().split('T')[0],
      type: 'milestone',
      description: 'Metade do período do projeto',
    });

    events.push({
      id: 'milestone-3',
      title: 'Fase Final (75%)',
      date: threeQuarterPoint.toISOString().split('T')[0],
      type: 'milestone',
      description: 'Início da fase final do projeto',
    });

    // Ordenar eventos por data
    return events.sort(sortByDate);
  };

  const timelineEvents = generateTimelineEvents();

  // Função para obter o ícone do evento
  const getEventIcon = (eventType: TimelineEvent['type'], status?: string) => {
    switch (eventType) {
      case 'milestone':
        return <Flag className="h-5 w-5 text-purple-500" />;
      case 'task':
        if (status === 'completed') {
          return <CheckSquare className="h-5 w-5 text-green-500" />;
        } else if (status === 'in-progress') {
          return <Clock className="h-5 w-5 text-blue-500" />;
        } else {
          return <CheckSquare className="h-5 w-5 text-gray-400" />;
        }
      case 'status-change':
        if (status === 'completed') {
          return <CheckSquare className="h-5 w-5 text-green-500" />;
        } else if (status === 'in-progress') {
          return <Clock className="h-5 w-5 text-blue-500" />;
        } else if (status === 'on-hold') {
          return <AlertCircle className="h-5 w-5 text-yellow-500" />;
        } else {
          return <Calendar className="h-5 w-5 text-gray-500" />;
        }
      case 'start':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'deadline':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-400" />;
    }
  };

  // Função para obter a cor da linha da timeline com base no tipo de evento
  const getEventLineColor = (eventType: TimelineEvent['type'], status?: string) => {
    switch (eventType) {
      case 'milestone':
        return 'border-purple-500';
      case 'task':
        if (status === 'completed') {
          return 'border-green-500';
        } else if (status === 'in-progress') {
          return 'border-blue-500';
        } else {
          return 'border-gray-300';
        }
      case 'status-change':
        if (status === 'completed') {
          return 'border-green-500';
        } else if (status === 'in-progress') {
          return 'border-blue-500';
        } else if (status === 'on-hold') {
          return 'border-yellow-500';
        } else if (status === 'cancelled') {
          return 'border-red-300';
        } else {
          return 'border-gray-500';
        }
      case 'start':
        return 'border-blue-500';
      case 'deadline':
        return 'border-red-500';
      default:
        return 'border-gray-300';
    }
  };

  // Função para obter a cor de fundo do círculo do evento
  const getEventBgColor = (eventType: TimelineEvent['type'], status?: string) => {
    switch (eventType) {
      case 'milestone':
        return 'bg-purple-100 border-purple-500';
      case 'task':
        if (status === 'completed') {
          return 'bg-green-100 border-green-500';
        } else if (status === 'in-progress') {
          return 'bg-blue-100 border-blue-500';
        } else {
          return 'bg-gray-100 border-gray-300';
        }
      case 'status-change':
        if (status === 'completed') {
          return 'bg-green-100 border-green-500';
        } else if (status === 'in-progress') {
          return 'bg-blue-100 border-blue-500';
        } else if (status === 'on-hold') {
          return 'bg-yellow-100 border-yellow-500';
        } else if (status === 'cancelled') {
          return 'bg-red-100 border-red-300';
        } else {
          return 'bg-gray-100 border-gray-500';
        }
      case 'start':
        return 'bg-blue-100 border-blue-500';
      case 'deadline':
        return 'bg-red-100 border-red-500';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {viewType === 'timeline' ? 'Timeline do Projeto' : 'Calendário do Projeto'}
        </h3>
        
        {/* Botões de alternância entre timeline e calendário */}
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-md">
          <button
            onClick={() => setViewType('timeline')}
            className={`flex items-center px-3 py-1.5 text-sm rounded-md ${
              viewType === 'timeline' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List size={16} className="mr-1.5" />
            <span>Timeline</span>
          </button>
          
          <button
            onClick={() => setViewType('calendar')}
            className={`flex items-center px-3 py-1.5 text-sm rounded-md ${
              viewType === 'calendar' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart2 size={16} className="mr-1.5" />
            <span>Calendário</span>
          </button>
        </div>
      </div>
      
      {/* Visualização de Timeline */}
      {viewType === 'timeline' && (
        <div className="relative">
          {/* Linha vertical da timeline */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200"></div>
          
          {/* Eventos da timeline */}
          <div className="space-y-8">
            {timelineEvents.map((event, index) => (
              <div key={event.id} className="relative pl-14">
                {/* Linha conectando ao evento anterior (exceto para o primeiro evento) */}
                {index > 0 && (
                  <div 
                    className={`absolute left-6 top-0 w-px h-8 -mt-8 ${getEventLineColor(event.type, event.status)}`}
                    style={{ borderLeftWidth: '2px' }}
                  ></div>
                )}
                
                {/* Círculo do evento */}
                <div 
                  className={`absolute left-4 top-0 w-4 h-4 rounded-full border-2 ${getEventBgColor(event.type, event.status)}`}
                  style={{ transform: 'translateX(-50%)' }}
                ></div>
                
                {/* Ícone do evento */}
                <div className="absolute left-0 top-0">
                  {getEventIcon(event.type, event.status)}
                </div>
                
                {/* Conteúdo do evento */}
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                    <span className="text-xs text-gray-500">{formatDate(event.date)}</span>
                  </div>
                  
                  {event.description && (
                    <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                  )}
                  
                  {event.type === 'task' && event.status && (
                    <span 
                      className={`inline-flex items-center px-2 py-0.5 mt-2 rounded text-xs font-medium ${event.status === 'completed' ? 'bg-green-100 text-green-800' : event.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {event.status.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  )}
                </div>
                
                {/* Linha conectando ao próximo evento (exceto para o último evento) */}
                {index < timelineEvents.length - 1 && (
                  <div 
                    className={`absolute left-6 top-full w-px h-8 ${getEventLineColor(event.type, event.status)}`}
                    style={{ borderLeftWidth: '2px' }}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Visualização de Calendário */}
      {viewType === 'calendar' && (
        <ProjectCalendarView project={project} tasks={tasks} />
      )}
    </div>
  );
};

export default ProjectTimeline;
