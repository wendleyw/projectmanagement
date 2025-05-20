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
        fixed top-0 right-0 z-30 h-16 bg-white border-b border-gray-200
        transition-all duration-300 ease-in-out flex items-center
        ${isOpen ? 'left-64' : 'left-20'}
      `}
    >
      <div className="w-full px-4 flex items-center justify-between">
        <div className="flex items-center">
          {/* Mobile menu button - only visible on small screens */}
          <button 
            className="mr-4 p-1 rounded-md text-gray-500 lg:hidden hover:bg-gray-100 focus:outline-none" 
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>
          
          {/* Search Bar */}
          <div className="relative max-w-md w-full hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="Search..."
            />
          </div>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Bell size={22} />
            {notifications > 0 && (
              <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center transform -translate-y-1 translate-x-1">
                {notifications}
              </span>
            )}
          </button>

          {/* Messages */}
          <button className="relative p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Mail size={22} />
            {messages > 0 && (
              <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center transform -translate-y-1 translate-x-1">
                {messages}
              </span>
            )}
          </button>

          {/* User Profile Picture */}
          <div className="relative">
            <button className="flex rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {user?.avatar ? (
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                />
              ) : (
                <span className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                  {`${user?.firstName?.[0]}${user?.lastName?.[0]}`}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;