import React, { useState, useEffect } from 'react';
import { User, UserPermissions } from '../../store/userStore';
import useUserStore from '../../store/userStore';
import useProjectStore from '../../store/projectStore';
import Button from '../ui/Button';
import { showNotification } from '../../utils/notifications';
import { Shield } from 'lucide-react';

interface UserFormProps {
  user?: User; // Se fornecido, estamos editando um usuário existente
  onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose }) => {
  const { createUser, updateUser, updateUserPermissions } = useUserStore();
  const { projects } = useProjectStore();
  
  // Estado para os dados do formulário
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    role: user?.role || 'member',
    status: user?.status || 'active',
    password: '', // Apenas para novos usuários
    confirmPassword: '' // Apenas para novos usuários
  });
  
  // Estado para as permissões
  const [permissions, setPermissions] = useState<UserPermissions>({
    projectIds: user?.permissions?.projectIds || [],
    taskIds: user?.permissions?.taskIds || [],
    calendarAccess: user?.permissions?.calendarAccess || false,
    trackingAccess: user?.permissions?.trackingAccess || false
  });
  
  // Estado para controlar a exibição da seção de permissões
  const [showPermissions, setShowPermissions] = useState(false);
  
  // Estado para erros de validação
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Função para atualizar os dados do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro quando o campo é alterado
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Função para alternar a seleção de um projeto
  const toggleProjectSelection = (projectId: string) => {
    setPermissions(prev => {
      const isSelected = prev.projectIds.includes(projectId);
      
      if (isSelected) {
        return {
          ...prev,
          projectIds: prev.projectIds.filter(id => id !== projectId)
        };
      } else {
        return {
          ...prev,
          projectIds: [...prev.projectIds, projectId]
        };
      }
    });
  };
  
  // Função para alternar acesso ao calendário
  const toggleCalendarAccess = () => {
    setPermissions(prev => ({
      ...prev,
      calendarAccess: !prev.calendarAccess
    }));
  };
  
  // Função para alternar acesso ao tracking
  const toggleTrackingAccess = () => {
    setPermissions(prev => ({
      ...prev,
      trackingAccess: !prev.trackingAccess
    }));
  };
  
  // Validação do formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nome é obrigatório';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Sobrenome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    // Validação de senha apenas para novos usuários
    if (!user) {
      if (!formData.password) {
        newErrors.password = 'Senha é obrigatória';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Função para enviar o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (user) {
        // Atualizar usuário existente
        const userData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          status: formData.status as 'active' | 'inactive'
        };
        
        const success = await updateUser(user.id, userData);
        
        if (success) {
          // Atualizar permissões
          await updateUserPermissions(user.id, permissions);
          showNotification(`Usuário ${formData.firstName} ${formData.lastName} atualizado com sucesso`, 'success');
          onClose();
        }
      } else {
        // Criar novo usuário
        const userData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          status: formData.status as 'active' | 'inactive',
          password: formData.password
        };
        
        const newUser = await createUser(userData);
        
        if (newUser) {
          // Atualizar permissões do novo usuário
          await updateUserPermissions(newUser.id, permissions);
          showNotification(`Usuário ${formData.firstName} ${formData.lastName} criado com sucesso`, 'success');
          onClose();
        }
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      showNotification('Erro ao salvar usuário', 'error');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {user ? 'Editar Membro' : 'Adicionar Novo Membro'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nome */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
          )}
        </div>
        
        {/* Sobrenome */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Sobrenome
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
          )}
        </div>
        
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>
        
        {/* Função */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Função
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="admin">Administrador</option>
            <option value="manager">Gerente</option>
            <option value="member">Membro</option>
            <option value="client">Cliente</option>
          </select>
        </div>
      </div>
      
      {/* Senha (apenas para novos usuários) */}
      {!user && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Senha
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Status (apenas para edição) */}
      {user && (
        <div className="mt-4">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>
      )}
      
      {/* Botão para expandir/recolher a seção de permissões */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setShowPermissions(!showPermissions)}
          className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          <Shield size={16} className="mr-1" />
          {showPermissions ? 'Ocultar Permissões' : 'Configurar Permissões'}
          <svg className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {showPermissions ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            )}
          </svg>
        </button>
      </div>
      
      {/* Seção de permissões */}
      {showPermissions && (
        <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-md font-medium text-gray-800">Configurar Permissões de Acesso</h3>
          
          {/* Permissões de Projetos */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Projetos</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto p-2">
              {projects.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum projeto disponível</p>
              ) : (
                projects.map(project => (
                  <div key={project.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`project-${project.id}`}
                      checked={permissions.projectIds.includes(project.id)}
                      onChange={() => toggleProjectSelection(project.id)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor={`project-${project.id}`} className="ml-2 text-sm text-gray-700">
                      {project.name}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Permissões de Calendário e Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Calendário</h4>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="calendar-access"
                  checked={permissions.calendarAccess}
                  onChange={toggleCalendarAccess}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="calendar-access" className="ml-2 text-sm text-gray-700">
                  Permitir acesso ao calendário
                </label>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Tracking</h4>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="tracking-access"
                  checked={permissions.trackingAccess}
                  onChange={toggleTrackingAccess}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="tracking-access" className="ml-2 text-sm text-gray-700">
                  Permitir tracking de tempo
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Botões de ação */}
      <div className="mt-6 flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={onClose}
        >
          Cancelar
        </Button>
        
        <Button
          variant="primary"
          type="submit"
        >
          {user ? 'Atualizar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
