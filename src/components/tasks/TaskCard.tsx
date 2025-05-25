import React, { useState } from 'react';
import { Task, User } from '../../types';
import { Calendar, Clock, Briefcase, Trash2, Edit } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import useTaskStore from '../../store/taskStore';
import useUserStore from '../../store/userStore';
import { showNotification } from '../../utils/notifications';
import { Link } from 'react-router-dom';
import useProjectStore from '../../store/projectStore';

interface TaskCardProps {
  task: Task;
  assignee: User | undefined;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
  onClick?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  assignee,
  draggable = false,
  onDragStart,
  onClick,
}) => {
  const { deleteTask } = useTaskStore();
  const { currentUser } = useUserStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { projects } = useProjectStore();
  
  // Check if the user can edit/delete the task
  const canEditTask = 
    // Administrators and managers can edit any task
    (currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager')) || 
    // Members can only edit their own tasks
    (currentUser && currentUser.role === 'member' && task.assigneeId === currentUser.id);
  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper function to calculate days remaining
  const getDaysRemaining = (dateString?: string) => {
    if (!dateString) return null;
    
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Get priority badge variant
  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'low':
        return 'success';
      case 'medium':
        return 'info';
      case 'high':
        return 'warning';
      case 'urgent':
        return 'danger';
      default:
        return 'default';
    }
  };

  // Get project associated with the task
  const getProject = () => {
    if (!task.projectId) return null;
    return projects.find(p => p.id === task.projectId);
  };

  const project = getProject();

  const daysRemaining = task.dueDate ? getDaysRemaining(task.dueDate) : null;
  const isOverdue = daysRemaining !== null && daysRemaining < 0;

  const handleClick = () => {
    if (onClick) {
      onClick(task.id);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, task.id);
    }
  };
  
  // Função para confirmar exclusão
  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar propagação para o onClick do card
    setShowDeleteModal(true);
  };
  
  // Função para executar a exclusão
  const handleDelete = async () => {
    try {
      const success = await deleteTask(task.id);
      if (success) {
        showNotification(`Tarefa ${task.title} excluída com sucesso`, 'success');
      }
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      showNotification('Erro ao excluir tarefa', 'error');
    } finally {
      setShowDeleteModal(false);
    }
  };

  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-100 shadow-sm 
        hover:shadow-md transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={handleClick}
      draggable={draggable}
      onDragStart={handleDragStart}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 
            className="text-sm font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => onClick && onClick(task.id)}
          >
            {task.title}
          </h3>
          <div className="flex items-center space-x-1.5">
            <Badge variant={getPriorityBadge(task.priority)} size="sm">
              {task.priority}
            </Badge>
            {canEditTask && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Edit size={14} />}
                  title="Editar tarefa"
                  className="p-1 text-gray-500 hover:text-blue-600 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onClick) onClick(task.id);
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 size={14} />}
                  title="Excluir tarefa"
                  className="p-1 text-gray-500 hover:text-red-600 rounded-full"
                  onClick={confirmDelete}
                />
              </>
            )}
          </div>
        </div>
        
        {task.description && (
          <p className="mt-2 text-xs text-gray-500 line-clamp-2">{task.description}</p>
        )}

        {project && (
          <div className="mt-3 flex items-center">
            <Briefcase className="h-3.5 w-3.5 text-blue-500 mr-1.5 flex-shrink-0" />
            <Link 
              to={`/projects/${project.id}`} 
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {project.name}
            </Link>
          </div>
        )}
        
        <div className="space-y-2.5 mt-3">
          {task.dueDate && (
            <div className="flex items-center text-xs">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-blue-500 flex-shrink-0" />
              <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                Due {formatDate(task.dueDate)}
                {daysRemaining !== null && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs" style={{
                    backgroundColor: isOverdue ? 'rgba(239, 68, 68, 0.1)' : daysRemaining === 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: isOverdue ? 'rgb(220, 38, 38)' : daysRemaining === 0 ? 'rgb(217, 119, 6)' : 'rgb(5, 150, 105)'
                  }}>
                    {daysRemaining < 0 
                      ? `${Math.abs(daysRemaining)}d overdue` 
                      : daysRemaining === 0 
                        ? 'today' 
                        : `${daysRemaining}d left`}
                  </span>
                )}
              </span>
            </div>
          )}
          
          {task.estimatedHours && (
            <div className="flex items-center text-xs text-gray-600">
              <Clock className="h-3.5 w-3.5 mr-1.5 text-blue-500 flex-shrink-0" />
              <span>Estimated: {task.estimatedHours}h</span>
            </div>
          )}
        </div>
      </div>
      
      {assignee && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
          <div className="flex items-center">
            {assignee.avatar_url ? (
              <img 
                src={assignee.avatar_url} 
                alt={assignee.full_name}
                className="w-7 h-7 rounded-full mr-2.5 border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-blue-100 mr-2.5 flex items-center justify-center shadow-sm border-2 border-white">
                <span className="text-xs font-semibold text-blue-600">
                  {assignee.full_name ? assignee.full_name.charAt(0) : '?'}
                </span>
              </div>
            )}
            <div>
              <span className="text-xs text-gray-500 block">Assigned to</span>
              <span className="text-sm font-medium text-gray-700 truncate">
                {assignee.full_name}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de confirmação de exclusão */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Exclusão"
      >
        <div className="p-6">
          <p className="mb-4 text-gray-700">
            Tem certeza que deseja excluir a tarefa <strong>{task.title}</strong>?
          </p>
          <p className="mb-6 text-gray-500 text-sm">
            Esta ação não pode ser desfeita e todos os dados associados a esta tarefa serão removidos.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            
            <Button
              variant="primary"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TaskCard;