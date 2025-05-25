import React, { useState, useEffect } from 'react';
import { Key, Shield } from 'lucide-react';
import Button from '../ui/Button';
import useUserStore from '../../store/userStore';
import useProjectStore from '../../store/projectStore';
import useTaskStore from '../../store/taskStore';
import Modal from '../ui/Modal';
import { User } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { showNotification } from '../../utils/notifications';

interface TeamMemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: User | null;
}

const TeamMemberForm: React.FC<TeamMemberFormProps> = ({ isOpen, onClose, memberToEdit }) => {
  const { createUser, updateUser } = useUserStore();
  const { projects } = useProjectStore();
  const { tasks } = useTaskStore();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'member',
    status: 'active',
    password: '',
    sendInvite: true,
    assignedProjects: [] as string[],
    assignedTasks: [] as string[]
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Gerar senha aleatória para novos membros
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };
  
  // Preencher o formulário se estiver editando um membro existente
  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        firstName: memberToEdit.firstName || '',
        lastName: memberToEdit.lastName || '',
        email: memberToEdit.email || '',
        role: memberToEdit.role || 'member',
        status: 'active', // Status padrão
        password: '',
        sendInvite: false,
        assignedProjects: projects
          .filter(project => {
            // Verificar se o membro está atribuído ao projeto
            if (project.teamMembers && Array.isArray(project.teamMembers)) {
              return project.teamMembers.includes(memberToEdit.id);
            }
            return false;
          })
          .map(project => project.id),
        assignedTasks: tasks
          .filter(task => task.assigneeId === memberToEdit.id)
          .map(task => task.id)
      });
    } else {
      // Resetar o formulário para um novo membro
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'member',
        status: 'active',
        password: generateRandomPassword(),
        sendInvite: true,
        assignedProjects: [],
        assignedTasks: []
      });
    }
  }, [memberToEdit, projects, tasks]);
  
  // Handler para alteração de campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpar erro quando o campo é alterado
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handler para alteração de projetos atribuídos
  const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    setFormData(prev => {
      if (checked) {
        // Adicionar projeto à lista
        return {
          ...prev,
          assignedProjects: [...prev.assignedProjects, value]
        };
      } else {
        // Remover projeto da lista
        return {
          ...prev,
          assignedProjects: prev.assignedProjects.filter(id => id !== value)
        };
      }
    });
  };
  
  // Validar formulário
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }
    
    if (!memberToEdit && !formData.password) {
      newErrors.password = 'Password is required for new members';
    } else if (!memberToEdit && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Função para enviar convite por email
  const sendInviteEmail = async (email: string) => {
    // Implementação do envio de email com credenciais provisórias
    console.log(`Sending invite to ${email}`);
    // Aqui seria implementada a lógica de envio de email
  };
  
  // Função para criar conta no Supabase Auth
  const createAuthAccount = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            role: formData.role
          }
        }
      });
      
      if (error) throw error;
      
      return data.user?.id;
    } catch (error) {
      console.error('Error creating auth account:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  };
  
  // Handler para submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    try {
      if (memberToEdit) {
        // Atualizar membro existente
        await updateUser(memberToEdit.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role as 'admin' | 'member' | 'manager' | 'client'
        });
        
        // Atualizar projetos atribuídos
        for (const projectId of formData.assignedProjects) {
          const project = projects.find(p => p.id === projectId);
          if (project) {
            const teamMembers = project.teamMembers || [];
            if (!teamMembers.includes(memberToEdit.id)) {
              // Adicionar membro ao projeto
              const updatedTeamMembers = [...teamMembers, memberToEdit.id];
              await supabase
                .from('projects')
                .update({ teamMembers: updatedTeamMembers })
                .eq('id', projectId);
            }
          }
        }
        
        // Remover membro de projetos não selecionados
        for (const project of projects) {
          if (
            project.teamMembers &&
            Array.isArray(project.teamMembers) &&
            project.teamMembers.includes(memberToEdit.id) &&
            !formData.assignedProjects.includes(project.id)
          ) {
            const updatedTeamMembers = project.teamMembers.filter(
              (id: string) => id !== memberToEdit.id
            );
            await supabase
              .from('projects')
              .update({ teamMembers: updatedTeamMembers })
              .eq('id', project.id);
          }
        }
        
        showNotification(`Member ${formData.firstName} updated successfully`, 'success');
        onClose();
      } else {
        // Criar novo membro
        let authUserId;
        
        // Criar conta de autenticação se for enviar convite
        if (formData.sendInvite) {
          authUserId = await createAuthAccount(formData.email, formData.password);
        }
        
        // Criar usuário no banco de dados
        const newUser = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role as 'admin' | 'member' | 'manager' | 'client',
          status: (formData.status || 'active') as 'active' | 'inactive'
          // Removemos o campo authId que não existe na tabela
        };
        
        const createdUser = await createUser(newUser);
        
        if (createdUser) {
          // Atribuir projetos ao novo membro
          for (const projectId of formData.assignedProjects) {
            const project = projects.find(p => p.id === projectId);
            if (project) {
              const teamMembers = project.teamMembers || [];
              const updatedTeamMembers = [...teamMembers, createdUser.id];
              await supabase
                .from('projects')
                .update({ teamMembers: updatedTeamMembers })
                .eq('id', projectId);
            }
          }
          
          // Enviar convite por email se solicitado
          if (formData.sendInvite) {
            await sendInviteEmail(formData.email);
          }
          
          showNotification(`Member ${formData.firstName} created successfully`, 'success');
          onClose();
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating/updating member:', errorMessage);
      showNotification(`Error: ${errorMessage}`, 'error');
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={memberToEdit ? 'Edit Member' : 'New Member'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name*
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name*
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
          </div>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email*
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield size={16} className="text-gray-400" />
              </div>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="client">Client</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        {!memberToEdit && (
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Temporary Password*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
              <div className="mt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, password: generateRandomPassword() }))}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Generate random password
                </button>
                <span className="text-xs text-gray-500">Minimum 8 characters</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendInvite"
                name="sendInvite"
                checked={formData.sendInvite}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="sendInvite" className="ml-2 block text-sm text-gray-700">
                Send invite via email
              </label>
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assigned Projects
          </label>
          <div className="bg-gray-50 p-4 rounded-md max-h-60 overflow-y-auto">
            {projects.length > 0 ? (
              <div className="space-y-2">
                {projects.map(project => (
                  <div key={project.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`project-${project.id}`}
                      value={project.id}
                      checked={formData.assignedProjects.includes(project.id)}
                      onChange={handleProjectChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`project-${project.id}`} className="ml-2 block text-sm text-gray-700">
                      {project.name}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No projects available</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assigned Tasks
          </label>
          <div className="bg-gray-50 p-4 rounded-md max-h-60 overflow-y-auto">
            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`task-${task.id}`}
                      value={task.id}
                      checked={formData.assignedTasks.includes(task.id)}
                      onChange={handleProjectChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`task-${task.id}`} className="ml-2 block text-sm text-gray-700">
                      {task.name}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No tasks available</p>
            )}
          </div>
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
            {memberToEdit ? 'Update Member' : 'Add Member'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TeamMemberForm;
