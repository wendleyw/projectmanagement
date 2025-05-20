import { create } from 'zustand';
import { AuthState, User } from '../types';
import { currentUser } from '../data/mockData';

// For demo purposes, we're using mock data
// In a real application, you would implement authentication with JWT and backend services
const useAuthStore = create<AuthState>((set) => ({
  user: currentUser,
  token: 'mock-jwt-token',
  isAuthenticated: true, // Auto-logged in for demo
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would validate credentials with an API
      if (email === 'john.doe@example.com' && password === 'password') {
        set({ 
          isAuthenticated: true,
          user: currentUser,
          token: 'mock-jwt-token',
          isLoading: false
        });
        return true;
      } else {
        set({ 
          error: 'Invalid email or password', 
          isLoading: false 
        });
        return false;
      }
    } catch (error) {
      set({ 
        error: 'An error occurred during login', 
        isLoading: false 
      });
      return false;
    }
  },

  logout: () => {
    set({ 
      isAuthenticated: false,
      user: null,
      token: null
    });
  },

  updateUser: (userData: Partial<User>) => {
    set(state => ({
      user: state.user ? { ...state.user, ...userData } : null
    }));
  }
}));

export default useAuthStore;