import { create } from 'zustand';
import { Client } from '../types';
import { mockClients } from '../data/mockData';

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

const useClientStore = create<ClientState>((set, get) => ({
  clients: mockClients,
  currentClient: null,
  isLoading: false,
  error: null,
  
  fetchClients: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // In a real app, you would fetch data from an API
      set({ clients: mockClients, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch clients', isLoading: false });
    }
  },
  
  getClient: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const client = mockClients.find(c => c.id === id) || null;
      set({ currentClient: client, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch client details', isLoading: false });
    }
  },
  
  createClient: async (client) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const newClient: Client = {
        ...client,
        id: `client${mockClients.length + 1}`,
        createdAt: new Date().toISOString()
      };
      
      set(state => ({ 
        clients: [...state.clients, newClient], 
        isLoading: false 
      }));
      
      return true;
    } catch (error) {
      set({ error: 'Failed to create client', isLoading: false });
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        clients: state.clients.filter(client => client.id !== id),
        currentClient: state.currentClient?.id === id ? null : state.currentClient,
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ error: 'Failed to delete client', isLoading: false });
      return false;
    }
  }
}));

export default useClientStore;