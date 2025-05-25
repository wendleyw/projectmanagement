import React, { useState, useEffect } from 'react';
import { Shield, Save, X } from 'lucide-react';
import { User } from '../../types';
import useUserStore from '../../store/userStore';
import { usePermissions } from '../../hooks/usePermissions';

// Estender o tipo User para incluir permissões
interface UserWithPermissions extends User {
  permissions?: {
    projectIds: string[];
    taskIds: string[];
    calendarAccess: boolean;
    trackingAccess: boolean;
    projectMemberships?: any[];
    taskAssignments?: any[];
  }
}

interface QuickPermissionSettingsProps {
  userId: string;
  onClose?: () => void;
  onSave?: () => void;
}

/**
 * Componente para configurau00e7u00e3o ru00e1pida de permissu00f5es de um usuu00e1rio
 * Permite que administradores ajustem rapidamente as permissu00f5es sem precisar ir para a pu00e1gina completa
 */
const QuickPermissionSettings: React.FC<QuickPermissionSettingsProps> = ({ 
  userId,
  onClose,
  onSave
}) => {
  const { users, updateUserPermissions } = useUserStore();
  const { hasRole } = usePermissions();
  
  const [user, setUser] = useState<UserWithPermissions | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Permissu00f5es
  const [calendarAccess, setCalendarAccess] = useState(false);
  const [trackingAccess, setTrackingAccess] = useState(false);
  
  // Carregar dados do usuu00e1rio
  useEffect(() => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      // Converter User para UserWithPermissions
      setUser(selectedUser as unknown as UserWithPermissions);
      setCalendarAccess(selectedUser.permissions?.calendarAccess || false);
      setTrackingAccess(selectedUser.permissions?.trackingAccess || false);
    }
  }, [userId, users]);
  
  // Verificar se o usuu00e1rio atual u00e9 administrador
  const isAdmin = hasRole('admin');
  
  // Salvar alterau00e7u00f5es
  const handleSave = async () => {
    if (!user || !isAdmin) return;
    
    setLoading(true);
    
    try {
      // Criar objeto de permissu00f5es atualizado
      const updatedPermissions = {
        projectIds: user.permissions?.projectIds || [],
        taskIds: user.permissions?.taskIds || [],
        calendarAccess,
        trackingAccess,
        projectMemberships: user.permissions?.projectMemberships || [],
        taskAssignments: user.permissions?.taskAssignments || []
      };
      
      // Atualizar permissu00f5es do usuu00e1rio
      await updateUserPermissions(userId, updatedPermissions);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onSave) onSave();
      }, 2000);
    } catch (error) {
      console.error('Erro ao atualizar permissu00f5es:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          <h3 className="font-medium">Permissu00f5es Ru00e1pidas</h3>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-white hover:text-indigo-100"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">
            Usuu00e1rio: <span className="text-indigo-600">{user.full_name}</span>
          </p>
          <p className="text-xs text-gray-500">
            Funu00e7u00e3o: {user.role === 'admin' ? 'Administrador' : user.role === 'manager' ? 'Gerente' : 'Membro'}
          </p>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="calendar-access"
              checked={calendarAccess}
              onChange={(e) => setCalendarAccess(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              disabled={!isAdmin || loading}
            />
            <label htmlFor="calendar-access" className="ml-2 block text-sm text-gray-700">
              Acesso ao Calendu00e1rio
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="tracking-access"
              checked={trackingAccess}
              onChange={(e) => setTrackingAccess(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              disabled={!isAdmin || loading}
            />
            <label htmlFor="tracking-access" className="ml-2 block text-sm text-gray-700">
              Acesso ao Tracking
            </label>
          </div>
        </div>
        
        <div className="pt-3 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={!isAdmin || loading}
            className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isAdmin ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            {loading ? (
              'Salvando...'
            ) : success ? (
              <span className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Permissu00f5es Atualizadas
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="w-4 h-4 mr-2" />
                Salvar Permissu00f5es
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickPermissionSettings;
