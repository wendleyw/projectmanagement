import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import useCalendarStore from '../store/calendarStore';
import useProjectStore from '../store/projectStore';
import Badge from '../components/ui/Badge';

const Calendar: React.FC = () => {
  const { events, fetchEvents } = useCalendarStore();
  const { projects, fetchProjects } = useProjectStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month');
  
  useEffect(() => {
    fetchEvents();
    fetchProjects();
  }, [fetchEvents, fetchProjects]);
  
  // Helper functions for calendar
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };
  
  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Format month and year
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };
  
  // Get events for a specific date
  const getDateEvents = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === date.getTime();
    });
  };
  
  // Get project name
  const getProjectName = (projectId?: string) => {
    if (!projectId) return null;
    
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };
  
  // Generate month view
  const generateMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const rows = [];
    let day = 1;
    
    // Day headers (Sun-Sat)
    const dayHeaders = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((dayName, index) => (
      <div key={`header-${index}`} className="text-center py-2 border-b font-medium text-gray-500">
        {dayName}
      </div>
    ));
    
    rows.push(
      <div key="header-row" className="grid grid-cols-7 border-b">
        {dayHeaders}
      </div>
    );
    
    // Date cells
    for (let week = 0; week < 6; week++) {
      const weekCells = [];
      
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        if ((week === 0 && dayOfWeek < firstDayOfMonth) || day > daysInMonth) {
          // Empty cell
          weekCells.push(
            <div 
              key={`empty-${week}-${dayOfWeek}`} 
              className="min-h-[120px] border-r border-b last:border-r-0 bg-gray-50"
            ></div>
          );
        } else {
          // Date cell
          const currentCellDate = new Date(year, month, day);
          currentCellDate.setHours(0, 0, 0, 0);
          
          const isToday = currentCellDate.getTime() === today.getTime();
          const dateEvents = getDateEvents(year, month, day);
          
          weekCells.push(
            <div 
              key={`day-${day}`}
              className={`
                min-h-[120px] border-r border-b last:border-r-0 p-1
                ${isToday ? 'bg-blue-50' : 'hover:bg-gray-50'}
              `}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`
                  rounded-full h-6 w-6 flex items-center justify-center text-sm
                  ${isToday ? 'bg-blue-600 text-white font-bold' : 'text-gray-700'}
                `}>
                  {day}
                </span>
                {isToday && (
                  <span className="text-xs text-blue-600 font-medium">Today</span>
                )}
              </div>
              
              <div className="space-y-1">
                {dateEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`
                      text-xs p-1 rounded truncate cursor-pointer
                      ${event.type === 'task' ? 'bg-blue-100 text-blue-800' :
                        event.type === 'milestone' ? 'bg-amber-100 text-amber-800' :
                        'bg-green-100 text-green-800'}
                    `}
                    title={event.description || event.title}
                  >
                    <p className="font-medium truncate">{event.title}</p>
                    {event.projectId && (
                      <p className="text-xs opacity-75 truncate">{getProjectName(event.projectId)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
          
          day++;
        }
      }
      
      if (day > daysInMonth && week < 5) break;
      
      rows.push(
        <div key={`week-${week}`} className="grid grid-cols-7">
          {weekCells}
        </div>
      );
    }
    
    return rows;
  };
  
  return (
    <div>
      <PageHeader 
        title="Calendar" 
        subtitle="Schedule and manage your events, meetings, and deadlines."
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Calendar' },
        ]}
        actions={
          <Button variant="primary" icon={<Plus size={18} />}>
            New Event
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        {/* Calendar Header */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
              className="mr-2"
            >
              <ChevronLeft size={18} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
            >
              <ChevronRight size={18} />
            </Button>
            <h2 className="text-lg font-semibold text-gray-900 ml-4">
              {formatMonthYear(currentDate)}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="ml-4"
            >
              Today
            </Button>
          </div>
          
          <div className="flex rounded-md border border-gray-300 overflow-hidden">
            <button
              className={`px-3 py-1 ${currentView === 'month' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              onClick={() => setCurrentView('month')}
            >
              Month
            </button>
            <button
              className={`px-3 py-1 border-l border-gray-300 ${currentView === 'week' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              onClick={() => setCurrentView('week')}
            >
              Week
            </button>
            <button
              className={`px-3 py-1 border-l border-gray-300 ${currentView === 'day' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              onClick={() => setCurrentView('day')}
            >
              Day
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
              <span className="text-xs text-gray-600">Task</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
              <span className="text-xs text-gray-600">Milestone</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span className="text-xs text-gray-600">Event</span>
            </div>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="calendar-grid border-t">
          {currentView === 'month' && generateMonthView()}
          {currentView === 'week' && (
            <div className="p-8 text-center text-gray-500">
              Week view implementation coming soon...
            </div>
          )}
          {currentView === 'day' && (
            <div className="p-8 text-center text-gray-500">
              Day view implementation coming soon...
            </div>
          )}
        </div>
      </div>
      
      {/* Upcoming Events */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
        
        <div className="space-y-4">
          {events.length > 0 ? (
            events.slice(0, 5).map((event) => {
              const eventDate = new Date(event.startTime);
              
              return (
                <div key={event.id} className="flex items-start p-3 hover:bg-gray-50 rounded-md transition-colors">
                  <div className="mr-4 flex-shrink-0">
                    <div className={`
                      rounded-full h-10 w-10 flex items-center justify-center text-white
                      ${event.type === 'task' ? 'bg-blue-500' :
                        event.type === 'milestone' ? 'bg-amber-500' :
                        'bg-green-500'}
                    `}>
                      <span className="text-xs font-medium">
                        {eventDate.getDate()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{event.title}</h4>
                      <Badge
                        variant={
                          event.type === 'task' ? 'primary' :
                          event.type === 'milestone' ? 'warning' :
                          'success'
                        }
                        size="sm"
                      >
                        {event.type}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-500 mb-1">{event.description}</p>
                    )}
                    <div className="flex items-center text-xs text-gray-500">
                      <span>
                        {eventDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                      {event.projectId && (
                        <>
                          <span className="mx-1">•</span>
                          <span>{getProjectName(event.projectId)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No upcoming events</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;