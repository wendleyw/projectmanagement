import React from 'react';
import { Task, User } from '../../types';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import Badge from '../ui/Badge';

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

  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 shadow-sm 
        hover:shadow-md transition-shadow duration-200
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={handleClick}
      draggable={draggable}
      onDragStart={handleDragStart}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-base font-medium text-gray-900 line-clamp-2">{task.title}</h3>
          <Badge variant={getPriorityBadge(task.priority)} size="sm">
            {task.priority}
          </Badge>
        </div>
        
        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
        )}
        
        <div className="space-y-2">
          {task.dueDate && (
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                <span>Due {formatDate(task.dueDate)}</span>
              </div>
              
              {daysRemaining !== null && (
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                  isOverdue
                    ? 'bg-red-100 text-red-800'
                    : daysRemaining === 0
                    ? 'bg-orange-100 text-orange-800'
                    : daysRemaining <= 2
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {isOverdue
                    ? `${Math.abs(daysRemaining)}d late`
                    : daysRemaining === 0
                    ? 'Today'
                    : `${daysRemaining}d left`}
                </span>
              )}
            </div>
          )}
          
          {task.estimatedHours && (
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>Est: {task.estimatedHours}h</span>
            </div>
          )}
        </div>
      </div>
      
      {assignee && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-center">
            {assignee.avatar ? (
              <img 
                src={assignee.avatar} 
                alt={`${assignee.firstName} ${assignee.lastName}`}
                className="w-6 h-6 rounded-full mr-2"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-300 mr-2 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  {assignee.firstName[0]}{assignee.lastName[0]}
                </span>
              </div>
            )}
            <span className="text-xs text-gray-600 truncate">
              {assignee.firstName} {assignee.lastName}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;