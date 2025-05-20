import React from 'react';
import { Link } from 'react-router-dom';
import { Project, Client, User, Task } from '../../types';
import { Calendar, CreditCard, Users, CheckSquare } from 'lucide-react';
import Badge from '../ui/Badge';

interface ProjectCardProps {
  project: Project;
  client: Client | undefined;
  manager: User | undefined;
  tasks: Task[];
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, client, manager, tasks }) => {
  // Helper function to calculate project progress
  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.status === 'completed');
    return Math.round((completedTasks.length / tasks.length) * 100);
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            <Link to={`/projects/${project.id}`}>{project.name}</Link>
          </h3>
          <Badge variant={getStatusBadge(project.status)}>
            {project.status.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </Badge>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
        
        <div className="space-y-3">
          {client && (
            <div className="flex items-center text-sm">
              <Users className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-700">{client.name}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-700">
              {formatDate(project.startDate)} - {formatDate(project.endDate)}
            </span>
          </div>
          
          {project.budget && (
            <div className="flex items-center text-sm">
              <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-700">
                ${project.budget.toLocaleString()}
              </span>
            </div>
          )}
          
          <div className="flex items-center text-sm">
            <CheckSquare className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-700">
              {tasks.filter(t => t.status === 'completed').length}/{tasks.length} Tasks
            </span>
          </div>
        </div>
      </div>
      
      <div className="px-5 pb-5 pt-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-700">Progress</span>
          <span className="text-xs font-medium text-gray-700">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              progress < 30
                ? 'bg-red-500'
                : progress < 70
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {manager && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-center">
            {manager.avatar ? (
              <img 
                src={manager.avatar} 
                alt={`${manager.firstName} ${manager.lastName}`}
                className="w-6 h-6 rounded-full mr-2"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-300 mr-2 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  {manager.firstName[0]}{manager.lastName[0]}
                </span>
              </div>
            )}
            <span className="text-xs text-gray-600">
              Managed by <span className="font-medium text-gray-700">{manager.firstName} {manager.lastName}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;