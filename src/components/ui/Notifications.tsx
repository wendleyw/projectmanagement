import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import useNotificationStore from '../../store/notificationStore';

const Notifications: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {notifications.map((notification) => {
        // Define icon and colors based on notification type
        let icon;
        let bgColor;
        let textColor;

        switch (notification.type) {
          case 'success':
            icon = <CheckCircle className="h-5 w-5" />;
            bgColor = 'bg-green-100';
            textColor = 'text-green-800';
            break;
          case 'error':
            icon = <AlertCircle className="h-5 w-5" />;
            bgColor = 'bg-red-100';
            textColor = 'text-red-800';
            break;
          case 'warning':
            icon = <AlertTriangle className="h-5 w-5" />;
            bgColor = 'bg-yellow-100';
            textColor = 'text-yellow-800';
            break;
          case 'info':
          default:
            icon = <Info className="h-5 w-5" />;
            bgColor = 'bg-blue-100';
            textColor = 'text-blue-800';
            break;
        }

        return (
          <div
            key={notification.id}
            className={`${bgColor} ${textColor} p-4 rounded-md shadow-md flex items-start animate-in slide-in-from-right-5 duration-300`}
          >
            <div className="flex-shrink-0">{icon}</div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Notifications;
