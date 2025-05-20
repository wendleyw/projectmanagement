import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import useUIStore from '../../store/uiStore';

const MainLayout: React.FC = () => {
  const { isOpen } = useUIStore();
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div
        className={`
          flex-1 flex flex-col min-h-screen pt-16 pb-10
          transition-all duration-300 ease-in-out
          ${isOpen ? 'ml-64' : 'ml-20'}
        `}
      >
        {/* Top Navigation */}
        <Navbar />
        
        {/* Page Content */}
        <main className="flex-1 px-4 py-6 md:px-6">
          <Outlet />
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;