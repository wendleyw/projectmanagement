import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Briefcase, CheckSquare, Calendar, Clock, Book } from 'lucide-react';
import { useIsAuthenticated, useIsAdmin } from '../../store/authStore';

/**
 * Componente de menu para navegau00e7u00e3o entre as diferentes u00e1reas do sistema de permissu00f5es
 */
const PermissionsMenu: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const isAdmin = useIsAdmin();

  if (!isAuthenticated) return null;

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Shield className="w-5 h-5 mr-2 text-indigo-600" />
        Sistema de Permissu00f5es
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {isAdmin && (
          <>
            <Link
              to="/permissions-example"
              className="flex items-center p-3 rounded-md hover:bg-indigo-50 transition-colors"
            >
              <Shield className="w-4 h-4 mr-2 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Demonstrau00e7u00e3o de Permissu00f5es</span>
            </Link>
            
            <Link
              to="/permissions-docs"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
            >
              <Book className="mr-2 h-5 w-5 text-gray-500" />
              Documentação
            </Link>
            
            <Link
              to="/permissions-summary"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
            >
              <Shield className="mr-2 h-5 w-5 text-gray-500" />
              Resumo do Sistema
            </Link>
          </>
        )}

        <Link
          to="/team"
          className="flex items-center p-3 rounded-md hover:bg-indigo-50 transition-colors"
        >
          <Users className="w-4 h-4 mr-2 text-indigo-600" />
          <span className="text-sm font-medium text-gray-700">Gerenciar Equipe</span>
        </Link>

        <Link
          to="/projects"
          className="flex items-center p-3 rounded-md hover:bg-indigo-50 transition-colors"
        >
          <Briefcase className="w-4 h-4 mr-2 text-indigo-600" />
          <span className="text-sm font-medium text-gray-700">Projetos</span>
        </Link>

        <Link
          to="/tasks"
          className="flex items-center p-3 rounded-md hover:bg-indigo-50 transition-colors"
        >
          <CheckSquare className="w-4 h-4 mr-2 text-indigo-600" />
          <span className="text-sm font-medium text-gray-700">Tarefas</span>
        </Link>

        <Link
          to="/calendar"
          className="flex items-center p-3 rounded-md hover:bg-indigo-50 transition-colors"
        >
          <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
          <span className="text-sm font-medium text-gray-700">Calendu00e1rio</span>
        </Link>

        <Link
          to="/time"
          className="flex items-center p-3 rounded-md hover:bg-indigo-50 transition-colors"
        >
          <Clock className="w-4 h-4 mr-2 text-indigo-600" />
          <span className="text-sm font-medium text-gray-700">Tracking</span>
        </Link>
      </div>
    </div>
  );
};

export default PermissionsMenu;
