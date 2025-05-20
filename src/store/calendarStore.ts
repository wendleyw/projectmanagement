import { create } from 'zustand';
import { CalendarEvent } from '../types';
import { mockCalendarEvents } from '../data/mockData';

interface CalendarState {
  events: CalendarEvent[];
  userEvents: CalendarEvent[];
  projectEvents: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  
  fetchEvents: () => Promise<void>;
  fetchUserEvents: (userId: string) => Promise<void>;
  fetchProjectEvents: (projectId: string) => Promise<void>;
  createEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<boolean>;
  updateEvent: (id: string, eventData: Partial<CalendarEvent>) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
}

const useCalendarStore = create<CalendarState>((set, get) => ({
  events: mockCalendarEvents,
  userEvents: [],
  projectEvents: [],
  isLoading: false,
  error: null,
  
  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({ events: mockCalendarEvents, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch calendar events', isLoading: false });
    }
  },
  
  fetchUserEvents: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const filteredEvents = mockCalendarEvents.filter(event => event.userId === userId);
      set({ userEvents: filteredEvents, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch user events', isLoading: false });
    }
  },
  
  fetchProjectEvents: async (projectId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const filteredEvents = mockCalendarEvents.filter(event => event.projectId === projectId);
      set({ projectEvents: filteredEvents, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch project events', isLoading: false });
    }
  },
  
  createEvent: async (event) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const newEvent: CalendarEvent = {
        ...event,
        id: `event${mockCalendarEvents.length + 1}`
      };
      
      set(state => ({ 
        events: [...state.events, newEvent],
        userEvents: event.userId === state.userEvents[0]?.userId 
          ? [...state.userEvents, newEvent] 
          : state.userEvents,
        projectEvents: event.projectId === state.projectEvents[0]?.projectId 
          ? [...state.projectEvents, newEvent] 
          : state.projectEvents,
        isLoading: false 
      }));
      
      return true;
    } catch (error) {
      set({ error: 'Failed to create event', isLoading: false });
      return false;
    }
  },
  
  updateEvent: async (id, eventData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        events: state.events.map(event => 
          event.id === id ? { ...event, ...eventData } : event
        ),
        userEvents: state.userEvents.map(event => 
          event.id === id ? { ...event, ...eventData } : event
        ),
        projectEvents: state.projectEvents.map(event => 
          event.id === id ? { ...event, ...eventData } : event
        ),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ error: 'Failed to update event', isLoading: false });
      return false;
    }
  },
  
  deleteEvent: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        events: state.events.filter(event => event.id !== id),
        userEvents: state.userEvents.filter(event => event.id !== id),
        projectEvents: state.projectEvents.filter(event => event.id !== id),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ error: 'Failed to delete event', isLoading: false });
      return false;
    }
  }
}));

export default useCalendarStore;