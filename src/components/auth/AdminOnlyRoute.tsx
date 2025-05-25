import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import useUserStore from '../../store/userStore';
import { showNotification } from '../../utils/notifications';

interface AdminOnlyRouteProps {
  children: ReactNode;
  fallbackPath?: string; // Caminho para redirecionar se não for admin
}

/**
 * Componente que protege rotas apenas para administradores
 */
const AdminOnlyRoute: React.FC<AdminOnlyRouteProps> = ({
  children,
  fallbackPath = '/dashboard'
}) => {
  const { currentUser } = useUserStore();
  
  // Se não houver usuário logado, redireciona para login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // Verifica se o usuário é administrador
  if (currentUser.role !== 'admin') {
    showNotification('Esta área é restrita apenas para administradores', 'error');
    return <Navigate to={fallbackPath} />;
  }
  
  // Se for administrador, renderiza os filhos
  return <>{children}</>;
};

export default AdminOnlyRoute;
