import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  CheckSquare, 
  Users, 
  AlertCircle,
  Calendar,
  Clock
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import StatCard from '../components/dashboard/StatCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import ProjectProgress from '../components/dashboard/ProjectProgress';
import UpcomingDeadlines from '../components/dashboard/UpcomingDeadlines';
import TimeTracking from '../components/dashboard/TimeTracking';
import MiniCalendar from '../components/dashboard/MiniCalendar';
import PersonalizedDashboard from '../components/dashboard/PersonalizedDashboard';
import useProjectStore from '../store/projectStore';
import useTaskStore from '../store/taskStore';
import useClientStore from '../store/clientStore';
import useTimeEntryStore from '../store/timeEntryStore';
import useCalendarStore from '../store/calendarStore';
import useUserStore from '../store/userStore';
import useActivityStore from '../store/activityStore';
import PermissionFilter from '../components/auth/PermissionFilter';

const Dashboard: React.FC = () => {
  const { projects, fetchProjects } = useProjectStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { clients, fetchClients } = useClientStore();
  const { timeEntries, fetchTimeEntries } = useTimeEntryStore();
  const { events, fetchEvents } = useCalendarStore();
  const { currentUser } = useUserStore();
  const { activities, fetchActivities } = useActivityStore();
  
  // Time tracking state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Fetch data
  useEffect(() => {
    fetchProjects();
    fetchTasks();
    fetchClients();
    fetchTimeEntries();
    fetchEvents();
    fetchActivities();
  }, [fetchProjects, fetchTasks, fetchClients, fetchTimeEntries, fetchEvents, fetchActivities]);
  
  // Clear the timer when component is unmounted
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);
  
  // Timer functions
  const startTimer = (taskId: string) => {
    if (isTimerRunning) {
      return;
    }
    
    // Clear any existing timer before starting a new one
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    setIsTimerRunning(true);
    setCurrentTaskId(taskId);
    
    const interval = setInterval(() => {
      setTimerDuration(prev => prev + 1);
    }, 1000);
    
    setTimerInterval(interval);
  };
  
  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    setIsTimerRunning(false);
    setCurrentTaskId(null);
    setTimerDuration(0);
  };
  
  // Get stats
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  // Calculate total recorded time for use in the TimeTracking component
  const overdueTasksCount = tasks.filter(task => {
    if (!task.due_date || task.status === 'done') return false;
    
    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  }).length;
  
  // Recent activities are loaded from ActivityStore
  
  // Get current task
  const currentTask = currentTaskId ? tasks.find(t => t.id === currentTaskId) : null;
  
  // Determine whether to show the full dashboard or personalized one
  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';
  const showFullDashboard = isAdmin || isManager;
  
  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        subtitle={showFullDashboard 
          ? "Welcome back. Here's an overview of your projects and tasks."
          : "Welcome back. Here's your personalized dashboard."}
      />
      
      {/* Personalized Dashboard for regular users */}
      {!showFullDashboard && <PersonalizedDashboard />}
      
      {/* Stats Cards - only for admins and managers */}
      {showFullDashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Active Projects" 
            value={activeProjects} 
            icon={<Briefcase size={22} />}
            color="blue"
          />
          <StatCard 
            title="Completed Tasks" 
            value={completedTasks} 
            icon={<CheckSquare size={22} />}
            color="green"
            trend={{ value: 12, label: 'from last week' }}
          />
          <StatCard 
            title="Total Clients" 
            value={clients.length} 
            icon={<Users size={22} />}
            color="indigo"
          />
          <StatCard 
            title="Overdue Tasks" 
            value={overdueTasksCount} 
            icon={<AlertCircle size={22} />}
            color="red"
            trend={{ value: -5, label: 'from last week' }}
          />
        </div>
      )}
      
      {/* Main Content - only for admins and managers */}
      {showFullDashboard && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Project Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
                <span className="bg-blue-100 p-1.5 rounded-lg text-blue-600 mr-2">
                  <Briefcase size={18} />
                </span>
                Project Progress
              </h2>
              <ProjectProgress projects={projects} tasks={tasks} />
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
                <span className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600 mr-2">
                  <Users size={18} />
                </span>
                Recent Activity
              </h2>
              <RecentActivity activities={activities} />
            </div>
          </div>
          
          <div className="space-y-8">
            {/* Time Tracking */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
                <span className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600 mr-2">
                  <Clock size={18} />
                </span>
                Time Tracking
              </h2>
              <TimeTracking 
                timeEntries={timeEntries}
                projects={projects}
                tasks={tasks}
                onStartTimer={startTimer}
                onStopTimer={stopTimer}
                currentTask={currentTask}
                isTimerRunning={isTimerRunning}
                timerDuration={timerDuration}
              />
            </div>
            
            {/* Mini Calendar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="bg-amber-100 p-1.5 rounded-lg text-amber-600 mr-2">
                    <Calendar size={18} />
                  </span>
                  Calendário
                </div>
                <button className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-2.5 py-1 rounded-lg transition-colors">
                  Ver Tudo
                </button>
              </h2>
              <MiniCalendar events={events} />
            </div>
            
            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="bg-red-100 p-1.5 rounded-lg text-red-600 mr-2">
                    <AlertCircle size={18} />
                  </span>
                  Prazos Próximos
                </div>
                <button className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-2.5 py-1 rounded-lg transition-colors">
                  Ver Tudo
                </button>
              </h2>
              <UpcomingDeadlines tasks={tasks} />
            </div>
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col space-y-4">
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          onClick={() => window.location.href = '/projects/new'}
          title="Create New Project"
        >
          <Briefcase size={20} />
        </button>
        <button 
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          onClick={() => window.location.href = '/tasks/new'}
          title="Create New Task"
        >
          <CheckSquare size={20} />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;