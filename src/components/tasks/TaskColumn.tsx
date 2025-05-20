import React from 'react';
import { Task, User } from '../../types';
import TaskCard from './TaskCard';

interface TaskColumnProps {
  title: string;
  status: Task['status'];
  tasks: Task[];
  users: User[];
  onDrop: (taskId: string, status: Task['status']) => void;
  onTaskClick: (taskId: string) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  title,
  status,
  tasks,
  users,
  onDrop,
  onTaskClick,
}) => {
  // Get status color
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-300';
      case 'in-progress':
        return 'bg-blue-500';
      case 'review':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'blocked':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };
  
  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onDrop(taskId, status);
    }
  };
  
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  return (
    <div
      className="flex flex-col min-w-[280px] w-full bg-gray-50 rounded-lg"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(status)}`}></div>
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <span className="ml-2 text-xs font-medium text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        </div>
      </div>
      
      <div className="flex-1 p-2 overflow-y-auto space-y-2">
        {tasks.length > 0 ? (
          tasks.map(task => {
            const assignee = users.find(user => user.id === task.assigneeId);
            
            return (
              <TaskCard
                key={task.id}
                task={task}
                assignee={assignee}
                draggable
                onDragStart={handleDragStart}
                onClick={onTaskClick}
              />
            );
          })
        ) : (
          <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-500">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;