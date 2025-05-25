/**
 * Utilitário para testar o acesso de usuários com diferentes perfis
 * Isso permite verificar se as restrições de acesso estão funcionando corretamente
 */

import useAuthStore from '../store/authStore';
import { User } from '../types';

/**
 * Simula o login de um usuário com um papel específico para testar restrições de acesso
 * @param role Papel do usuário ('admin', 'manager', 'member')
 * @returns Uma função para reverter para o usuário original
 */
export const simulateUserAccess = (role: 'admin' | 'manager' | 'member') => {
  // Armazena o usuário atual antes da simulação
  const authStore = useAuthStore.getState();
  const originalUser = authStore.user;
  
  // Cria um usuário de teste com o papel especificado
  const testUser: User = {
    id: 'test-user-id',
    email: `test-${role}@example.com`,
    first_name: 'Test',
    last_name: role.charAt(0).toUpperCase() + role.slice(1),
    role: role,
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Aplica o usuário de teste
  authStore.setUser(testUser);
  
  // Define permissões específicas com base no papel
  if (role === 'member') {
    // Carrega permissões específicas para membros
    // Normalmente, isso seria feito pelo loadUserPermissions
    // Mas para testes, podemos definir manualmente
    authStore.loadUserPermissions();
  }
  
  console.log(`Simulando acesso como ${role}:`, testUser);
  
  // Retorna uma função para reverter para o usuário original
  return () => {
    authStore.setUser(originalUser);
    console.log('Restaurado usuário original:', originalUser);
  };
};

/**
 * Executa um teste de acesso para verificar se as restrições funcionam corretamente
 */
export const testMemberAccess = () => {
  // Simula login como membro
  const restoreUser = simulateUserAccess('member');
  
  // Registra informações sobre os projetos e tarefas visíveis
  setTimeout(() => {
    const { userProjects, userTasks } = useAuthStore.getState();
    console.log('Projetos visíveis para membro:', userProjects.length);
    console.log('Tarefas visíveis para membro:', userTasks.length);
    
    // Restaura o usuário original após o teste
    restoreUser();
  }, 1000);
};
