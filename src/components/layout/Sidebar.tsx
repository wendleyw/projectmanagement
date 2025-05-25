import React, { useMemo } from 'react';
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
  ChevronsRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import useUserStore from '../../store/userStore';

const Sidebar: React.FC = () => {
  const { isOpen, toggleSidebar, activeItem, setActiveItem } = useUIStore();
  const { user, signOut } = useAuthStore();
  const { currentUser, hasCalendarAccess, hasTrackingAccess } = useUserStore();
  
  // Complete list of menu items
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/', requiredPermission: null },
    { id: 'clients', label: 'Clients', icon: <Users size={20} />, path: '/clients', requiredPermission: 'admin' },
    { id: 'projects', label: 'Projects', icon: <Briefcase size={20} />, path: '/projects', requiredPermission: 'admin_or_manager' },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={20} />, path: '/tasks', requiredPermission: 'member' },
    { id: 'team', label: 'Team', icon: <Users size={20} />, path: '/team', requiredPermission: 'admin' },
    { id: 'calendar', label: 'Calendar', icon: <Calendar size={20} />, path: '/calendar', requiredPermission: 'calendar' },
    { id: 'timetracking', label: 'Time Tracking', icon: <Clock size={20} />, path: '/time', requiredPermission: 'tracking' },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '/settings', requiredPermission: 'admin' },
  ];
  
  // Filter menu items based on user permissions
  const menuItems = useMemo(() => {
    if (!currentUser) return allMenuItems.filter(item => item.requiredPermission === null);
    
    // Administrators have access to everything
    if (currentUser.role === 'admin') return allMenuItems;
    
    // Managers have access to projects and tasks
    if (currentUser.role === 'manager') {
      return allMenuItems.filter(item => {
        if (item.requiredPermission === null) return true;
        if (item.requiredPermission === 'admin') return false;
        if (item.requiredPermission === 'admin_or_manager') return true;
        if (item.requiredPermission === 'member') return true;
        if (item.requiredPermission === 'calendar') return hasCalendarAccess(currentUser.id);
        if (item.requiredPermission === 'tracking') return hasTrackingAccess(currentUser.id);
        return false;
      });
    }
    
    // Members only have access to tasks and dashboard
    if (currentUser.role === 'member') {
      return allMenuItems.filter(item => {
        if (item.requiredPermission === null) return true;
        if (item.requiredPermission === 'member') return true;
        if (item.requiredPermission === 'calendar') return hasCalendarAccess(currentUser.id);
        if (item.requiredPermission === 'tracking') return hasTrackingAccess(currentUser.id);
        return false;
      });
    }
    
    // For other user types, filter based on permissions
    return allMenuItems.filter(item => {
      if (item.requiredPermission === null) return true;
      if (item.requiredPermission === 'admin') return false;
      if (item.requiredPermission === 'project') return (currentUser.permissions?.projectIds?.length || 0) > 0;
      if (item.requiredPermission === 'task') return (currentUser.permissions?.taskIds?.length || 0) > 0;
      if (item.requiredPermission === 'calendar') return hasCalendarAccess(currentUser.id);
      if (item.requiredPermission === 'tracking') return hasTrackingAccess(currentUser.id);
      return false;
    });
  }, [currentUser, hasCalendarAccess, hasTrackingAccess]);
  
  const handleMenuClick = (itemId: string) => {
    setActiveItem(itemId);
  };

  return (
    <aside 
      className={`
        fixed top-3 left-3 z-40 h-[calc(100vh-24px)] 
        bg-gradient-to-b from-blue-900 to-gray-900 text-white transition-all duration-300 ease-in-out
        rounded-xl overflow-hidden shadow-xl border border-gray-800
        ${isOpen ? 'w-64' : 'w-20'}
      `}
    >
      <div className="h-full flex flex-col justify-between">
        <div>
          {/* Logo and Toggle */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-gray-700/50">
            {isOpen ? (
              <h1 className="text-xl font-bold text-white flex items-center">
                <span className="bg-blue-500 text-white p-1 rounded-lg mr-2 flex items-center justify-center">
                  <Briefcase size={16} />
                </span>
                SGP System
              </h1>
            ) : (
              <h1 className="text-xl font-bold text-white flex items-center justify-center">
                <span className="bg-blue-500 text-white p-1 rounded-lg flex items-center justify-center">
                  <Briefcase size={16} />
                </span>
              </h1>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-blue-800/50 focus:outline-none transition-colors duration-200"
            >
              {isOpen ? <ChevronsLeft size={18} /> : <ChevronsRight size={18} />}
            </button>
          </div>

          {/* User Profile */}
          <div className="px-5 py-4 border-b border-gray-700/50 mb-2">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {user?.avatar_url ? (
                  <img
                    className="h-10 w-10 rounded-full border-2 border-blue-400 shadow-md"
                    src={user.avatar_url}
                    alt={user.full_name}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold shadow-md border-2 border-blue-400">
                    {user?.full_name 
                      ? user.full_name.charAt(0).toUpperCase()
                      : user?.email
                        ? user.email[0].toUpperCase()
                        : 'U'}
                  </div>
                )}
              </div>
              {isOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user?.full_name || ''}</p>
                  <p className="text-xs text-blue-300 capitalize">{user?.role || 'User'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <nav className="mt-2 px-3 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-all duration-200
                  ${activeItem === item.id 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' 
                    : 'text-gray-200 hover:bg-blue-800/30 hover:text-white'}
                `}
                onClick={() => handleMenuClick(item.id)}
              >
                <span className="flex-shrink-0 flex items-center justify-center">{item.icon}</span>
                {isOpen && <span className="ml-3 font-medium">{item.label}</span>}
                {isOpen && activeItem === item.id && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-blue-300"></span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="px-3 pb-5">
          <button
            onClick={signOut}
            className="flex items-center w-full px-4 py-3 text-gray-200 rounded-lg hover:bg-red-600/20 hover:text-white transition-all duration-200 group"
          >
            <span className="flex-shrink-0 flex items-center justify-center group-hover:text-red-400">
              <LogOut size={20} />
            </span>
            {isOpen && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;