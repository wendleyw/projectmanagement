import React from 'react';
import { ActivityItem } from '../../store/activityStore';
import { Link, useNavigate } from 'react-router-dom';

interface RecentActivityProps {
  activities: ActivityItem[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      
      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, index) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {index !== activities.length - 1 ? (
                  <span
                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    {activity.user.avatar ? (
                      <img
                        className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ring-8 ring-white"
                        src={activity.user.avatar}
                        alt={activity.user.name}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center ring-8 ring-white">
                        <span className="text-sm font-medium text-gray-600">
                          {activity.user.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">
                          {activity.user.name}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {activity.action} {
                          activity.target === 'project' ? (
                            <Link to={`/projects?id=${activity.targetId}`} className="font-medium text-blue-600 hover:text-blue-800">
                              project
                            </Link>
                          ) : activity.target === 'task' ? (
                            <Link to={`/tasks?id=${activity.targetId}`} className="font-medium text-blue-600 hover:text-blue-800">
                              task
                            </Link>
                          ) : (
                            <span className="font-medium text-gray-900">{activity.target}</span>
                          )
                        }
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>{activity.timestamp}</p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('/activities')}
          className="text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
        >
          View all activities
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;