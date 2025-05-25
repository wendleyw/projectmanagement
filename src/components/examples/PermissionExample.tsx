import React, { useEffect, useState } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { useProjectAccess } from '../../hooks/useProjectAccess';
import { useTaskAccess } from '../../hooks/useTaskAccess';
import { useCalendarAccess } from '../../hooks/useCalendarAccess';
import { useTrackingAccess } from '../../hooks/useTrackingAccess';
import { Project, Task } from '../../types';
import PermissionGuard from '../auth/PermissionGuard';
import PermissionFilter from '../auth/PermissionFilter';

/**
 * Componente de exemplo para demonstrar o uso do sistema de permissu00f5es
 */
const PermissionExample: React.FC = () => {
  // Hooks de permissu00f5es
  const { hasRole } = usePermissions();
  const { 
    userProjects, 
    managedProjects, 
    memberProjects
  } = useProjectAccess();
  const { 
    userTasks, 
    assignedTasks
  } = useTaskAccess();
  const { hasCalendarAccess } = useCalendarAccess();
  const { hasTrackingAccess } = useTrackingAccess();

  // Estados para armazenar dados de exemplo
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Selecionar o primeiro projeto disponu00edvel quando o componente montar
  useEffect(() => {
    if (userProjects.length > 0 && !selectedProject) {
      setSelectedProject(userProjects[0]);
    }
  }, [userProjects, selectedProject]);

  // Selecionar a primeira tarefa disponu00edvel quando o componente montar
  useEffect(() => {
    if (userTasks.length > 0 && !selectedTask) {
      setSelectedTask(userTasks[0]);
    }
  }, [userTasks, selectedTask]);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Exemplo do Sistema de Permissu00f5es</h1>
      
      {/* Seu00e7u00e3o de informau00e7u00f5es do usuu00e1rio */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Informau00e7u00f5es do Usuu00e1rio</h2>
        
        <div className="space-y-2">
          <p>
            <span className="font-medium">Funu00e7u00e3o:</span>{' '}
            {hasRole('admin') ? 'Administrador' : 
             hasRole('manager') ? 'Gerente' : 
             hasRole('member') ? 'Membro' : 'Desconhecido'}
          </p>
          
          <p>
            <span className="font-medium">Acesso ao Calendu00e1rio:</span>{' '}
            {hasCalendarAccess ? 'Sim' : 'Nu00e3o'}
          </p>
          
          <p>
            <span className="font-medium">Acesso ao Tracking:</span>{' '}
            {hasTrackingAccess ? 'Sim' : 'Nu00e3o'}
          </p>
        </div>
      </section>
      
      {/* Seu00e7u00e3o de projetos */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Projetos</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-md font-medium text-gray-700">Projetos Gerenciados ({managedProjects.length})</h3>
            {managedProjects.length === 0 ? (
              <p className="text-sm text-gray-500 mt-1">Nenhum projeto gerenciado</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {managedProjects.map(project => (
                  <li key={project.id} className="text-sm text-blue-600">
                    {project.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-700">Projetos como Membro ({memberProjects.length})</h3>
            {memberProjects.length === 0 ? (
              <p className="text-sm text-gray-500 mt-1">Nenhum projeto como membro</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {memberProjects.map(project => (
                  <li key={project.id} className="text-sm text-blue-600">
                    {project.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
      
      {/* Seu00e7u00e3o de tarefas */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tarefas</h2>
        
        <div>
          <h3 className="text-md font-medium text-gray-700">Tarefas Atribuu00eddas ({assignedTasks.length})</h3>
          {assignedTasks.length === 0 ? (
            <p className="text-sm text-gray-500 mt-1">Nenhuma tarefa atribuu00edda</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {assignedTasks.map(task => (
                <li key={task.id} className="text-sm text-blue-600">
                  {task.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      
      {/* Exemplo de uso do PermissionGuard */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Exemplo de PermissionGuard</h2>
        
        <div className="space-y-4">
          <PermissionGuard
            requiredPermission="project"
            action="view"
            fallbackPath="/dashboard"
          >
            <div className="p-4 bg-green-50 text-green-700 rounded-md">
              Vocu00ea tem permissu00e3o para visualizar projetos.
            </div>
          </PermissionGuard>
          
          <PermissionGuard
            requiredPermission="task"
            action="edit"
            fallbackPath="/dashboard"
          >
            <div className="p-4 bg-green-50 text-green-700 rounded-md">
              Vocu00ea tem permissu00e3o para editar tarefas.
            </div>
          </PermissionGuard>
          
          <PermissionGuard
            requiredPermission="calendar"
            action="view"
            fallbackPath="/dashboard"
          >
            <div className="p-4 bg-green-50 text-green-700 rounded-md">
              Vocu00ea tem permissu00e3o para visualizar o calendu00e1rio.
            </div>
          </PermissionGuard>
          
          <PermissionGuard
            requiredPermission="tracking"
            action="view"
            fallbackPath="/dashboard"
          >
            <div className="p-4 bg-green-50 text-green-700 rounded-md">
              Vocu00ea tem permissu00e3o para visualizar o tracking.
            </div>
          </PermissionGuard>
        </div>
      </section>
      
      {/* Exemplo de uso do PermissionFilter */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Exemplo de PermissionFilter</h2>
        
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-700">Projetos Filtrados</h3>
          <PermissionFilter
            resourceType="projects"
            data={userProjects}
            action="view"
          >
            {(filteredProjects: Project[]) => (
              <div>
                {filteredProjects.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum projeto disponu00edvel</p>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {filteredProjects.map(project => (
                      <li key={project.id} className="text-sm text-blue-600">
                        {project.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </PermissionFilter>
          
          <h3 className="text-md font-medium text-gray-700 mt-4">Tarefas Filtradas</h3>
          <PermissionFilter
            resourceType="tasks"
            data={userTasks}
            action="view"
          >
            {(filteredTasks: Task[]) => (
              <div>
                {filteredTasks.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhuma tarefa disponu00edvel</p>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {filteredTasks.map(task => (
                      <li key={task.id} className="text-sm text-blue-600">
                        {task.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </PermissionFilter>
        </div>
      </section>
    </div>
  );
};

export default PermissionExample;
