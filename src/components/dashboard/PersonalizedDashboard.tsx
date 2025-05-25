import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Folder as Briefcase, CheckSquare, Calendar, Clock, Play, StopCircle } from 'lucide-react';

import useUserStore from '../../store/userStore';
import useProjectStore from '../../store/projectStore';
import useTaskStore from '../../store/taskStore';
import useTimeEntryStore from '../../store/timeEntryStore';
import { Project, Task } from '../../types';
import { mockCalendarEvents } from '../../data/mockData';

import MiniCalendar from './MiniCalendar';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const PersonalizedDashboard: React.FC = () => {
  const { currentUser } = useUserStore();
  const { projects } = useProjectStore();
  const { tasks } = useTaskStore();
  const { timeEntries, startTimer, stopTimer, recordTimeEntry } = useTimeEntryStore();
  
  // State to store filtered resources
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  
  // State for time tracking modal
  const [isTimeTrackingModalOpen, setIsTimeTrackingModalOpen] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  
  // Filter resources based on user role and permissions
  useEffect(() => {
    if (!currentUser) return;
    
    // Filter projects based on user role
    const filteredProjects = currentUser.role === 'admin' 
      ? projects 
      : projects.filter(p => p.members?.some(m => m.memberId === currentUser.id));
    setUserProjects(filteredProjects);
    
    // Filter tasks based on user role
    const filteredTasks = currentUser.role === 'admin' 
      ? tasks 
      : tasks.filter(t => t.assignee_id === currentUser.id);
    
    // Sort tasks by priority and due date
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      // First by priority (high > medium > low)
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) - 
                        (priorityOrder[b.priority as keyof typeof priorityOrder] || 3);
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by due date (closest first)
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      
      // Tasks with due date come before those without date
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      
      return 0;
    });
    
    setUserTasks(sortedTasks);
  }, [currentUser, projects, tasks]);

  
  // Timer control functions
  const handleStartTimer = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    setCurrentTask(task);
    setIsTimerRunning(true);
    startTimer();
    
    // Start the timer interval
    const interval = setInterval(() => {
      setTimerDuration(prev => prev + 1);
    }, 1000);
    
    setTimerInterval(interval as unknown as NodeJS.Timeout);
  };
  
  const handleStopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    setIsTimerRunning(false);
    stopTimer();
    
    // Record the time entry if a task was selected
    if (currentTask) {
      const hours = timerDuration / 3600; // Convert seconds to hours
      recordTimeEntry({
        id: `te-${Date.now()}`,
        taskId: currentTask.id,
        projectId: currentTask.project_id || '',
        userId: currentUser?.id || '',
        date: new Date().toISOString(),
        hours,
        description: `Time tracked for ${currentTask.title}`,
        billable: false
      });
    }
    
    setTimerDuration(0);
    setCurrentTask(null);
  };
  
  // Helper function to format timer duration
  const formatTimerDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // If there is no logged in user, don't render anything
  if (!currentUser) return null;
  
  return (
    <div className="p-3 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Personalized Dashboard</h1>
      
      {/* Main Content Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Projects Card */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-md font-semibold text-gray-800 flex items-center">
              <span className="bg-blue-100 p-1 sm:p-1.5 rounded-md sm:rounded-lg text-blue-600 mr-1.5 sm:mr-2 flex-shrink-0">
                <Briefcase size={16} className="sm:w-[18px] sm:h-[18px] w-4 h-4" />
              </span>
              Involved Projects
            </h3>
            <span className="text-xs sm:text-sm font-medium bg-blue-50 text-blue-600 py-0.5 sm:py-1 px-1.5 sm:px-2 rounded-md sm:rounded-lg">
              {userProjects.length}
            </span>
          </div>
          
          <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto pr-1 sm:pr-2">
            {userProjects.length === 0 ? (
              <p className="text-xs sm:text-sm text-gray-500">No projects assigned</p>
            ) : (
              userProjects.slice(0, 5).map(project => (
                <div key={project.id} className="flex items-center justify-between bg-gray-50 p-1.5 sm:p-2 rounded-md sm:rounded-lg">
                  <Link 
                    to={`/projects/${project.id}`} 
                    className="text-xs sm:text-sm text-gray-700 hover:text-blue-600 transition-colors truncate font-medium max-w-[70%] flex-shrink"
                  >
                    {project.name}
                  </Link>
                  <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0 ${project.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {project.status}
                  </span>
                </div>
              ))
            )}
          </div>
          
          {userProjects.length > 0 && (
            <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100 text-center">
              <Link to="/projects" className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 transition-colors">
                View all projects
              </Link>
            </div>
          )}
        </div>
        
        {/* Tasks Card */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-md font-semibold text-gray-800 flex items-center">
              <span className="bg-emerald-100 p-1 sm:p-1.5 rounded-md sm:rounded-lg text-emerald-600 mr-1.5 sm:mr-2 flex-shrink-0">
                <CheckSquare size={16} className="sm:w-[18px] sm:h-[18px] w-4 h-4" />
              </span>
              My Tasks
            </h3>
            <span className="text-xs sm:text-sm font-medium bg-emerald-50 text-emerald-600 py-0.5 sm:py-1 px-1.5 sm:px-2 rounded-md sm:rounded-lg">
              {userTasks.length}
            </span>
          </div>
          
          <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto pr-1 sm:pr-2">
            {userTasks.length === 0 ? (
              <p className="text-xs sm:text-sm text-gray-500">No tasks assigned</p>
            ) : (
              userTasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center justify-between bg-gray-50 p-1.5 sm:p-2 rounded-md sm:rounded-lg">
                  <div className="flex-1 min-w-0 mr-1">
                    <Link 
                      to={`/tasks/${task.id}`} 
                      className="text-xs sm:text-sm text-gray-700 hover:text-blue-600 transition-colors truncate font-medium block"
                    >
                      {task.title}
                    </Link>
                    {task.due_date && (
                      <span className="text-[10px] sm:text-xs text-gray-500 truncate block">
                        Due date: {formatDate(task.due_date)}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ml-1 sm:ml-2 flex-shrink-0 ${task.status === 'done' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {task.status}
                  </span>
                </div>
              ))
            )}
          </div>
          
          {userTasks.length > 0 && (
            <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100 text-center">
              <Link to="/tasks" className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 transition-colors">
                View all tasks
              </Link>
            </div>
          )}
        </div>
        
        {/* Calendar Card - with embedded mini calendar */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-md font-semibold text-gray-800 flex items-center">
              <span className="bg-amber-100 p-1 sm:p-1.5 rounded-md sm:rounded-lg text-amber-600 mr-1.5 sm:mr-2 flex-shrink-0">
                <Calendar size={16} className="sm:w-[18px] sm:h-[18px] w-4 h-4" />
              </span>
              My Calendar
            </h3>
            <Link 
              to="/calendar" 
              className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              View full calendar
            </Link>
          </div>
          
          {/* Embedded Mini Calendar */}
          <div className="mb-4">
            <MiniCalendar events={mockCalendarEvents} />
          </div>
        </div>
        
        {/* Tracking Card - Opens in modal */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-md font-semibold text-gray-800 flex items-center">
              <span className="bg-indigo-100 p-1 sm:p-1.5 rounded-md sm:rounded-lg text-indigo-600 mr-1.5 sm:mr-2 flex-shrink-0">
                <Clock size={16} className="sm:w-[18px] sm:h-[18px] w-4 h-4" />
              </span>
              Time Tracking
            </h3>
            <Link 
              to="/time" 
              className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              View all entries
            </Link>
          </div>
          
          <div className="text-center py-4 sm:py-8">
            <Clock size={32} className="sm:w-10 sm:h-10 w-8 h-8 mx-auto text-indigo-500 mb-2 sm:mb-3" />
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Record and track your time</p>
            <Button
              variant="primary"
              size="sm"
              icon={<Play size={16} />}
              onClick={() => setIsTimeTrackingModalOpen(true)}
            >
              Start Tracking
            </Button>
          </div>
        </div>
        
        {/* Time Tracking Modal */}
        <Modal
          isOpen={isTimeTrackingModalOpen}
          onClose={() => setIsTimeTrackingModalOpen(false)}
          title="Time Tracking"
          size="lg"
        >
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
                  <Link to={`/tasks/${currentTask.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                    {currentTask.title}
                  </Link>
                  {currentTask.project_id && (
                    <div className="mt-1 text-xs">
                      <Link to={`/projects/${currentTask.project_id}`} className="text-blue-600 hover:text-blue-800">
                        {projects.find(p => p.id === currentTask.project_id)?.name || 'View Project'}
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600 mb-3">Choose a task to track time</p>
              )}
              
              <div className="flex justify-center space-x-3">
                {isTimerRunning ? (
                  <Button
                    variant="danger"
                    size="md"
                    icon={<StopCircle size={18} />}
                    onClick={handleStopTimer}
                  >
                    Stop Timer
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="mb-4">
                      <label htmlFor="taskSelect" className="block text-sm font-medium text-gray-700 mb-1">
                        Select a task to track:
                      </label>
                      <select
                        id="taskSelect"
                        className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        onChange={(e) => {
                          const selectedTask = userTasks.find(t => t.id === e.target.value);
                          if (selectedTask) {
                            setCurrentTask(selectedTask);
                          }
                        }}
                        value={currentTask?.id || ''}
                      >
                        <option value="">Select a task...</option>
                        {userTasks.map(task => (
                          <option key={task.id} value={task.id}>
                            {task.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <Button
                      variant="primary"
                      size="md"
                      icon={<Play size={18} />}
                      onClick={() => currentTask && handleStartTimer(currentTask.id)}
                      disabled={!currentTask}
                    >
                      Start Timer
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Recent Time Entries */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Time Entries</h4>
            
            {timeEntries.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {timeEntries.slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start py-3 hover:bg-gray-50 px-2 rounded-md transition-colors"
                  >
                    <div className="mr-3 flex-shrink-0 mt-0.5">
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/tasks/${entry.taskId}`} 
                        className="text-sm font-medium text-gray-900 truncate hover:text-blue-600"
                      >
                        {tasks.find(t => t.id === entry.taskId)?.title || 'Unknown Task'}
                      </Link>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                        <span className="mx-1 text-gray-300">•</span>
                        <span className="text-xs font-medium text-gray-700">
                          {Math.round(entry.hours * 100) / 100} hours
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No recent time entries</p>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default PersonalizedDashboard;
