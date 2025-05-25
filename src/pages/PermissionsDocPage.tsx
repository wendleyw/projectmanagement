import React from 'react';
import { Shield, Book, CheckCircle } from 'lucide-react';
import { useIsAdmin } from '../store/authStore';
import { Navigate, Link } from 'react-router-dom';
import TutorialButton from '../components/help/TutorialButton';

const PermissionsDocPage: React.FC = () => {
  const isAdmin = useIsAdmin();
  
  // Apenas administradores podem acessar esta página
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Shield className="w-6 h-6 text-indigo-600 mr-2" />
        <h1 className="text-2xl font-bold text-gray-900">Documentação do Sistema de Permissões</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="prose prose-indigo max-w-none">
          <h2>Introdução</h2>
          <p>
            O sistema de permissões foi projetado para permitir um controle granular sobre o que cada membro da equipe pode ver e fazer no aplicativo de gerenciamento de projetos. Este documento explica como utilizar o sistema e suas principais funcionalidades.
          </p>
          
          <h2>Funções de Usuário</h2>
          <p>O sistema suporta três funções principais:</p>
          <ul>
            <li><strong>Administrador</strong>: Acesso completo a todas as funcionalidades do sistema</li>
            <li><strong>Gerente</strong>: Pode gerenciar projetos e tarefas atribuídas a ele</li>
            <li><strong>Membro</strong>: Acesso limitado apenas aos recursos atribuídos diretamente</li>
          </ul>
          
          <h2>Componentes Principais</h2>
          
          <h3>1. PermissionGuard</h3>
          <p>O componente <code>PermissionGuard</code> protege rotas e componentes com base nas permissões do usuário.</p>
          <pre className="bg-gray-100 p-4 rounded-md">
            <code>{`<PermissionGuard
  requiredPermission="project" // ou "task", "calendar", "tracking"
  action="view" // ou "edit", "manage_members"
  resourceId="id-opcional-do-recurso"
  fallbackPath="/dashboard"
>
  {/* Conteúdo protegido */}
</PermissionGuard>`}</code>
          </pre>
          
          <h3>2. PermissionFilter</h3>
          <p>O componente <code>PermissionFilter</code> filtra dados (projetos, tarefas, etc.) com base nas permissões do usuário.</p>
          <pre className="bg-gray-100 p-4 rounded-md">
            <code>{`<PermissionFilter
  resourceType="projects" // ou "tasks", "calendar", "tracking"
  data={arrayDeDados}
  action="view" // ou "edit", "manage_members"
>
  {(filteredData) => (
    // Renderizar os dados filtrados
  )}
</PermissionFilter>`}</code>
          </pre>
          
          <h3>3. Hooks Personalizados</h3>
          <p>O sistema inclui os seguintes hooks para verificar permissões:</p>
          <ul>
            <li><strong>usePermissions</strong>: Verificações gerais de permissões</li>
            <li><strong>useProjectAccess</strong>: Gerencia acesso a projetos</li>
            <li><strong>useTaskAccess</strong>: Gerencia acesso a tarefas</li>
            <li><strong>useCalendarAccess</strong>: Gerencia acesso ao calendário</li>
            <li><strong>useTrackingAccess</strong>: Gerencia acesso ao sistema de tracking</li>
          </ul>
          
          <h2>Gerenciando Permissões de Usuário</h2>
          <p>As permissões dos usuários podem ser gerenciadas através do formulário de permissões na página de Equipe.</p>
          
          <h3>Atribuindo Permissões</h3>
          <ol>
            <li>Acesse a página de Equipe</li>
            <li>Selecione um usuário</li>
            <li>Atribua projetos e tarefas específicas</li>
            <li>Configure acesso ao calendário e tracking</li>
            <li>Salve as alterações</li>
          </ol>
          
          <h2>Exemplos de Uso</h2>
          
          <h3>Verificando Permissões em Código</h3>
          <pre className="bg-gray-100 p-4 rounded-md">
            <code>{`const { hasPermission, hasRole } = usePermissions();

// Verificar se o usuário é administrador
if (hasRole('admin')) {
  // Código para administradores
}

// Verificar permissões específicas
if (hasPermission('project', 'edit', { id: projectId })) {
  // Permitir edição do projeto
}`}</code>
          </pre>
          
          <h3>Filtrando Projetos por Permissões</h3>
          <pre className="bg-gray-100 p-4 rounded-md">
            <code>{`const { userProjects, managedProjects } = useProjectAccess();

// userProjects contém todos os projetos que o usuário tem acesso
// managedProjects contém apenas os projetos que o usuário gerencia`}</code>
          </pre>
          
          <h3>Verificando Acesso a Tarefas</h3>
          <pre className="bg-gray-100 p-4 rounded-md">
            <code>{`const { hasTaskAccess, canEditTask } = useTaskAccess();

// Verificar se o usuário pode acessar uma tarefa
if (hasTaskAccess(taskId)) {
  // Mostrar detalhes da tarefa
}

// Verificar se o usuário pode editar uma tarefa
if (canEditTask(taskId)) {
  // Mostrar botões de edição
}`}</code>
          </pre>
          
          <h2>Políticas de Segurança no Banco de Dados</h2>
          <p>O sistema utiliza políticas de segurança em nível de linha (RLS) no Supabase para garantir que os usuários só possam acessar os dados aos quais têm permissão.</p>
        </div>
        
        <div className="mt-8 flex justify-between flex-wrap gap-3">
          <Link to="/dashboard" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            <Book className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Link>
          
          <div className="flex gap-3">
            <TutorialButton />
            
            <Link to="/permissions-example" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Ver Demonstração
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsDocPage;
