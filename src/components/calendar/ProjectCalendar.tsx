import React, { useState, useEffect } from 'react';
import { Filter, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import useProjectStore from '../../store/projectStore';
import useClientStore from '../../store/clientStore';
import useTaskStore from '../../store/taskStore';
import useMeetingStore from '../../store/meetingStore';
import useUserStore from '../../store/userStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import MeetingForm from './MeetingForm';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type CalendarViewType = 'month' | 'week' | 'day';

const ProjectCalendar: React.FC = () => {
  // Estado para controlar a visualizau00e7u00e3o do calendu00e1rio
  const [viewType, setViewType] = useState<CalendarViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  
  // Buscar dados dos stores
  const { projects } = useProjectStore();
  const { clients } = useClientStore();
  const { tasks } = useTaskStore();
  const { meetings, fetchMeetings } = useMeetingStore();
  const { currentUser } = useUserStore();
  
  // Buscar reuniões ao carregar o componente
  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);
  
  // Funu00e7u00e3o para formatar data (usada em outros componentes)
  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleDateString('en-US', {
  //     month: 'short',
  //     day: 'numeric',
  //     year: 'numeric',
  //   });
  // };
  
  // Funu00e7u00e3o para navegar entre peru00edodos
  const navigatePeriod = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      
      if (viewType === 'month') {
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      } else if (viewType === 'week') {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      } else if (viewType === 'day') {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
      }
      
      return newDate;
    });
  };
  
  // Funu00e7u00e3o para alternar a seleu00e7u00e3o de um projeto
  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };
  
  // Funu00e7u00e3o para selecionar todos os projetos
  const selectAllProjects = () => {
    setSelectedProjects(projects.map(p => p.id));
  };
  
  // Funu00e7u00e3o para limpar a seleu00e7u00e3o de projetos
  const clearProjectSelection = () => {
    setSelectedProjects([]);
  };
  
  // Aplicar filtro de permissu00f5es antes de qualquer outro filtro
  const permissionFilteredProjects = React.useMemo(() => {
    // Se nu00e3o houver usuu00e1rio logado, retorna array vazio
    if (!currentUser) return [];
    
    // Administradores tu00eam acesso a tudo
    if (currentUser.role === 'admin' || currentUser.role === 'manager') {
      return projects;
    }
    
    // Filtrar projetos com base nas permissu00f5es do usuu00e1rio
    const userProjectIds = currentUser.permissions?.projectIds || [];
    return projects.filter(project => userProjectIds.includes(project.id));
  }, [currentUser, projects]);
  
  // Obter projetos filtrados por seleu00e7u00e3o do usuu00e1rio
  const filteredProjects = selectedProjects.length > 0
    ? permissionFilteredProjects.filter(p => selectedProjects.includes(p.id))
    : permissionFilteredProjects;
  
  // Obter tarefas dos projetos filtrados
  const filteredTasks = tasks.filter(t => {
    return filteredProjects.some(p => p.id === t.projectId);
  });
  
  // Obter tu00edtulo do peru00edodo atual
  const getPeriodTitle = () => {
    if (viewType === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (viewType === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  };
  
  // Renderizar o componente
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-gray-900">Calendu00e1rio de Projetos</h3>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            icon={<Filter size={16} />}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            Filtrar
          </Button>
          
          <Button 
            variant="primary" 
            size="sm"
            icon={<Plus size={16} />}
            onClick={() => setIsMeetingModalOpen(true)}
          >
            Agendar Reuniu00e3o
          </Button>
        </div>
      </div>
      
      {/* Filtro de projetos */}
      {isFilterOpen && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-700">Filtrar por Projetos</h4>
            <div className="flex space-x-2">
              <button 
                onClick={selectAllProjects}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Selecionar Todos
              </button>
              <button 
                onClick={clearProjectSelection}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                Limpar
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {permissionFilteredProjects.map(project => {
              const client = clients.find(c => c.id === project.clientId);
              
              return (
                <div 
                  key={project.id} 
                  className={`p-2 rounded-md cursor-pointer border ${selectedProjects.includes(project.id) ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => toggleProjectSelection(project.id)}
                >
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={selectedProjects.includes(project.id)}
                      onChange={() => {}} // Controlado pelo onClick do div pai
                      className="mr-2 h-4 w-4 text-blue-600 rounded"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-800">{project.name}</div>
                      {client && (
                        <div className="text-xs text-gray-500">{client.name}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Controles de navegau00e7u00e3o e visualizau00e7u00e3o */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigatePeriod('prev')}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          
          <h4 className="text-lg font-medium text-gray-800">{getPeriodTitle()}</h4>
          
          <button 
            onClick={() => navigatePeriod('next')}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
          
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="ml-2 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded-md hover:bg-blue-50"
          >
            Hoje
          </button>
        </div>
        
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
          <button
            onClick={() => setViewType('month')}
            className={`px-3 py-1 text-sm rounded-md ${viewType === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Mu00eas
          </button>
          
          <button
            onClick={() => setViewType('week')}
            className={`px-3 py-1 text-sm rounded-md ${viewType === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Semana
          </button>
          
          <button
            onClick={() => setViewType('day')}
            className={`px-3 py-1 text-sm rounded-md ${viewType === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Dia
          </button>
        </div>
      </div>
      
      {/* Aqui seru00e1 renderizado o conteu00fado do calendu00e1rio baseado no viewType */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {viewType === 'month' && (
          <MonthView 
            currentDate={currentDate}
            projects={filteredProjects}
            tasks={filteredTasks}
            meetings={meetings}
          />
        )}
        
        {viewType === 'week' && (
          <WeekView 
            currentDate={currentDate}
            projects={filteredProjects}
            tasks={filteredTasks}
            meetings={meetings}
          />
        )}
        
        {viewType === 'day' && (
          <DayView 
            currentDate={currentDate}
            projects={filteredProjects}
            tasks={filteredTasks}
            meetings={meetings}
          />
        )}
      </div>
      
      {/* Modal para agendar reuniu00e3o */}
      <Modal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        title="Agendar Reuniu00e3o com Cliente"
        size="md"
      >
        <MeetingForm 
          onClose={() => setIsMeetingModalOpen(false)}
          selectedDate={currentDate}
          selectedProjectId={selectedProjects.length === 1 ? selectedProjects[0] : ''}
        />
      </Modal>
      
      {/* Toast container para notificau00e7u00f5es */}
      <ToastContainer />
    </div>
  );
};

export default ProjectCalendar;
