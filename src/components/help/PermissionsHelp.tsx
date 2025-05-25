import React, { useState } from 'react';
import { HelpCircle, X, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsAdmin } from '../../store/authStore';

/**
 * Componente de ajuda rápida para o sistema de permissões
 * Pode ser acessado de qualquer lugar na aplicação
 */
const PermissionsHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = useIsAdmin();

  const toggleHelp = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botão de ajuda */}
      <button
        onClick={toggleHelp}
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
        aria-label="Ajuda sobre permissões"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* Painel de ajuda */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-indigo-50">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-indigo-600 mr-2" />
              <h3 className="font-medium text-gray-800">Ajuda de Permissões</h3>
            </div>
            <button
              onClick={toggleHelp}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Fechar ajuda"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 text-sm">
            <p className="mb-3">
              O sistema de permissões controla o que você pode ver e fazer na aplicação com base na sua função e permissões atribuídas.
            </p>

            <h4 className="font-medium text-gray-800 mb-2">Funções de Usuário:</h4>
            <ul className="mb-3 space-y-1 pl-5 list-disc">
              <li><strong>Administrador:</strong> Acesso completo</li>
              <li><strong>Gerente:</strong> Gerencia projetos atribuídos</li>
              <li><strong>Membro:</strong> Acesso apenas ao que foi atribuído</li>
            </ul>

            <h4 className="font-medium text-gray-800 mb-2">Recursos Protegidos:</h4>
            <ul className="mb-3 space-y-1 pl-5 list-disc">
              <li><strong>Projetos:</strong> Visualização e edição</li>
              <li><strong>Tarefas:</strong> Visualização e edição</li>
              <li><strong>Calendário:</strong> Eventos e agendamentos</li>
              <li><strong>Tracking:</strong> Registros de tempo</li>
            </ul>

            {isAdmin && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <Link
                  to="/permissions-docs"
                  className="flex items-center justify-between text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <span>Ver documentação completa</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionsHelp;
