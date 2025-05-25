import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import Notifications from '../ui/Notifications';
import PermissionsHelp from '../help/PermissionsHelp';
import useUIStore from '../../store/uiStore';

const MainLayout: React.FC = () => {
  const { isOpen } = useUIStore();
  
  return (
    <div className="flex h-screen bg-gray-50 p-3">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div
        className={`
          flex-1 flex flex-col min-h-screen pt-16 pb-10
          transition-all duration-300 ease-in-out
          ${isOpen ? 'ml-64' : 'ml-20'}
          bg-white rounded-2xl overflow-auto shadow-sm
        `}
      >
        {/* Top Navigation */}
        <Navbar />
        
        {/* Page Content */}
        <main className="flex-1 px-4 py-6 md:px-6 overflow-auto">
          <Outlet />
        </main>
        
        {/* Footer */}
        <Footer />
        
        {/* Notifications */}
        <Notifications />
        
        {/* Ajuda de Permissões */}
        <PermissionsHelp />
      </div>
    </div>
  );
};

export default MainLayout;