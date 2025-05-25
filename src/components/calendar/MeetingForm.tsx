import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import useProjectStore from '../../store/projectStore';
import useClientStore from '../../store/clientStore';
import useMeetingStore from '../../store/meetingStore';

interface MeetingFormProps {
  onClose: () => void;
  selectedDate?: Date;
  selectedProjectId?: string;
}

interface MeetingData {
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  projectId: string;
  clientId: string;
  location: string;
  meetingType: 'presencial' | 'online';
  meetingLink?: string;
}

const MeetingForm: React.FC<MeetingFormProps> = ({ 
  onClose, 
  selectedDate = new Date(),
  selectedProjectId = ''
}) => {
  const { projects } = useProjectStore();
  const { clients } = useClientStore();
  const { createMeeting } = useMeetingStore();
  
  // Formatando a data para o formato YYYY-MM-DD para o input date
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Formatando a hora atual para o formato HH:MM para o input time
  const formatTimeForInput = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  const [formData, setFormData] = useState<MeetingData>({
    title: '',
    description: '',
    date: formatDateForInput(selectedDate),
    time: formatTimeForInput(selectedDate),
    duration: 60, // Duração padrão de 60 minutos
    projectId: selectedProjectId,
    clientId: '',
    location: '',
    meetingType: 'online'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Atualizar o clientId quando o projectId mudar
  useEffect(() => {
    if (formData.projectId) {
      const project = projects.find(p => p.id === formData.projectId);
      if (project && project.clientId) {
        setFormData(prev => ({
          ...prev,
          clientId: project.clientId
        }));
      }
    }
  }, [formData.projectId, projects]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro quando o campo for preenchido
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'O título da reunião é obrigatório';
    }
    
    if (!formData.date) {
      newErrors.date = 'A data da reunião é obrigatória';
    }
    
    if (!formData.time) {
      newErrors.time = 'O horário da reunião é obrigatório';
    }
    
    if (!formData.projectId) {
      newErrors.projectId = 'O projeto é obrigatório';
    }
    
    if (!formData.clientId) {
      newErrors.clientId = 'O cliente é obrigatório';
    }
    
    if (formData.meetingType === 'online' && !formData.meetingLink?.trim()) {
      newErrors.meetingLink = 'O link da reunião é obrigatório para reuniões online';
    }
    
    if (formData.meetingType === 'presencial' && !formData.location.trim()) {
      newErrors.location = 'O local da reunião é obrigatório para reuniões presenciais';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    // Criar a reunião usando o store
    const success = await createMeeting({
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      duration: formData.duration,
      projectId: formData.projectId,
      clientId: formData.clientId,
      location: formData.location,
      meetingType: formData.meetingType,
      meetingLink: formData.meetingLink
    });
    
    if (success) {
      // Fechar o modal
      onClose();
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Título da Reunião*
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`block w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          placeholder="Ex: Revisão do Projeto"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Detalhes sobre a reunião..."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Data*
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
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
            Horário*
          </label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${errors.time ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
        </div>
      </div>
      
      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
          Duração (minutos)
        </label>
        <input
          type="number"
          id="duration"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          min="15"
          step="15"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
          Projeto*
        </label>
        <select
          id="projectId"
          name="projectId"
          value={formData.projectId}
          onChange={handleChange}
          className={`block w-full px-3 py-2 border ${errors.projectId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
        >
          <option value="">Selecione um projeto</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        {errors.projectId && <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>}
      </div>
      
      <div>
        <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
          Cliente*
        </label>
        <select
          id="clientId"
          name="clientId"
          value={formData.clientId}
          onChange={handleChange}
          className={`block w-full px-3 py-2 border ${errors.clientId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          disabled={!formData.projectId} // Desabilitar se nenhum projeto for selecionado
        >
          <option value="">Selecione um cliente</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        {errors.clientId && <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>}
      </div>
      
      <div>
        <label htmlFor="meetingType" className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Reunião
        </label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="meetingType"
              value="online"
              checked={formData.meetingType === 'online'}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Online</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="meetingType"
              value="presencial"
              checked={formData.meetingType === 'presencial'}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Presencial</span>
          </label>
        </div>
      </div>
      
      {formData.meetingType === 'online' ? (
        <div>
          <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700 mb-1">
            Link da Reunião*
          </label>
          <input
            type="text"
            id="meetingLink"
            name="meetingLink"
            value={formData.meetingLink || ''}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${errors.meetingLink ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Ex: https://meet.google.com/..."
          />
          {errors.meetingLink && <p className="mt-1 text-sm text-red-600">{errors.meetingLink}</p>}
        </div>
      ) : (
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Local da Reunião*
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Ex: Escritório do cliente"
          />
          {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
        </div>
      )}
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          variant="outline"
          type="button"
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          type="submit"
        >
          Agendar Reunião
        </Button>
      </div>
    </form>
  );
};

export default MeetingForm;
