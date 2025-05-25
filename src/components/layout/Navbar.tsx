import React, { useState } from 'react';
import { Bell, Mail, Search, Menu } from 'lucide-react';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';

const Navbar: React.FC = () => {
  const { isOpen, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState(3); // Mock notification count
  const [messages, setMessages] = useState(2); // Mock messages count

  return (
    <header 
      className={`
        fixed top-0 right-0 z-30 h-16 bg-white border-b border-gray-100 shadow-sm
        transition-all duration-300 ease-in-out flex items-center
        ${isOpen ? 'left-64' : 'left-20'}
      `}
    >
      <div className="w-full px-6 flex items-center justify-between">
        <div className="flex items-center">
          {/* Mobile menu button - only visible on small screens */}
          <button 
            className="mr-4 p-1.5 rounded-lg text-gray-500 lg:hidden hover:bg-gray-100 focus:outline-none transition-colors duration-200" 
            onClick={toggleSidebar}
          >
            <Menu size={22} />
          </button>
          
          {/* Search Bar */}
          <div className="relative max-w-md w-full hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-blue-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
              placeholder="Search..."
            />
          </div>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center space-x-5">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200">
            <Bell size={20} />
            {notifications > 0 && (
              <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center transform -translate-y-1 translate-x-1 shadow-sm border border-white">
                {notifications}
              </span>
            )}
          </button>

          {/* Messages */}
          <button className="relative p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200">
            <Mail size={20} />
            {messages > 0 && (
              <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-medium flex items-center justify-center transform -translate-y-1 translate-x-1 shadow-sm border border-white">
                {messages}
              </span>
            )}
          </button>

          {/* User Profile Picture */}
          <div className="relative">
            <button className="flex items-center space-x-2 rounded-lg py-1 px-1 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200">
              {user?.avatar ? (
                <img
                  className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-sm"
                  src={user.avatar}
                  alt={`${user?.firstName || 'User'} ${user?.lastName || ''}`}
                />
              ) : (
                <span className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold shadow-sm border-2 border-white">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName[0]}${user.lastName[0]}`
                    : user?.email
                      ? user.email[0].toUpperCase()
                      : 'U'}
                </span>
              )}
              <span className="text-sm font-medium text-gray-700 hidden md:block">
                {user?.firstName || 'User'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;