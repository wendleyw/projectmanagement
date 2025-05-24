import { create } from 'zustand';
import { Client } from '../types';
import { mockClients } from '../data/mockData';
import { supabase, isUsingMockSupabase } from '../lib/supabase';
import useNotificationStore from './notificationStore';

interface ClientState {
  clients: Client[];
  currentClient: Client | null;
  isLoading: boolean;
  error: string | null;
  
  fetchClients: () => Promise<void>;
  getClient: (id: string) => Promise<void>;
  createClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<boolean>;
  updateClient: (id: string, clientData: Partial<Client>) => Promise<boolean>;
  deleteClient: (id: string) => Promise<boolean>;
}

// Funu00e7u00e3o auxiliar para acessar o store de notificau00e7u00f5es
// Nu00e3o podemos usar hooks diretamente em stores Zustand
const getNotificationStore = () => useNotificationStore.getState();

const useClientStore = create<ClientState>((set) => ({
  clients: mockClients,
  currentClient: null,
  isLoading: false,
  error: null,
  
  fetchClients: async () => {
    set({ isLoading: true, error: null });
    
    try {
      if (isUsingMockSupabase) {
        // Usar dados mockados quando não há conexão com o Supabase
        await new Promise(resolve => setTimeout(resolve, 400)); // Simular atraso
        set({ clients: mockClients, isLoading: false });
        return;
      }
      
      // Buscar clientes do Supabase
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Converter dados do formato do Supabase para o formato da aplicação
      const clients: Client[] = data.map(item => ({
        id: item.id,
        name: item.name,
        contactName: item.contact_name,
        email: item.email,
        phone: item.phone,
        address: item.address ? item.address : undefined,
        status: item.status as 'active' | 'inactive',
        createdAt: item.created_at || new Date().toISOString()
      }));
      
      set({ clients, isLoading: false });
    } catch (error: any) {
      const errorMessage = `Falha ao buscar clientes: ${error.message || 'Erro desconhecido'}`;
      set({ error: errorMessage, isLoading: false });
      
      // Exibir notificação de erro
      getNotificationStore().addNotification({
        type: 'error',
        message: errorMessage
      });
    }
  },
  
  getClient: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      if (isUsingMockSupabase) {
        // Usar dados mockados quando não há conexão com o Supabase
        await new Promise(resolve => setTimeout(resolve, 300)); // Simular atraso
        const client = mockClients.find(c => c.id === id) || null;
        set({ currentClient: client, isLoading: false });
        return;
      }
      
      // Buscar cliente do Supabase
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Cliente não encontrado');
      
      // Converter dados do formato do Supabase para o formato da aplicação
      const client: Client = {
        id: data.id,
        name: data.name,
        contactName: data.contact_name,
        email: data.email,
        phone: data.phone,
        address: data.address ? data.address : undefined,
        status: data.status as 'active' | 'inactive',
        createdAt: data.created_at || new Date().toISOString()
      };
      
      set({ currentClient: client, isLoading: false });
    } catch (error: any) {
      const errorMessage = `Falha ao buscar detalhes do cliente: ${error.message || 'Erro desconhecido'}`;
      set({ error: errorMessage, isLoading: false, currentClient: null });
      
      // Exibir notificação de erro
      getNotificationStore().addNotification({
        type: 'error',
        message: errorMessage
      });
    }
  },
  
  createClient: async (client) => {
    set({ isLoading: true, error: null });
    
    try {
      if (isUsingMockSupabase) {
        // Usar dados mockados quando não há conexão com o Supabase
        await new Promise(resolve => setTimeout(resolve, 600)); // Simular atraso
        
        const newClient: Client = {
          ...client,
          id: `client${mockClients.length + 1}`,
          createdAt: new Date().toISOString()
        };
        
        set(state => ({ 
          clients: [...state.clients, newClient], 
          isLoading: false 
        }));
        
        // Exibir notificação de sucesso
        getNotificationStore().addNotification({
          type: 'success',
          message: `Cliente ${client.name} criado com sucesso!`
        });
        
        return true;
      }
      
      // Converter dados do formato da aplicação para o formato do Supabase
      const clientData = {
        name: client.name,
        contact_name: client.contactName,
        email: client.email,
        phone: client.phone,
        address: client.address || null,
        status: client.status
      };
      
      // Inserir cliente no Supabase
      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Falha ao criar cliente: Nenhum dado retornado');
      
      // Converter dados do formato do Supabase para o formato da aplicação
      const newClient: Client = {
        id: data.id,
        name: data.name,
        contactName: data.contact_name,
        email: data.email,
        phone: data.phone,
        address: data.address ? data.address : undefined,
        status: data.status as 'active' | 'inactive',
        createdAt: data.created_at || new Date().toISOString()
      };
      
      set(state => ({ 
        clients: [...state.clients, newClient], 
        isLoading: false 
      }));
      
      // Exibir notificação de sucesso
      getNotificationStore().addNotification({
        type: 'success',
        message: `Cliente ${client.name} criado com sucesso!`
      });
      
      return true;
    } catch (error: any) {
      const errorMessage = `Falha ao criar cliente: ${error.message || 'Erro desconhecido'}`;
      set({ error: errorMessage, isLoading: false });
      
      // Exibir notificação de erro
      getNotificationStore().addNotification({
        type: 'error',
        message: errorMessage
      });
      
      return false;
    }
  },
  
  updateClient: async (id, clientData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        clients: state.clients.map(client => 
          client.id === id ? { ...client, ...clientData } : client
        ),
        currentClient: state.currentClient?.id === id 
          ? { ...state.currentClient, ...clientData } 
          : state.currentClient,
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ error: 'Failed to update client', isLoading: false });
      return false;
    }
  },
  
  deleteClient: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      if (isUsingMockSupabase) {
        // Simulate API call delay for mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        set(state => ({
          clients: state.clients.filter(client => client.id !== id),
          currentClient: state.currentClient?.id === id ? null : state.currentClient,
          isLoading: false
        }));
        
        return true;
      }
      
      // Delete client from Supabase
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      set(state => ({
        clients: state.clients.filter(client => client.id !== id),
        currentClient: state.currentClient?.id === id ? null : state.currentClient,
        isLoading: false
      }));
      
      // Show success notification
      getNotificationStore().addNotification({
        type: 'success',
        message: 'Client deleted successfully'
      });
      
      return true;
    } catch (error: any) {
      const errorMessage = `Failed to delete client: ${error.message || 'Unknown error'}`;
      set({ error: errorMessage, isLoading: false });
      
      // Show error notification
      getNotificationStore().addNotification({
        type: 'error',
        message: errorMessage
      });
      
      return false;
    }
  }
}));

export default useClientStore;