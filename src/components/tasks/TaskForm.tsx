import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import Button from '../ui/Button';
import useTaskStore from '../../store/taskStore';
import useProjectStore from '../../store/projectStore';
import useClientStore from '../../store/clientStore';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';

interface TaskFormProps {
  onClose: () => void;
  taskToEdit?: any; // Task to edit if in edit mode
}

const TaskForm: React.FC<TaskFormProps> = ({ onClose, taskToEdit }) => {
  const { createTask, updateTask, isLoading } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  const { clients, fetchClients } = useClientStore();
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();

  // Fetch projects and clients if needed
  useEffect(() => {
    if (projects.length === 0) {
      fetchProjects();
    }
    if (clients.length === 0) {
      fetchClients();
    }
  }, [projects.length, fetchProjects, clients.length, fetchClients]);

  // Initialize form data with task data if in edit mode
  const [formData, setFormData] = useState({
    title: taskToEdit?.title || '',
    description: taskToEdit?.description || '',
    projectId: taskToEdit?.project_id || '',
    assigneeId: taskToEdit?.assignee_id || user?.id || '',
    priority: (taskToEdit?.priority || 'medium') as 'low' | 'medium' | 'high' | 'urgent',
    status: (taskToEdit?.status || 'todo') as 'todo' | 'in_progress' | 'review' | 'done' | 'blocked',
    startDate: taskToEdit?.start_date ? new Date(taskToEdit.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    dueDate: taskToEdit?.due_date ? new Date(taskToEdit.due_date).toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estimatedHours: taskToEdit?.estimated_hours?.toString() || ''
  });

  // State to store the client associated with the selected project
  const [selectedProjectClient, setSelectedProjectClient] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else if (new Date(formData.dueDate) <= new Date(formData.startDate)) {
      newErrors.dueDate = 'Due date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update the client associated with the project when the project is changed
    if (name === 'projectId' && value) {
      const selectedProject = projects.find(p => p.id === value);
      if (selectedProject && selectedProject.clientId) {
        setSelectedProjectClient(selectedProject.clientId);
      } else {
        setSelectedProjectClient(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    // Convert estimatedHours to number if provided
    const taskData = {
      ...formData,
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined
    };
    
    let success;
    
    if (taskToEdit) {
      // Update existing task
      success = await updateTask(taskToEdit.id, taskData);
      
      if (success) {
        addNotification({
          type: 'success',
          message: `Task "${formData.title}" updated successfully!`
        });
        onClose();
      } else {
        addNotification({
          type: 'error',
          message: 'Error updating task. Please try again.'
        });
      }
    } else {
      // Create new task
      success = await createTask(taskData);
      
      if (success) {
        addNotification({
          type: 'success',
          message: `Task "${formData.title}" created successfully!`
        });
        onClose();
      } else {
        addNotification({
          type: 'error',
          message: 'Error creating task. Please try again.'
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Task Title*
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`block w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description*
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className={`block w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      <div>
        <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
          Project*
        </label>
        <select
          id="projectId"
          name="projectId"
          value={formData.projectId}
          onChange={handleChange}
          className={`block w-full px-3 py-2 border ${errors.projectId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
        >
          <option value="">Select a project</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        {errors.projectId && <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>}
        
        {selectedProjectClient && (
          <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-100">
            <div className="flex items-center mb-2">
              <Users size={16} className="text-blue-500 mr-2" />
              <span className="text-sm font-medium text-blue-700">Client associated with the project</span>
            </div>
            {clients.filter(client => client.id === selectedProjectClient).map(client => (
              <div key={client.id} className="pl-6">
                <Link 
                  to={`/clients/${client.id}`} 
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {client.name}
                </Link>
                <p className="text-xs text-gray-500 mt-1">
                  Contact: {client.contactName} | {client.email}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date*
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${errors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date*
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${errors.dueDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority*
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status*
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">In Review</option>
            <option value="done">Done</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-1">
          Estimated Hours
        </label>
        <input
          type="number"
          id="estimatedHours"
          name="estimatedHours"
          value={formData.estimatedHours}
          onChange={handleChange}
          placeholder="0.0"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          isLoading={isLoading}
        >
          Save Task
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
