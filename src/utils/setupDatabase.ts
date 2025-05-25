import { supabase, isUsingMockSupabase } from '../lib/supabase';
import { mockClients, mockProjects, mockTasks } from '../data/mockData';
import { Client, Project, Task } from '../types';

// Funu00e7u00e3o para converter dados do formato da aplicau00e7u00e3o para o formato do Supabase
const convertClientToSupabase = (client: Client) => ({
  id: client.id,
  name: client.name,
  contact_name: client.contactName,
  email: client.email,
  phone: client.phone,
  address: client.address || null,
  status: client.status,
  created_at: client.createdAt
});

const convertProjectToSupabase = (project: Project) => ({
  id: project.id,
  name: project.name,
  description: project.description,
  client_id: project.clientId,
  start_date: project.startDate,
  end_date: project.endDate,
  actual_end_date: null,
  status: project.status,
  budget: project.budget,
  manager_id: null,
  created_at: project.createdAt,
  updated_at: project.updatedAt
});

const convertTaskToSupabase = (task: Task) => ({
  id: task.id,
  project_id: task.projectId,
  title: task.title,
  description: task.description,
  assignee_id: task.assigneeId,
  priority: task.priority,
  status: task.status,
  created_at: task.createdAt,
  start_date: task.startDate || null,
  due_date: task.dueDate || null,
  estimated_hours: task.estimatedHours || null,
  parent_task_id: task.parentTaskId || null
});


// Funu00e7u00e3o para limpar as tabelas
export const clearTables = async () => {
  if (isUsingMockSupabase) {
    console.warn('Usando Supabase mockado. Nu00e3o u00e9 possu00edvel limpar tabelas.');
    return false;
  }

  try {
    // Limpar tabelas na ordem correta devido u00e0s restriu00e7u00f5es de chave estrangeira
    await supabase.from('tasks').delete().neq('id', '0');
    await supabase.from('projects').delete().neq('id', '0');
    await supabase.from('clients').delete().neq('id', '0');
    // Nu00e3o limpar usuu00e1rios para manter o usuu00e1rio atual logado
    
    console.log('Tabelas limpas com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao limpar tabelas:', error);
    return false;
  }
};

// Funu00e7u00e3o para popular o banco de dados com dados mockados
export const seedDatabase = async () => {
  if (isUsingMockSupabase) {
    console.warn('Usando Supabase mockado. Nu00e3o u00e9 possu00edvel popular o banco de dados.');
    return false;
  }

  try {
    // Inserir clientes
    const { error: clientError } = await supabase
      .from('clients')
      .insert(mockClients.map(convertClientToSupabase));
    
    if (clientError) throw clientError;
    console.log('Clientes inseridos com sucesso');

    // Inserir projetos
    const { error: projectError } = await supabase
      .from('projects')
      .insert(mockProjects.map(convertProjectToSupabase));
    
    if (projectError) throw projectError;
    console.log('Projetos inseridos com sucesso');

    // Inserir tarefas
    const { error: taskError } = await supabase
      .from('tasks')
      .insert(mockTasks.map(convertTaskToSupabase));
    
    if (taskError) throw taskError;
    console.log('Tarefas inseridas com sucesso');

    // Inserir usuu00e1rios (opcional, geralmente os usuu00e1rios su00e3o criados pelo sistema de autenticau00e7u00e3o)
    // const { error: userError } = await supabase
    //   .from('users')
    //   .insert(mockUsers.map(convertUserToSupabase));
    
    // if (userError) throw userError;
    // console.log('Usuu00e1rios inseridos com sucesso');

    return true;
  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
    return false;
  }
};

// Funu00e7u00e3o para testar a conexu00e3o com o Supabase
export const testConnection = async () => {
  if (isUsingMockSupabase) {
    console.warn('Usando Supabase mockado. Nu00e3o u00e9 possu00edvel testar a conexu00e3o real.');
    return {
      success: false,
      message: 'Usando Supabase mockado. Configure as variu00e1veis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
    };
  }

  try {
    const { data, error } = await supabase.from('clients').select('count').single();
    
    if (error) throw error;
    
    return {
      success: true,
      message: 'Conexu00e3o com o Supabase estabelecida com sucesso!',
      data
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Erro ao conectar com o Supabase: ${error.message}`,
      error
    };
  }
};

// Funu00e7u00e3o para configurar o ambiente de desenvolvimento
export const setupDevEnvironment = async () => {
  // Testar conexu00e3o
  const connectionTest = await testConnection();
  console.log(connectionTest.message);
  
  if (!connectionTest.success) {
    return connectionTest;
  }
  
  // Perguntar se deseja limpar e popular o banco de dados
  const confirmClear = window.confirm('Deseja limpar as tabelas existentes?');
  
  if (confirmClear) {
    const cleared = await clearTables();
    if (!cleared) {
      return {
        success: false,
        message: 'Falha ao limpar as tabelas.'
      };
    }
  }
  
  const confirmSeed = window.confirm('Deseja popular o banco de dados com dados mockados?');
  
  if (confirmSeed) {
    const seeded = await seedDatabase();
    if (!seeded) {
      return {
        success: false,
        message: 'Falha ao popular o banco de dados.'
      };
    }
  }
  
  return {
    success: true,
    message: 'Ambiente de desenvolvimento configurado com sucesso!'
  };
};
