import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import useProjectStore from '../../store/projectStore';
import useClientStore from '../../store/clientStore';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';

interface ProjectFormProps {
  onClose: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onClose }) => {
  const { createProject, isLoading } = useProjectStore();
  const { clients, fetchClients } = useClientStore();
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();

  // Fetch clients if needed
  useEffect(() => {
    if (clients.length === 0) {
      fetchClients();
    }
  }, [clients.length, fetchClients]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'planned' as 'planned' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled',
    budget: '',
    manager_id: user?.id || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.client_id) {
      newErrors.client_id = 'Client is required';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Data de início é obrigatória';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'Data de término é obrigatória';
    } else if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = 'Data de término deve ser posterior à data de início';
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      // Os dados já estão no formato esperado pelo Supabase
      const projectData = {
        name: formData.name,
        description: formData.description,
        client_id: formData.client_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        manager_id: formData.manager_id || user?.id
      };
      
      console.log('Enviando dados para criar projeto:', projectData);
      
      // Try to create the project
      const success = await createProject(projectData);
      
      if (success) {
        addNotification({
          type: 'success',
          message: `Project ${formData.name} created successfully!`
        });
        onClose();
      }
    } catch (error) {
      console.error('Error creating project:', error);
      addNotification({
        type: 'error',
        message: 'An error occurred while creating the project. Please try again.'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
          Project Name*
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
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
        <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-1.5">
          Client*
        </label>
        <select
          id="client_id"
          name="client_id"
          value={formData.client_id}
          onChange={handleChange}
          className={`block w-full px-3 py-2 border ${errors.client_id ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
        >
          <option value="">Select a client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        {errors.client_id && <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1.5">
            Start Date*
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${errors.start_date ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
        </div>

        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1.5">
            End Date*
          </label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${errors.end_date ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1.5">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label htmlFor="manager_id" className="block text-sm font-medium text-gray-700 mb-1.5">
            Manager ID
          </label>
          <input
            type="number"
            id="manager_id"
            name="manager_id"
            value={formData.manager_id}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1.5">
          Budget
        </label>
        <input
          type="number"
          id="budget"
          name="budget"
          step="0.01"
          min="0"
          value={formData.budget}
          onChange={handleChange}
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
          Create Project
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
