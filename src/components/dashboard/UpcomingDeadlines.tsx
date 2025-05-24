import React, { useState } from 'react';
import { Task } from '../../types';
import { Calendar, Clock, Plus, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../ui/Modal';
import TaskForm from '../tasks/TaskForm';

interface UpcomingDeadlinesProps {
  tasks: Task[];
}

const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ tasks }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sort tasks by due date (ascending)
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
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
    
    const due_date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = due_date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Helper function to get status badge styles
  const getStatusBadge = (status: Task['status']) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium shadow-sm';
    
    switch (status) {
      case 'todo':
        return `${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`;
      case 'in_progress':
        return `${baseClasses} bg-blue-50 text-blue-700 border border-blue-100`;
      case 'review':
        return `${baseClasses} bg-indigo-50 text-indigo-700 border border-indigo-100`;
      case 'done':
        return `${baseClasses} bg-emerald-50 text-emerald-700 border border-emerald-100`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center"
        >
          <Plus size={14} className="mr-1.5" />
          Add Task
        </button>
      </div>
      
      <div className="space-y-4">
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task) => {
            const daysRemaining = getDaysRemaining(task.due_date);
            
            return (
              <div
                key={task.id}
                className="flex items-start p-3.5 border border-gray-100 rounded-lg hover:bg-gray-50/70 transition-all duration-200 shadow-sm hover:shadow"
              >
                <div
                  className={`flex-shrink-0 w-1.5 h-12 rounded-full mr-3.5 ${
                    daysRemaining !== null
                      ? daysRemaining < 0
                        ? 'bg-red-500'
                        : daysRemaining <= 2
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                      : 'bg-gray-300'
                  }`}
                ></div>
                
                <div className="flex-1 min-w-0">
                  <Link to={`/tasks?id=${task.id}`} className="text-sm font-medium text-gray-800 truncate hover:text-blue-600 transition-colors duration-200">
                    {task.title}
                  </Link>
                  
                  <div className="mt-1.5 flex items-center text-xs">
                    <span className="bg-blue-50 text-blue-600 p-1 rounded-md mr-2 flex items-center justify-center">
                      <Calendar className="h-3 w-3" />
                    </span>
                    <span className="text-gray-600">{formatDate(task.due_date)}</span>
                    
                    {daysRemaining !== null && (
                      <>
                        <span className="mx-2 text-gray-300">&middot;</span>
                        <span className="bg-gray-50 text-gray-600 p-1 rounded-md mr-2 flex items-center justify-center">
                          <Clock className="h-3 w-3" />
                        </span>
                        <span
                          className={
                            daysRemaining < 0
                              ? 'text-red-600 font-medium'
                              : daysRemaining <= 2
                              ? 'text-amber-600 font-medium'
                              : 'text-emerald-600 font-medium'
                          }
                        >
                          {daysRemaining < 0
                            ? `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''} overdue`
                            : daysRemaining === 0
                            ? 'Due today'
                            : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {task.project_id && (
                    <div className="mt-2">
                      <Link to={`/projects/${task.project_id}`} className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2.5 py-1 rounded-md inline-flex items-center transition-colors duration-200">
                        <Briefcase size={12} className="mr-1.5" />
                        {'View Project'}
                      </Link>
                    </div>
                  )}
                </div>
                
                <div className="ml-3 flex-shrink-0">
                  <span className={getStatusBadge(task.status)}>
                    {task.status.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 px-4 bg-gray-50/70 rounded-lg border border-dashed border-gray-200">
            <div className="bg-blue-50 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock size={20} className="text-blue-500" />
            </div>
            <p className="text-sm text-gray-600 mb-3">No upcoming deadlines found.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center mx-auto"
            >
              <Plus size={14} className="mr-1.5" />
              Create first task
            </button>
          </div>
        )}
        
        {sortedTasks.length > 0 && (
          <div className="text-center pt-4">
            <Link 
              to="/tasks" 
              className="text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors inline-flex items-center"
            >
              <Clock size={14} className="mr-1.5 text-gray-500" />
              View all tasks
            </Link>
          </div>
        )}
      </div>

      {/* Modal para adicionar nova tarefa */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Task"
        size="lg"
      >
        <TaskForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default UpcomingDeadlines;