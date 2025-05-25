import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import ProjectDetails from '../../pages/ProjectDetails';
import PermissionGuard from '../auth/PermissionGuard';

/**
 * Componente wrapper para verificar permissões para um projeto específico
 * Extrai o ID do projeto da URL e passa para o PermissionGuard
 */
const ProjectDetailsWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <Navigate to="/projects" />;
  }
  
  return (
    <PermissionGuard 
      requiredPermission="project" 
      resourceId={id}
    >
      <ProjectDetails />
    </PermissionGuard>
  );
};

export default ProjectDetailsWrapper;
