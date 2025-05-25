import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Project, Client, User, Task } from '../../types';
import { Calendar, CreditCard, Users, CheckSquare, Trash2, Edit } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import useProjectStore from '../../store/projectStore';
import useUserStore from '../../store/userStore';
import { showNotification } from '../../utils/notifications';

interface ProjectCardProps {
  project: Project;
  client: Client | undefined;
  manager: User | undefined;
  tasks: Task[];
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, client, manager, tasks }) => {
  const { deleteProject } = useProjectStore();
  const { currentUser } = useUserStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Verificar se o usuu00e1rio tem permissu00e3o para editar/excluir projetos
  const canEditProject = currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager');
  
  // Helper function to calculate project progress
  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.status === 'completed');
    return Math.round((completedTasks.length / tasks.length) * 100);
  };
  
  // Função para confirmar exclusão
  const confirmDelete = () => {
    setShowDeleteModal(true);
  };
  
  // Função para executar a exclusão
  const handleDelete = async () => {
    try {
      const success = await deleteProject(project.id);
      if (success) {
        showNotification(`Projeto ${project.name} excluído com sucesso`, 'success');
      }
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      showNotification('Erro ao excluir projeto', 'error');
    } finally {
      setShowDeleteModal(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get status badge variant
  const getStatusBadge = (status: Project['status']) => {
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

  const progress = calculateProgress();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            <Link to={`/projects/${project.id}`} className="flex items-center">
              <span className="mr-2">{project.name}</span>
            </Link>
          </h3>
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusBadge(project.status)}>
              {project.status.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </Badge>
            {canEditProject && (
              <>
                <Link to={`/projects/${project.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Edit size={16} />}
                    title="Edit project"
                    className="text-gray-500 hover:text-blue-600 rounded-full p-1.5"
                  />
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 size={16} />}
                  title="Delete project"
                  className="text-gray-500 hover:text-red-600 rounded-full p-1.5"
                  onClick={confirmDelete}
                />
              </>
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-5 line-clamp-2">{project.description}</p>
        
        <div className="space-y-3.5 mb-4">
          {client && (
            <div className="flex items-center text-sm">
              <Users className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
              <span className="text-gray-700">{client.name}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
            <span className="text-gray-700">
              {formatDate(project.startDate)} - {formatDate(project.endDate)}
            </span>
          </div>
          
          {project.budget && (
            <div className="flex items-center text-sm">
              <CreditCard className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
              <span className="text-gray-700">
                ${project.budget.toLocaleString()}
              </span>
            </div>
          )}
          
          <div className="flex items-center text-sm">
            <CheckSquare className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
            <span className="text-gray-700">
              {tasks.filter(t => t.status === 'completed').length}/{tasks.length} Tasks
            </span>
          </div>
        </div>
      </div>
      
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">Progress</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{progress}%</span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progress < 30
                ? 'bg-red-500'
                : progress < 70
                ? 'bg-blue-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {manager && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
          <div className="flex items-center">
            {manager?.avatar ? (
              <img 
                src={manager?.avatar} 
                alt={`${manager?.firstName || 'Unknown'} ${manager?.lastName || ''}`}
                className="w-8 h-8 rounded-full mr-3 border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 mr-3 flex items-center justify-center shadow-sm border-2 border-white">
                <span className="text-xs font-semibold text-blue-600">
                  {manager?.firstName?.[0] || '?'}{manager?.lastName?.[0] || '?'}
                </span>
              </div>
            )}
            <div>
              <span className="text-xs text-gray-500 block">Managed by</span>
              <span className="text-sm font-medium text-gray-800">{manager?.firstName || 'Unknown'} {manager?.lastName || ''}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de confirmação de exclusão */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
      >
        <div className="p-6">
          <p className="mb-4 text-gray-700">
            Are you sure you want to delete the project <strong>{project.name}</strong>?
          </p>
          <p className="mb-6 text-gray-500 text-sm">
            This action cannot be undone and all data associated with this project will be removed.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            
            <Button
              variant="primary"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectCard;