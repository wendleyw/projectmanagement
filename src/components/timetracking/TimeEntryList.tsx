import React, { useState } from 'react';
import { Edit, Trash2, Calendar, Clock, Tag, DollarSign } from 'lucide-react';
import useTimeTrackingStore, { TimeEntry } from '../../store/timeTrackingStore';
import useProjectStore from '../../store/projectStore';
import useTaskStore from '../../store/taskStore';
import useUserStore from '../../store/userStore';
import Button from '../ui/Button';

interface TimeEntryListProps {
  filter?: {
    startDate?: string;
    endDate?: string;
    projectId?: string;
    userId?: string;
  };
}

const TimeEntryList: React.FC<TimeEntryListProps> = ({ filter }) => {
  const { entries, deleteEntry } = useTimeTrackingStore();
  const { projects } = useProjectStore();
  const { tasks } = useTaskStore();
  const { users } = useUserStore();
  
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  
  // Obter o usuu00e1rio atual para verificar permissu00f5es
  const { currentUser, hasPermissionForProject, hasPermissionForTask } = useUserStore();

  // Aplicar filtro de permissu00f5es antes de qualquer outro filtro
  const permissionFilteredEntries = entries.filter(entry => {
    // Se nu00e3o houver usuu00e1rio logado, retorna falso
    if (!currentUser) return false;
    
    // Administradores e gerentes tu00eam acesso a tudo
    if (currentUser.role === 'admin' || currentUser.role === 'manager') {
      return true;
    }
    
    // Usuu00e1rios sempre podem ver seus pru00f3prios registros
    if (entry.userId === currentUser.id) {
      return true;
    }
    
    // Verificar permissu00f5es para o projeto associado ao registro
    if (entry.projectId && hasPermissionForProject(currentUser.id, entry.projectId)) {
      return true;
    }
    
    // Verificar permissu00f5es para a tarefa associada ao registro
    if (entry.taskId && hasPermissionForTask(currentUser.id, entry.taskId)) {
      return true;
    }
    
    // Se nu00e3o atender a nenhuma das condiu00e7u00f5es acima, nu00e3o tem permissu00e3o
    return false;
  });

  // Filtrar entradas com base nos filtros fornecidos
  const filteredEntries = permissionFilteredEntries.filter(entry => {
    if (filter?.startDate && entry.date < filter.startDate) return false;
    if (filter?.endDate && entry.date > filter.endDate) return false;
    if (filter?.projectId && entry.projectId !== filter.projectId) return false;
    if (filter?.userId && entry.userId !== filter.userId) return false;
    return true;
  });
  
  // Agrupar entradas por data
  const groupedEntries: Record<string, typeof entries> = {};
  filteredEntries.forEach(entry => {
    if (!groupedEntries[entry.date]) {
      groupedEntries[entry.date] = [];
    }
    groupedEntries[entry.date].push(entry);
  });
  
  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Formatar durau00e7u00e3o
  const formatDuration = (seconds: number | undefined) => {
    if (seconds === undefined) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  };
  
  // Obter nome do projeto
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Projeto desconhecido';
  };
  
  // Obter nome da tarefa
  const getTaskName = (taskId?: string) => {
    if (!taskId) return null;
    const task = tasks.find(t => t.id === taskId);
    return task ? task.title : 'Tarefa desconhecida';
  };
  
  // Obter nome do usuu00e1rio
  const getUserName = (userId: string) => {
    const user = users.find((u: any) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Usuu00e1rio desconhecido';
  };
  
  // Calcular tempo total por dia
  const getDailyTotal = (entries: TimeEntry[]) => {
    return entries.reduce((total, entry) => total + (entry.duration || 0), 0);
  };
  
  // Excluir entrada
  const handleDeleteEntry = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro de tempo?')) {
      await deleteEntry(id);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Registros de Tempo</h3>
      </div>
      
      {Object.keys(groupedEntries).length > 0 ? (
        <div className="divide-y divide-gray-200">
          {Object.entries(groupedEntries)
            .sort(([dateA], [dateB]) => dateB.localeCompare(dateA)) // Ordenar por data (mais recente primeiro)
            .map(([date, dayEntries]) => (
              <div key={date} className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    {formatDate(date)}
                  </h4>
                  <span className="text-sm text-gray-500">
                    Total: {formatDuration(getDailyTotal(dayEntries))}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {dayEntries.map(entry => (
                    <div 
                      key={entry.id} 
                      className={`p-3 rounded-md border ${entry.isRunning ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                      onClick={() => setSelectedEntryId(selectedEntryId === entry.id ? null : entry.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900">{entry.description}</h5>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {getProjectName(entry.projectId)}
                            </span>
                            
                            {entry.taskId && (
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {getTaskName(entry.taskId)}
                              </span>
                            )}
                            
                            {entry.tags && entry.tags.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Tag size={12} />
                                {entry.tags.join(', ')}
                              </span>
                            )}
                            
                            {entry.billable && (
                              <span className="flex items-center gap-1 text-green-600">
                                <DollarSign size={12} />
                                Faturu00e1vel
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium text-gray-700">
                            {formatDuration(entry.duration)}
                          </span>
                          
                          {entry.isRunning && (
                            <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                              Em andamento
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {selectedEntryId === entry.id && !entry.isRunning && (
                        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Edit size={14} />}
                          >
                            Editar
                          </Button>
                          
                          <Button
                            variant="danger"
                            size="sm"
                            icon={<Trash2 size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEntry(entry.id);
                            }}
                          >
                            Excluir
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          }
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          Nenhum registro de tempo encontrado.
        </div>
      )}
    </div>
  );
};

export default TimeEntryList;
