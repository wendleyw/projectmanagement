import React, { useState } from 'react';
import { Edit, UserCheck, UserX, Briefcase, CheckSquare, Trash2, Shield, Settings } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import useUserStore from '../../store/userStore';
import useProjectStore from '../../store/projectStore';
import useTaskStore from '../../store/taskStore';
import { User } from '../../store/userStore';
import { formatDate } from '../../utils/dateUtils';
import TeamMemberStats from './TeamMemberStats';
import UserPermissionsForm from './UserPermissionsForm';
import { exportToCSV } from '../../utils/exportUtils';
import { showNotification } from '../../utils/notifications';

interface TeamMemberListProps {
  onEditMember: (member: User) => void;
  onQuickPermissions?: (userId: string) => void;
  isAdmin: boolean;
}

const TeamMemberList: React.FC<TeamMemberListProps> = ({ onEditMember, onQuickPermissions, isAdmin }) => {
  const { users, updateUser, deleteUser } = useUserStore();
  const { projects } = useProjectStore();
  const { tasks } = useTaskStore();
  
  // Estados para filtragem
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Estados para controlar modal e detalhes
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [memberToManagePermissions, setMemberToManagePermissions] = useState<User | null>(null);
  
  // Estado para controlar o modal de confirmação de exclusão
  const [memberToDelete, setMemberToDelete] = useState<User | null>(null);
  
  // Função para alternar a expansão dos detalhes de um membro
  const toggleMemberDetails = (memberId: string) => {
    setExpandedMemberId(expandedMemberId === memberId ? null : memberId);
  };
  
  // Nota: As estatísticas do membro agora são calculadas diretamente no componente TeamMemberStats
  
  // Função para obter os projetos associados a um usuário
  const getUserProjects = (userId: string) => {
    return projects.filter(project => 
      project.team_members && project.team_members.includes(userId)
    );
  };
  
  // Função para obter as tarefas atribuídas a um usuário
  const getUserTasks = (userId: string) => {
    return tasks.filter(task => 
      task.assignee_id === userId
    );
  };
  
  // Função para alternar o status ativo/inativo de um membro
  const toggleMemberStatus = async (member: User) => {
    if (!isAdmin) return;
    
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    await updateUser(member.id, { status: newStatus });
  };
  
  // Função para confirmar exclusão de um membro
  const confirmDeleteMember = (member: User) => {
    setMemberToDelete(member);
  };
  
  // Função para executar a exclusão do membro
  const handleDeleteMember = async (userId?: string) => {
    const idToDelete = userId || (memberToDelete?.id || '');
    if (!idToDelete || !isAdmin) return;
    
    try {
      const success = await deleteUser(idToDelete);
      if (success) {
        const deletedMember = users.find(u => u.id === idToDelete);
        showNotification(`Membro ${deletedMember?.firstName} ${deletedMember?.lastName} excluído com sucesso`, 'success');
      }
    } catch (error) {
      console.error('Erro ao excluir membro:', error);
      showNotification('Erro ao excluir membro', 'error');
    } finally {
      setMemberToDelete(null);
    }
  };
  
  // Função para exportar a lista de membros da equipe em formato CSV
  const handleExportTeam = () => {
    // Filtrar membros de acordo com os filtros atuais
    const filteredMembers = users.filter(member => 
      (roleFilter === 'all' || member.role === roleFilter) && 
      (statusFilter === 'all' || member.status === statusFilter)
    );
    
    // Preparar dados para exportação
    const exportData = filteredMembers.map(member => ({
      Nome: `${member.firstName} ${member.lastName}`,
      Email: member.email,
      Função: member.role === 'admin' ? 'Administrador' : 
              member.role === 'manager' ? 'Gerente' : 
              member.role === 'client' ? 'Cliente' : 'Membro',
      Status: member.status === 'active' ? 'Ativo' : 'Inativo',
      Projetos: getUserProjects(member.id).length,
      Tarefas: getUserTasks(member.id).length,
      DataCadastro: formatDate(member.createdAt)
    }));
    
    // Exportar para CSV
    if (exportData.length > 0) {
      exportToCSV(exportData, `membros_equipe_${new Date().toISOString().split('T')[0]}.csv`);
      showNotification('Lista de membros exportada com sucesso', 'success');
    } else {
      showNotification('Nenhum membro para exportar com os filtros atuais', 'warning');
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Membros da Equipe</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportTeam()}
            title="Exportar lista de membros"
          >
            Exportar CSV
          </Button>
          <select
            className="text-sm border border-gray-300 rounded-md px-2 py-1"
            onChange={(e) => {
              setRoleFilter(e.target.value);
            }}
            value={roleFilter}
          >
            <option value="all">Todas as funções</option>
            <option value="admin">Administradores</option>
            <option value="manager">Gerentes</option>
            <option value="member">Membros</option>
            <option value="client">Clientes</option>
          </select>
          <select
            className="text-sm border border-gray-300 rounded-md px-2 py-1"
            onChange={(e) => {
              setStatusFilter(e.target.value);
            }}
            value={statusFilter}
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
      </div>
      
      <div className="p-0">
        {users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Nenhum membro encontrado.
          </div>
        ) : (
          <div>
            {/* Lista filtrada de membros */}
            {users.filter(member => 
              (roleFilter === 'all' || member.role === roleFilter) && 
              (statusFilter === 'all' || member.status === statusFilter)
            ).length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Nenhum membro corresponde aos filtros selecionados.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {users
                  .filter(member => 
                    (roleFilter === 'all' || member.role === roleFilter) && 
                    (statusFilter === 'all' || member.status === statusFilter)
                  )
                  .map(member => (
                    <li key={member.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            {member.avatarUrl ? (
                              <img 
                                src={member.avatarUrl} 
                                alt={`${member.firstName} ${member.lastName}`} 
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <span className="text-blue-600 font-medium">
                                {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                              </span>
                            )}
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </h3>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {member.status === 'active' ? 'Ativo' : 'Inativo'}
                          </span>
                          
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {member.role === 'admin' ? 'Administrador' : 
                             member.role === 'manager' ? 'Gerente' : 
                             member.role === 'client' ? 'Cliente' : 'Membro'}
                          </span>
                          
                          <button
                            onClick={() => toggleMemberDetails(member.id)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {expandedMemberId === member.id ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              )}
                            </svg>
                          </button>
                          
                          {isAdmin && (
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={member.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                                onClick={() => toggleMemberStatus(member)}
                                title={member.status === 'active' ? 'Desativar membro' : 'Ativar membro'}
                              />
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Shield size={16} />}
                                onClick={() => setMemberToManagePermissions(member)}
                                title="Gerenciar permissões"
                                className="text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50"
                              />
                              
                              {onQuickPermissions && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={<Settings size={16} />}
                                  onClick={() => onQuickPermissions(member.id)}
                                  title="Configurações rápidas de permissões"
                                  className="text-green-500 hover:text-green-700 hover:bg-green-50"
                                />
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Edit size={16} />}
                                onClick={() => onEditMember(member)}
                                title="Editar membro"
                              />
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 size={16} />}
                                onClick={() => confirmDeleteMember(member)}
                                title="Excluir membro"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Detalhes expandidos do membro */}
                      {expandedMemberId === member.id && (
                        <div className="mt-4 pl-14">
                          {/* Estatísticas do membro */}
                          <div className="mb-4">
                            <TeamMemberStats member={member} />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 flex items-center mb-2">
                                <Briefcase size={16} className="mr-1" /> Projetos Atribuídos
                              </h4>
                              
                              <div className="bg-gray-50 p-3 rounded-md">
                                {getUserProjects(member.id).length > 0 ? (
                                  <ul className="space-y-2">
                                    {getUserProjects(member.id).map(project => (
                                      <li key={project.id} className="text-sm">
                                        <a 
                                          href={`/projects/${project.id}`} 
                                          className="text-blue-600 hover:text-blue-800"
                                        >
                                          {project.name}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-500">Nenhum projeto atribuído</p>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 flex items-center mb-2">
                                <CheckSquare size={16} className="mr-1" /> Tarefas Atribuídas
                              </h4>
                              
                              <div className="bg-gray-50 p-3 rounded-md">
                                {getUserTasks(member.id).length > 0 ? (
                                  <ul className="space-y-2">
                                    {getUserTasks(member.id).slice(0, 5).map(task => (
                                      <li key={task.id} className="text-sm">
                                        <a 
                                          href={`/tasks/${task.id}`} 
                                          className="text-blue-600 hover:text-blue-800"
                                        >
                                          {task.title}
                                        </a>
                                        <span className="text-xs text-gray-500 ml-2">
                                          {task.due_date && formatDate(task.due_date)}
                                        </span>
                                      </li>
                                    ))}
                                    {getUserTasks(member.id).length > 5 && (
                                      <li className="text-sm text-gray-500">
                                        + {getUserTasks(member.id).length - 5} mais tarefas
                                      </li>
                                    )}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-500">Nenhuma tarefa atribuída</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3 text-xs text-gray-500">
                            <p>Membro desde: {formatDate(member.createdAt)}</p>
                            {member.lastLogin && (
                              <p>Último acesso: {formatDate(member.lastLogin)}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        )}
      </div>
      
      {/* Modal para confirmar exclusão */}
      <Modal
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="p-4">
          <p className="mb-4 text-gray-700">
            Tem certeza que deseja excluir o membro <strong>{memberToDelete?.firstName} {memberToDelete?.lastName}</strong>?
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setMemberToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDeleteMember(memberToDelete?.id || '')}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de gerenciamento de permissões */}
      <Modal
        isOpen={memberToManagePermissions !== null}
        onClose={() => setMemberToManagePermissions(null)}
        title="Gerenciar Permissões"
        size="lg"
      >
        {memberToManagePermissions && (
          <UserPermissionsForm
            user={memberToManagePermissions}
            onClose={() => setMemberToManagePermissions(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default TeamMemberList;
