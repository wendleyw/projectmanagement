import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectForm from '../components/projects/ProjectForm';
import Modal from '../components/ui/Modal';
import useProjectStore from '../store/projectStore';
import useClientStore from '../store/clientStore';
import useAuthStore from '../store/authStore';
import useTaskStore from '../store/taskStore';
import useUserStore from '../store/userStore';
import { Project as ProjectType } from '../types';

const Projects: React.FC = () => {
  const { projects, fetchProjects } = useProjectStore();
  const { clients, fetchClients } = useClientStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { user } = useAuthStore();
  const { currentUser } = useUserStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch data
  useEffect(() => {
    fetchProjects();
    fetchClients();
    fetchTasks();
  }, [fetchProjects, fetchClients, fetchTasks]);
  
  // Apply permissions filter before any other filter
  const permissionFilteredProjects = useMemo(() => {
    // If there is no logged in user, return empty array
    if (!currentUser) return [];
    
    // Admins e gerentes podem ver todos os projetos
    if (currentUser.role === 'admin' || currentUser.role === 'manager') {
      return projects;
    }
    
    // Para membros, APENAS mostrar projetos onde eles têm tarefas diretamente atribuídas
    if (currentUser.role === 'member') {
      // Obter IDs de projetos onde o membro tem tarefas atribuídas
      const projectIdsWithAssignedTasks = tasks
        .filter(task => task.assignee_id === currentUser.id)
        .map(task => task.project_id);
      
      // Filtrar projetos para incluir apenas aqueles com tarefas atribuídas
      return projects.filter(project => projectIdsWithAssignedTasks.includes(project.id));
    }
    
    // Para outros papéis, aplicar verificações de permissão regulares
    return projects.filter((project: any) => {
      // Verificar se há permissão específica para o projeto
      const userProjectIds = currentUser.permissions?.projectIds || [];
      if (userProjectIds.includes(project.id)) {
        return true;
      }
      
      // Verificar se o usuário é o gerente do projeto
      if (project.managerId === currentUser.id) {
        return true;
      }
      
      return false;
    });
  }, [currentUser, projects, tasks]);

  
  // Apply additional filters (search and status) to permission-filtered projects
  const filteredProjects = permissionFilteredProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.description ? project.description.toLowerCase().includes(searchTerm.toLowerCase()) : false);
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div>
      <PageHeader 
        title="Projects" 
        subtitle="Manage and monitor all your projects."
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Projects' },
        ]}
        actions={
          <Button 
            variant="primary" 
            icon={<Plus size={18} />}
            onClick={() => setIsModalOpen(true)}
          >
            New Project
          </Button>
        }
      />
      
      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="planned">Planned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => {
            const client = clients.find(c => c.id === project.client_id);
            const manager = user || undefined;
            const projectTasks = tasks.filter(t => t.project_id === project.id);
            
            return (
              <ProjectCard
                key={project.id}
                project={project}
                client={client}
                manager={manager}
                tasks={projectTasks}
              />
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">No projects found.</p>
            <Button 
              variant="primary" 
              size="sm" 
              icon={<Plus size={16} />}
              onClick={() => setIsModalOpen(true)}
            >
              Create your first project
            </Button>
          </div>
        )}
      </div>
      
      {/* Modal for adding a new project */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Project"
        size="lg"
      >
        <ProjectForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Projects;