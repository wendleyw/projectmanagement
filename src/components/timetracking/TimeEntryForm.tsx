import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import Button from '../ui/Button';
import useTimeTrackingStore from '../../store/timeTrackingStore';
import useProjectStore from '../../store/projectStore';
import useTaskStore from '../../store/taskStore';
import useUserStore from '../../store/userStore';
import Modal from '../ui/Modal';

interface TimeEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: any; // Temporary type, will be replaced with TimeEntry type when implemented
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ isOpen, onClose, entryToEdit }) => {
  const { createEntry, updateEntry } = useTimeTrackingStore();
  const { projects } = useProjectStore();
  const { tasks } = useTaskStore();
  const { currentUser } = useUserStore();
  
  const [formData, setFormData] = useState({
    description: '',
    projectId: '',
    taskId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    billable: true,
    tags: [] as string[]
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  
  // Filter tasks based on selected project
  const filteredTasks = formData.projectId
    ? tasks.filter(task => task.projectId === formData.projectId)
    : [];
  
  // Fill the form if editing an existing entry
  useEffect(() => {
    if (entryToEdit) {
      const startTime = entryToEdit.startTime ? new Date(entryToEdit.startTime) : new Date();
      const endTime = entryToEdit.endTime ? new Date(entryToEdit.endTime) : new Date();
      
      setFormData({
        description: entryToEdit.description || '',
        projectId: entryToEdit.projectId || '',
        taskId: entryToEdit.taskId || '',
        date: entryToEdit.date || new Date().toISOString().split('T')[0],
        startTime: `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`,
        endTime: `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`,
        billable: entryToEdit.billable !== undefined ? entryToEdit.billable : true,
        tags: entryToEdit.tags || []
      });
    }
  }, [entryToEdit]);
  
  // Calculate duration in seconds
  const calculateDuration = () => {
    const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
    const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
    
    const startTimeInMinutes = startHours * 60 + startMinutes;
    const endTimeInMinutes = endHours * 60 + endMinutes;
    
    // If end time is earlier than start time, assume it's the next day
    const durationInMinutes = endTimeInMinutes >= startTimeInMinutes
      ? endTimeInMinutes - startTimeInMinutes
      : (24 * 60 - startTimeInMinutes) + endTimeInMinutes;
    
    return durationInMinutes * 60; // Convert to seconds
  };
  
  // Format duration for display (hh:mm)
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  };
  
  // Handler for form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when field is filled
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Add tag
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };
  
  // Remove tag
  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };
  
  // Validate the form
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !currentUser) return;
    
    const duration = calculateDuration();
    
    // Create object with time entry data
    const timeEntryData = {
      userId: currentUser.id,
      projectId: formData.projectId,
      taskId: formData.taskId || undefined,
      description: formData.description,
      startTime: `${formData.date}T${formData.startTime}:00`,
      endTime: `${formData.date}T${formData.endTime}:00`,
      duration,
      date: formData.date,
      billable: formData.billable,
      tags: formData.tags
    };
    
    let success;
    
    if (entryToEdit) {
      // Update existing entry
      success = await updateEntry(entryToEdit.id, timeEntryData);
    } else {
      // Create new entry
      success = await createEntry(timeEntryData);
    }
    
    if (success) {
      onClose();
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={entryToEdit ? 'Edit Time Entry' : 'New Time Entry'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description*
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Ex: Development of feature X"
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
              Project*
            </label>
            <select
              id="projectId"
              name="projectId"
              value={formData.projectId}
              onChange={(e) => {
                handleChange(e);
                setFormData(prev => ({ ...prev, taskId: '' })); // Reset task when project changes
              }}
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
          </div>
          
          <div>
            <label htmlFor="taskId" className="block text-sm font-medium text-gray-700 mb-1">
              Task (optional)
            </label>
            <select
              id="taskId"
              name="taskId"
              value={formData.taskId}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={!formData.projectId}
            >
              <option value="">Select a task</option>
              {filteredTasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date*
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>
          
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
              Start Time*
            </label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border ${errors.startTime ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>}
          </div>
          
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
              End Time*
            </label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border ${errors.endTime ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration
          </label>
          <div className="text-lg font-mono font-medium text-blue-600">
            {formatDuration(calculateDuration())}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (optional)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add tag"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTag}
            >
              Add
            </Button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <span 
                  key={tag} 
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    className="ml-1 text-blue-600 hover:text-blue-800"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="billable"
            name="billable"
            checked={formData.billable}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="billable" className="ml-2 block text-sm text-gray-700">
            Billable
          </label>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
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
          >
            {entryToEdit ? 'Update' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TimeEntryForm;
