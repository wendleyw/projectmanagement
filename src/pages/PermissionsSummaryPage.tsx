import React, { useState } from 'react';
import { Shield, Book, CheckCircle, User, ArrowLeft, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsAdmin } from '../store/authStore';
import PermissionsStats from '../components/stats/PermissionsStats';
import PermissionsCard from '../components/cards/PermissionsCard';
import PermissionsTutorial from '../components/onboarding/PermissionsTutorial';
import Modal from '../components/ui/Modal';

/**
 * Permissions system summary page
 * Shows all implemented features
 */
const PermissionsSummaryPage: React.FC = () => {
  const isAdmin = useIsAdmin();
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Render conditional content based on admin status
  const renderAdminContent = () => {
    if (!isAdmin) return null;
    
    return (
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-md sm:rounded-lg">
        <p className="text-yellow-700 text-sm sm:text-base font-medium">Exclusive content for administrators</p>
        <p className="text-yellow-600 text-xs sm:text-sm mt-1 sm:mt-1.5">
          As an administrator, you have full access to the permissions system and can manage
          permissions for all users.
        </p>
      </div>
    );
  };
  
  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div className="flex items-center">
          <Shield className="w-5 sm:w-6 h-5 sm:h-6 text-indigo-600 mr-1.5 sm:mr-2 flex-shrink-0" />
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Permissions System</h1>
        </div>
        
        <Link 
          to="/dashboard" 
          className="flex items-center text-gray-600 hover:text-gray-900 text-xs sm:text-sm md:text-base"
        >
          <ArrowLeft className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-1 flex-shrink-0" />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-indigo-50 border border-indigo-100 rounded-md sm:rounded-lg p-2.5 sm:p-4 mb-4 sm:mb-6 md:mb-8">
        <p className="text-indigo-700 text-xs sm:text-sm md:text-base">
          The permissions system allows controlling user access to different application resources, 
          such as projects, tasks, calendar, and tracking. This summary shows all implemented features.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        <div className="bg-white rounded-md sm:rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center">
            <User className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-600 mr-1.5 sm:mr-2 flex-shrink-0" />
            User Permissions
          </h2>
          <PermissionsStats />
        </div>
        
        <div className="bg-white rounded-md sm:rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center">
            <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-600 mr-1.5 sm:mr-2 flex-shrink-0" />
            Permissions Card
          </h2>
          <PermissionsCard />
        </div>
        
        <div className="bg-white rounded-md sm:rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center">
            <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-600 mr-1.5 sm:mr-2 flex-shrink-0" />
            Compact Version
          </h2>
          <PermissionsCard compact={true} />
        </div>
      </div>
      
      <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2 sm:mb-3 md:mb-4">Implemented Features</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        <div className="bg-white rounded-md sm:rounded-lg shadow-sm border border-gray-200 p-2.5 sm:p-3 md:p-5">
          <div className="flex items-center mb-1.5 sm:mb-2 md:mb-3">
            <Shield className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5 text-indigo-600 mr-1.5 sm:mr-2 flex-shrink-0" />
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">Custom Hooks</h3>
          </div>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
            <li className="flex items-start">
              <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>usePermissions</strong>: General permissions management</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>useProjectAccess</strong>: Project access control</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>useTaskAccess</strong>: Task access control</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>useCalendarAccess</strong>: Calendar access control</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>useTrackingAccess</strong>: Tracking access control</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white rounded-md sm:rounded-lg shadow-sm border border-gray-200 p-2.5 sm:p-3 md:p-5">
          <div className="flex items-center mb-1.5 sm:mb-2 md:mb-3">
            <Shield className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5 text-indigo-600 mr-1.5 sm:mr-2 flex-shrink-0" />
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">UI Components</h3>
          </div>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
            <li className="flex items-start">
              <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>PermissionGuard</strong>: Protects routes based on permissions</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>PermissionFilter</strong>: Filters data based on permissions</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>PermissionsMenu</strong>: Navigation menu</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>PermissionsStats</strong>: Permissions statistics</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>PermissionsCard</strong>: Permissions card</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>QuickPermissionSettings</strong>: Quick configuration</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white rounded-md sm:rounded-lg shadow-sm border border-gray-200 p-2.5 sm:p-3 md:p-5">
          <div className="flex items-center mb-1.5 sm:mb-2 md:mb-3">
            <Shield className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5 text-indigo-600 mr-1.5 sm:mr-2 flex-shrink-0" />
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">Pages and Tutorials</h3>
          </div>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
            <li className="flex items-start">
              <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>PermissionExample</strong>: System demonstration</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>PermissionsDocPage</strong>: Complete documentation</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>PermissionsTutorial</strong>: Interactive tutorial</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>PermissionsHelp</strong>: Quick help</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>TutorialButton</strong>: Tutorial button</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
        <Link 
          to="/permissions-docs" 
          className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          <Book className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
          View Documentation
        </Link>
        
        <Link 
          to="/permissions-example" 
          className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors"
        >
          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
          View Demonstration
        </Link>
        
        <button
          onClick={() => setShowTutorial(true)}
          className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
          Start Interactive Tutorial
        </button>
      </div>
      
      {/* Render exclusive content for administrators */}
      {renderAdminContent()}
      
      {/* Modal with interactive tutorial */}
      <Modal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        title="Permissions System Tutorial"
        size="lg"
      >
        <PermissionsTutorial
          onClose={() => setShowTutorial(false)}
          autoStart={true}
        />
      </Modal>
    </div>
  );
};

export default PermissionsSummaryPage;
