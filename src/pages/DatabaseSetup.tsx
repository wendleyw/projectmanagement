import React, { useState } from 'react';
import { ArrowLeft, Database, RefreshCw, Trash2, Upload, Check, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import { testConnection, clearTables, seedDatabase } from '../utils/setupDatabase';
import { isUsingMockSupabase } from '../lib/supabase';

interface StatusMessage {
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
}

const DatabaseSetup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);

  const addStatusMessage = (message: StatusMessage) => {
    setStatusMessages(prev => [...prev, message]);
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    addStatusMessage({ type: 'info', message: 'Testing connection with Supabase...' });

    try {
      const result = await testConnection();
      
      if (result.success) {
        addStatusMessage({ type: 'success', message: result.message });
      } else {
        addStatusMessage({ type: 'error', message: result.message });
      }
    } catch (error: any) {
      addStatusMessage({ 
        type: 'error', 
        message: `Error testing connection: ${error.message || 'Unknown error'}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearTables = async () => {
    if (!window.confirm('Are you sure you want to clear all tables? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    addStatusMessage({ type: 'info', message: 'Clearing tables...' });

    try {
      const success = await clearTables();
      
      if (success) {
        addStatusMessage({ type: 'success', message: 'Tabelas limpas com sucesso!' });
      } else {
        addStatusMessage({ type: 'error', message: 'Falha ao limpar tabelas.' });
      }
    } catch (error: any) {
      addStatusMessage({ 
        type: 'error', 
        message: `Erro ao limpar tabelas: ${error.message || 'Erro desconhecido'}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    if (!window.confirm('Tem certeza que deseja popular o banco de dados com dados mockados?')) {
      return;
    }

    setIsLoading(true);
    addStatusMessage({ type: 'info', message: 'Populando banco de dados...' });

    try {
      const success = await seedDatabase();
      
      if (success) {
        addStatusMessage({ type: 'success', message: 'Banco de dados populado com sucesso!' });
      } else {
        addStatusMessage({ type: 'error', message: 'Falha ao popular banco de dados.' });
      }
    } catch (error: any) {
      addStatusMessage({ 
        type: 'error', 
        message: `Erro ao popular banco de dados: ${error.message || 'Erro desconhecido'}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (type: StatusMessage['type']) => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <Database className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="pb-12">
      <PageHeader 
        title="Database Setup" 
        subtitle="Manage Supabase connection and configure your development environment."
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Database Setup' },
        ]}
        actions={
          <Link to="/">
            <Button 
              variant="outline" 
              icon={<ArrowLeft size={16} />}
            >
              Voltar para Dashboard
            </Button>
          </Link>
        }
      />

      {isUsingMockSupabase && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Atenção:</strong> Você está usando um ambiente mockado do Supabase. Para conectar a um banco de dados real, configure as variáveis de ambiente <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Database className="mr-2 h-5 w-5 text-blue-500" />
            Testar Conexão
          </h3>
          <p className="text-gray-600 mb-4">
            Verifique se a aplicação consegue se conectar ao banco de dados Supabase.
          </p>
          <Button
            variant="primary"
            icon={<RefreshCw size={16} />}
            onClick={handleTestConnection}
            disabled={isLoading}
            className="w-full"
          >
            Testar Conexão
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Trash2 className="mr-2 h-5 w-5 text-red-500" />
            Limpar Tabelas
          </h3>
          <p className="text-gray-600 mb-4">
            Remove todos os dados das tabelas. Esta ação não pode ser desfeita.
          </p>
          <Button
            variant="danger"
            icon={<Trash2 size={16} />}
            onClick={handleClearTables}
            disabled={isLoading || isUsingMockSupabase}
            className="w-full"
          >
            Limpar Tabelas
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Upload className="mr-2 h-5 w-5 text-green-500" />
            Popular Banco de Dados
          </h3>
          <p className="text-gray-600 mb-4">
            Popula o banco de dados com dados mockados para testes e desenvolvimento.
          </p>
          <Button
            variant="success"
            icon={<Upload size={16} />}
            onClick={handleSeedDatabase}
            disabled={isLoading || isUsingMockSupabase}
            className="w-full"
          >
            Popular Banco de Dados
          </Button>
        </div>
      </div>

      {statusMessages.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Log de Operações</h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto p-2">
            {statusMessages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex items-start p-3 rounded-md ${msg.type === 'success' ? 'bg-green-50' : msg.type === 'error' ? 'bg-red-50' : msg.type === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'}`}
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(msg.type)}
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${msg.type === 'success' ? 'text-green-700' : msg.type === 'error' ? 'text-red-700' : msg.type === 'warning' ? 'text-yellow-700' : 'text-blue-700'}`}>
                    {msg.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Instruções para Configuração</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">1. Configurar Variáveis de Ambiente</h4>
            <p className="text-gray-600 mb-2">
              Crie um arquivo <code>.env.local</code> na raiz do projeto com as seguintes variáveis:
            </p>
            <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
              <code>
                VITE_SUPABASE_URL=sua_url_do_supabase<br />
                VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
              </code>
            </pre>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">2. Criar Tabelas no Supabase</h4>
            <p className="text-gray-600 mb-2">
              Execute os seguintes scripts SQL no Editor SQL do Supabase para criar as tabelas necessárias:
            </p>
            <div className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
              <details>
                <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-800">Ver SQL para criar tabelas</summary>
                <pre className="mt-2">
                  <code>
{`-- Tabela de clientes
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de projetos
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  actual_end_date DATE,
  status TEXT NOT NULL CHECK (status IN ('planned', 'in-progress', 'completed', 'on-hold', 'cancelled')),
  budget NUMERIC,
  manager_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tarefas
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  assignee_id UUID,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'review', 'completed', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  start_date DATE,
  due_date DATE,
  estimated_hours NUMERIC,
  parent_task_id UUID REFERENCES public.tasks(id)
);`}
                  </code>
                </pre>
              </details>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">3. Testar e Popular o Banco de Dados</h4>
            <p className="text-gray-600">
              Use os botões acima para testar a conexão com o Supabase e popular o banco de dados com dados mockados para desenvolvimento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSetup;
