import { create } from 'zustand';
import { SidebarState } from '../types';

interface UIStore extends SidebarState {
  toggleSidebar: () => void;
  setActiveItem: (item: string) => void;
  closeSidebar: () => void;
}

const useUIStore = create<UIStore>((set) => ({
  isOpen: true,
  activeItem: 'dashboard',

  toggleSidebar: () => set(state => ({ isOpen: !state.isOpen })),
  setActiveItem: (item: string) => set({ activeItem: item }),
  closeSidebar: () => set({ isOpen: false })
}));

export default useUIStore;