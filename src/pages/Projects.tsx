import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import ProjectCard from '../components/projects/ProjectCard';
import useProjectStore from '../store/projectStore';
import useClientStore from '../store/clientStore';
import useAuthStore from '../store/authStore';
import useTaskStore from '../store/taskStore';

const Projects: React.FC = () => {
  const { projects, fetchProjects } = useProjectStore();
  const { clients, fetchClients } = useClientStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { user } = useAuthStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Fetch data
  useEffect(() => {
    fetchProjects();
    fetchClients();
    fetchTasks();
  }, [fetchProjects, fetchClients, fetchTasks]);
  
  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
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
          <Button variant="primary" icon={<Plus size={18} />}>
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
            const client = clients.find(c => c.id === project.clientId);
            const manager = user;
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            
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
            <Button variant="primary" size="sm" icon={<Plus size={16} />}>
              Create your first project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;