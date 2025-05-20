import React from 'react';
import { TimeEntry, User, Project, Task } from '../../types';
import { Clock, Play, Pause, StopCircle } from 'lucide-react';
import Button from '../ui/Button';

interface TimeTrackingProps {
  timeEntries: TimeEntry[];
  projects: Project[];
  tasks: Task[];
  onStartTimer: (taskId: string) => void;
  onStopTimer: () => void;
  currentTask?: Task | null;
  isTimerRunning: boolean;
  timerDuration: number;
}

const TimeTracking: React.FC<TimeTrackingProps> = ({
  timeEntries,
  projects,
  tasks,
  onStartTimer,
  onStopTimer,
  currentTask,
  isTimerRunning,
  timerDuration,
}) => {
  // Helper function to format duration in hours and minutes
  const formatDuration = (hours: number) => {
    const totalMinutes = Math.floor(hours * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    
    return `${hrs}h ${mins}m`;
  };

  // Helper function to format timer duration
  const formatTimerDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Group time entries by day
  const groupedEntries: { [key: string]: TimeEntry[] } = {};
  
  timeEntries.forEach(entry => {
    const date = new Date(entry.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    if (!groupedEntries[date]) {
      groupedEntries[date] = [];
    }
    
    groupedEntries[date].push(entry);
  });

  // Get project and task names
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };
  
  const getTaskName = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task ? task.title : 'Unknown Task';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Tracking</h3>
      
      {/* Timer Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-gray-800 mb-2">
            {formatTimerDuration(timerDuration)}
          </div>
          
          {isTimerRunning && currentTask ? (
            <div className="mb-3">
              <p className="text-sm text-gray-600">
                Currently tracking time for:
              </p>
              <p className="font-medium text-gray-900">{currentTask.title}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-600 mb-3">Start timer to track time</p>
          )}
          
          <div className="flex justify-center space-x-3">
            {isTimerRunning ? (
              <Button
                variant="danger"
                size="md"
                icon={<StopCircle size={18} />}
                onClick={onStopTimer}
              >
                Stop Timer
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                icon={<Play size={18} />}
                onClick={() => onStartTimer('task1')} // Use a default task for demo
              >
                Start Timer
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Recent Time Entries */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Time Entries</h4>
        
        <div className="space-y-4">
          {Object.keys(groupedEntries).length > 0 ? (
            Object.entries(groupedEntries)
              .slice(0, 2) // Show only 2 most recent days
              .map(([date, entries]) => (
                <div key={date} className="space-y-2">
                  <h5 className="text-xs font-medium text-gray-500">{date}</h5>
                  
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start p-2 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <div className="mr-3 flex-shrink-0 mt-0.5">
                        <Clock className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getTaskName(entry.taskId)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getProjectName(entry.projectId)}
                        </p>
                      </div>
                      <div className="ml-2 text-sm font-medium text-gray-900">
                        {formatDuration(entry.hours)}
                      </div>
                    </div>
                  ))}
                </div>
              ))
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No recent time entries</p>
            </div>
          )}
        </div>
        
        <div className="mt-6 text-center">
          <a
            href="#"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all time entries
          </a>
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;