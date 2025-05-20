import React from 'react';
import { Task } from '../../types';
import { Calendar, Clock } from 'lucide-react';

interface UpcomingDeadlinesProps {
  tasks: Task[];
}

const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ tasks }) => {
  // Sort tasks by due date (ascending)
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
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

  // Helper function to get status badge styles
  const getStatusBadge = (status: Task['status']) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (status) {
      case 'todo':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'in-progress':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'review':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'blocked':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Helper function to get priority badge styles
  const getPriorityBadge = (priority: Task['priority']) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (priority) {
      case 'low':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'medium':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'high':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'urgent':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
      
      <div className="space-y-4">
        {sortedTasks.length > 0 ? (
          sortedTasks.slice(0, 5).map((task) => {
            const daysRemaining = getDaysRemaining(task.dueDate);
            
            return (
              <div key={task.id} className="flex items-start p-3 hover:bg-gray-50 rounded-md transition-colors">
                <div className="mr-4 flex-shrink-0">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{task.title}</h4>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className={getStatusBadge(task.status)}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                    <span className={getPriorityBadge(task.priority)}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <span>Due {formatDate(task.dueDate)}</span>
                  </div>
                </div>
                {daysRemaining !== null && (
                  <div className="ml-2">
                    <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
                      daysRemaining < 0
                        ? 'bg-red-100 text-red-800'
                        : daysRemaining === 0
                        ? 'bg-orange-100 text-orange-800'
                        : daysRemaining <= 2
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {daysRemaining < 0
                        ? `${Math.abs(daysRemaining)}d overdue`
                        : daysRemaining === 0
                        ? 'Today'
                        : `${daysRemaining}d left`}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No upcoming deadlines</p>
          </div>
        )}
      </div>
      
      {sortedTasks.length > 5 && (
        <div className="mt-6 text-center">
          <a
            href="#"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all deadlines
          </a>
        </div>
      )}
    </div>
  );
};

export default UpcomingDeadlines;