import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  CheckSquare, 
  Users, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import StatCard from '../components/dashboard/StatCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import ProjectProgress from '../components/dashboard/ProjectProgress';
import UpcomingDeadlines from '../components/dashboard/UpcomingDeadlines';
import TimeTracking from '../components/dashboard/TimeTracking';
import MiniCalendar from '../components/dashboard/MiniCalendar';
import useProjectStore from '../store/projectStore';
import useTaskStore from '../store/taskStore';
import useClientStore from '../store/clientStore';
import useTimeEntryStore from '../store/timeEntryStore';
import useCalendarStore from '../store/calendarStore';

const Dashboard: React.FC = () => {
  const { projects, fetchProjects } = useProjectStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { clients, fetchClients } = useClientStore();
  const { timeEntries, fetchTimeEntries } = useTimeEntryStore();
  const { events, fetchEvents } = useCalendarStore();
  
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
  }, [fetchProjects, fetchTasks, fetchClients, fetchTimeEntries, fetchEvents]);
  
  // Timer functions
  const startTimer = (taskId: string) => {
    if (isTimerRunning) {
      return;
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
  const activeProjects = projects.filter(p => p.status === 'in-progress').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTime = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const overdueTasksCount = tasks.filter(task => {
    if (!task.dueDate || task.status === 'completed') return false;
    
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  }).length;
  
  // Mock activity data
  const activities = [
    {
      id: '1',
      user: {
        name: 'John Doe',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
      },
      action: 'completed task',
      target: 'Create wireframes',
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      user: {
        name: 'Jane Smith',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
      },
      action: 'created project',
      target: 'Mobile App Development',
      timestamp: '4 hours ago',
    },
    {
      id: '3',
      user: {
        name: 'Michael Johnson',
        avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150',
      },
      action: 'updated task',
      target: 'Develop frontend components',
      timestamp: 'Yesterday',
    },
    {
      id: '4',
      user: {
        name: 'Emily Brown',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      },
      action: 'commented on',
      target: 'API integration',
      timestamp: 'Yesterday',
    },
  ];
  
  // Get current task
  const currentTask = currentTaskId ? tasks.find(t => t.id === currentTaskId) : null;
  
  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        subtitle="Welcome back. Here's an overview of your projects and tasks."
      />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Active Projects" 
          value={activeProjects} 
          icon={<Briefcase size={20} />}
          color="blue"
        />
        <StatCard 
          title="Completed Tasks" 
          value={completedTasks} 
          icon={<CheckSquare size={20} />}
          color="green"
          trend={{ value: 12, label: 'from last week' }}
        />
        <StatCard 
          title="Total Clients" 
          value={clients.length} 
          icon={<Users size={20} />}
          color="indigo"
        />
        <StatCard 
          title="Overdue Tasks" 
          value={overdueTasksCount} 
          icon={<AlertCircle size={20} />}
          color="red"
          trend={{ value: -5, label: 'from last week' }}
        />
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Project Progress */}
          <ProjectProgress projects={projects} tasks={tasks} />
          
          {/* Recent Activity */}
          <RecentActivity activities={activities} />
        </div>
        
        <div className="space-y-6">
          {/* Time Tracking */}
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
          
          {/* Mini Calendar */}
          <MiniCalendar events={events} />
        </div>
      </div>
      
      {/* Upcoming Tasks */}
      <div className="mb-6">
        <UpcomingDeadlines tasks={tasks} />
      </div>
    </div>
  );
};

export default Dashboard;