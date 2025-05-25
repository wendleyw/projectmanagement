import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, CreditCard, Users, CheckSquare, Clock, Edit, Plus } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import TaskCard from '../components/tasks/TaskCard';
import Modal from '../components/ui/Modal';
import TaskForm from '../components/tasks/TaskForm';
import ProjectEditForm from '../components/projects/ProjectEditForm';
import ProjectTimeline from '../components/projects/ProjectTimeline';
import useProjectStore from '../store/projectStore';
import useClientStore from '../store/clientStore';
import useTaskStore from '../store/taskStore';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects, fetchProjects } = useProjectStore();
  const { clients, fetchClients } = useClientStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { user } = useAuthStore();
  const { currentUser } = useUserStore();
  
  // Check if the user has permission to edit the project
  const canEditProject = currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager');
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  
  useEffect(() => {
    fetchProjects();
    fetchClients();
    fetchTasks();
  }, [fetchProjects, fetchClients, fetchTasks]);
  
  const project = projects.find(p => p.id === id);
  const client = clients.find(c => project?.client_id === c.id);
  const projectTasks = tasks.filter(t => t.project_id === id);
  
  // Helper function to calculate project progress
  const calculateProgress = () => {
    if (projectTasks.length === 0) return 0;
    
    const completedTasks = projectTasks.filter(task => task.status === 'done');
    return Math.round((completedTasks.length / projectTasks.length) * 100);
  };

  // Helper function to format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planned':
        return 'secondary';
      case 'in-progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'on-hold':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  // Group tasks by status
  const tasksByStatus = {
    todo: projectTasks.filter(task => task.status === 'todo'),
    'in_progress': projectTasks.filter(task => task.status === 'in_progress'),
    review: projectTasks.filter(task => task.status === 'review'),
    done: projectTasks.filter(task => task.status === 'done'),
  };

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Project not found</h2>
        <Link to="/projects" className="text-blue-600 hover:text-blue-800 flex items-center">
          <ArrowLeft size={16} className="mr-1" />
          Back to Projects
        </Link>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="pb-16 overflow-visible">
      {/* Adicionamos padding-bottom maior e overflow-visible para garantir que o scroll funcione corretamente */}
      <PageHeader 
        title={project.name}
        subtitle={`Detalhes do projeto e tarefas associadas.`}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Projetos', path: '/projects' },
          { label: project.name },
        ]}
        actions={
          <div className="flex space-x-2">
            {canEditProject && (
              <Button 
                variant="outline" 
                icon={<Edit size={16} />}
                onClick={() => setIsEditModalOpen(true)}
              >
                Editar
              </Button>
            )}
            <Button 
              variant="primary" 
              icon={<Plus size={16} />}
              onClick={() => setIsTaskModalOpen(true)}
            >
              Nova Tarefa
            </Button>
          </div>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Project Info */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
            <Badge variant={getStatusBadge(project.status)}>
              {project.status.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </Badge>
          </div>
          
          <p className="text-gray-700 mb-6">{project.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {client && (
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <span className="text-sm text-gray-500 block">Cliente</span>
                    <Link to={`/clients/${client.id}`} className="text-gray-900 hover:text-blue-600">
                      {client.name}
                    </Link>
                  </div>
                </div>
              )}
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <span className="text-sm text-gray-500 block">Period</span>
                  <span className="text-gray-900">
                    {formatDate(project.start_date)} - {formatDate(project.end_date)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {project.budget && (
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <span className="text-sm text-gray-500 block">Budget</span>
                    <span className="text-gray-900">
                      ${project.budget.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center">
                <CheckSquare className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <span className="text-sm text-gray-500 block">Tarefas</span>
                  <span className="text-gray-900">
                    {projectTasks.filter(t => t.status === 'done').length}/{projectTasks.length} Completed
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${progress < 30 ? 'bg-red-500' : progress < 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Project Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-500 block">Tasks by Status</span>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">To Do</span>
                    <span className="text-sm font-medium">{tasksByStatus.todo.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">In Progress</span>
                    <span className="text-sm font-medium">{tasksByStatus['in_progress'].length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">In Review</span>
                    <span className="text-sm font-medium">{tasksByStatus.review.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Completed</span>
                    <span className="text-sm font-medium">{tasksByStatus.done.length}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-gray-500 block">Tempo Estimado</span>
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-lg font-semibold text-gray-900">
                    {projectTasks.reduce((total, task) => total + (task.estimated_hours || 0), 0)} hours
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Project Timeline */}
      <div className="mb-8">
        <ProjectTimeline project={project} tasks={projectTasks} />
      </div>
      
      {/* Project Tasks */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Project Tasks</h2>
          <Button 
            variant="primary" 
            size="sm"
            icon={<Plus size={16} />}
            onClick={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
          >
            New Task
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectTasks.length > 0 ? (
            projectTasks.map(task => {
              // Convert user to the User | undefined type expected by TaskCard
              const assignee = user ? {
                id: user.id,
                full_name: user.full_name || '',
                email: user.email,
                role: user.role,
                created_at: user.created_at,
                updated_at: user.updated_at
              } : undefined;
              
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  assignee={assignee}
                  onClick={() => {
                    setTaskToEdit(task);
                    setIsTaskModalOpen(true);
                  }} // Handle task click
                />
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">No tasks found for this project.</p>
              <Button 
                variant="primary" 
                size="sm" 
                icon={<Plus size={16} />}
                onClick={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
              >
                Create first task
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal for adding or editing a task */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        title={taskToEdit ? "Edit Task" : "Add New Task"}
        size="lg"
      >
        <TaskForm 
          taskToEdit={taskToEdit} 
          onClose={() => {
            setIsTaskModalOpen(false);
            setTaskToEdit(null);
          }} 
        />
      </Modal>
      
      {/* Modal for editing project */}
      {project && isEditModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Project"
          size="lg"
        >
          <ProjectEditForm
            project={{...project}} // Passar uma cu00f3pia do projeto para evitar problemas de referu00eancia
            onClose={() => setIsEditModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default ProjectDetails;
