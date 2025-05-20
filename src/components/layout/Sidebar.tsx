import React from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  Calendar,
  Clock,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  UserCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';

const Sidebar: React.FC = () => {
  const { isOpen, toggleSidebar, activeItem, setActiveItem } = useUIStore();
  const { user, logout } = useAuthStore();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { id: 'clients', label: 'Clients', icon: <Users size={20} />, path: '/clients' },
    { id: 'projects', label: 'Projects', icon: <Briefcase size={20} />, path: '/projects' },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={20} />, path: '/tasks' },
    { id: 'calendar', label: 'Calendar', icon: <Calendar size={20} />, path: '/calendar' },
    { id: 'timetracking', label: 'Time Tracking', icon: <Clock size={20} />, path: '/time' },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];
  
  const handleMenuClick = (itemId: string) => {
    setActiveItem(itemId);
  };

  return (
    <aside 
      className={`
        fixed top-0 left-0 z-40 h-screen 
        bg-gray-800 text-white transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : 'w-20'}
      `}
    >
      <div className="h-full flex flex-col justify-between">
        <div>
          {/* Logo and Toggle */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-700">
            {isOpen ? (
              <h1 className="text-xl font-bold text-white">SGP System</h1>
            ) : (
              <h1 className="text-xl font-bold text-white">SGP</h1>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? <ChevronsLeft size={20} /> : <ChevronsRight size={20} />}
            </button>
          </div>

          {/* User Profile */}
          <div className="px-4 py-4 border-b border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {user?.avatar ? (
                  <img
                    className="h-10 w-10 rounded-full"
                    src={user.avatar}
                    alt={`${user.firstName} ${user.lastName}`}
                  />
                ) : (
                  <UserCircle className="h-10 w-10 text-gray-400" />
                )}
              </div>
              {isOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium">{`${user?.firstName} ${user?.lastName}`}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                </div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <nav className="mt-4 px-2 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`
                  flex items-center px-4 py-3 rounded-md transition-colors
                  ${activeItem === item.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                `}
                onClick={() => handleMenuClick(item.id)}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {isOpen && <span className="ml-3">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="px-2 pb-5">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            {isOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;