import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, List, Kanban } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import TaskColumn from '../components/tasks/TaskColumn';
import TaskCard from '../components/tasks/TaskCard';
import Badge from '../components/ui/Badge';
import useTaskStore from '../store/taskStore';
import useProjectStore from '../store/projectStore';
import useAuthStore from '../store/authStore';

const Tasks: React.FC = () => {
  const { tasks, fetchTasks, updateTaskStatus } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  const { user } = useAuthStore();
  
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  
  // Fetch data
  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [fetchTasks, fetchProjects]);
  
  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesProject = projectFilter === 'all' || task.projectId === projectFilter;
    
    return matchesSearch && matchesProject;
  });
  
  // Group tasks by status
  const tasksByStatus = {
    todo: filteredTasks.filter(task => task.status === 'todo'),
    'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
    review: filteredTasks.filter(task => task.status === 'review'),
    completed: filteredTasks.filter(task => task.status === 'completed'),
    blocked: filteredTasks.filter(task => task.status === 'blocked'),
  };
  
  // Handle drop for drag and drop
  const handleDrop = (taskId: string, newStatus: string) => {
    updateTaskStatus(taskId, newStatus as any);
  };
  
  // Handle task click
  const handleTaskClick = (taskId: string) => {
    // Open task details (in real app)
    console.log(`Task clicked: ${taskId}`);
  };
  
  return (
    <div>
      <PageHeader 
        title="Tasks" 
        subtitle="Manage your tasks and track progress."
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Tasks' },
        ]}
        actions={
          <Button variant="primary" icon={<Plus size={18} />}>
            New Task
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
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2 min-w-[200px]">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center rounded-md border border-gray-300 p-1">
          <button
            className={`px-3 py-1 rounded-md flex items-center ${
              view === 'kanban' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
            }`}
            onClick={() => setView('kanban')}
          >
            <Kanban className="h-5 w-5 mr-1" />
            Kanban
          </button>
          <button
            className={`px-3 py-1 rounded-md flex items-center ${
              view === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
            }`}
            onClick={() => setView('list')}
          >
            <List className="h-5 w-5 mr-1" />
            List
          </button>
        </div>
      </div>
      
      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-6">
          <TaskColumn
            title="To Do"
            status="todo"
            tasks={tasksByStatus.todo}
            users={[user]}
            onDrop={handleDrop}
            onTaskClick={handleTaskClick}
          />
          <TaskColumn
            title="In Progress"
            status="in-progress"
            tasks={tasksByStatus['in-progress']}
            users={[user]}
            onDrop={handleDrop}
            onTaskClick={handleTaskClick}
          />
          <TaskColumn
            title="In Review"
            status="review"
            tasks={tasksByStatus.review}
            users={[user]}
            onDrop={handleDrop}
            onTaskClick={handleTaskClick}
          />
          <TaskColumn
            title="Completed"
            status="completed"
            tasks={tasksByStatus.completed}
            users={[user]}
            onDrop={handleDrop}
            onTaskClick={handleTaskClick}
          />
          <TaskColumn
            title="Blocked"
            status="blocked"
            tasks={tasksByStatus.blocked}
            users={[user]}
            onDrop={handleDrop}
            onTaskClick={handleTaskClick}
          />
        </div>
      )}
      
      {/* List View */}
      {view === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignee
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => {
                  const project = projects.find(p => p.id === task.projectId);
                  
                  return (
                    <tr 
                      key={task.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleTaskClick(task.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{project?.name || 'Unknown Project'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            task.status === 'todo' ? 'default' :
                            task.status === 'in-progress' ? 'primary' :
                            task.status === 'review' ? 'warning' :
                            task.status === 'completed' ? 'success' :
                            'danger'
                          }
                        >
                          {task.status.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {task.dueDate 
                            ? new Date(task.dueDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }) 
                            : 'No due date'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.avatar ? (
                            <img
                              className="h-8 w-8 rounded-full mr-2"
                              src={user.avatar}
                              alt={`${user.firstName} ${user.lastName}`}
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                              <span className="text-xs font-medium text-gray-600">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No tasks found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Tasks;