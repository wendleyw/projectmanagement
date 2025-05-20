import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarEvent } from '../../types';

interface MiniCalendarProps {
  events: CalendarEvent[];
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Helper functions for dates
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
  
  // Format month and year
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };
  
  // Check if date has events
  const hasEvents = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    
    return events.some(event => {
      const eventDate = new Date(event.startTime);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === date.getTime();
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
  
  // Generate calendar grid
  const generateCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const grid = [];
    let day = 1;
    
    // Day headers (Sun-Sat)
    const dayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((dayName, index) => (
      <div key={`header-${index}`} className="text-center text-xs font-medium text-gray-500">
        {dayName}
      </div>
    ));
    
    grid.push(
      <div key="header-row" className="grid grid-cols-7 gap-1 mb-2">
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
            <div key={`empty-${week}-${dayOfWeek}`} className="h-8 flex items-center justify-center"></div>
          );
        } else {
          // Date cell
          const currentCellDate = new Date(year, month, day);
          currentCellDate.setHours(0, 0, 0, 0);
          
          const isToday = currentCellDate.getTime() === today.getTime();
          const hasEventsForDay = hasEvents(year, month, day);
          const dateEvents = getDateEvents(year, month, day);
          
          weekCells.push(
            <div 
              key={`day-${day}`}
              className={`
                relative h-8 flex items-center justify-center text-sm cursor-pointer
                rounded-full hover:bg-gray-100 transition-colors
                ${isToday ? 'bg-blue-100 font-bold text-blue-700' : 'text-gray-700'}
              `}
              title={dateEvents.length > 0 ? `${dateEvents.length} events` : ''}
            >
              {day}
              {hasEventsForDay && (
                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500"></span>
              )}
            </div>
          );
          
          day++;
        }
      }
      
      if (day > daysInMonth && week < 5) break;
      
      grid.push(
        <div key={`week-${week}`} className="grid grid-cols-7 gap-1 mb-1">
          {weekCells}
        </div>
      );
    }
    
    return grid;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Calendar</h3>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={goToPreviousMonth}
            className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
          >
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
          >
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
      
      <h4 className="text-sm font-medium text-gray-700 text-center mb-3">
        {formatMonthYear(currentDate)}
      </h4>
      
      <div className="calendar-grid">
        {generateCalendarGrid()}
      </div>
      
      <div className="mt-6 text-center">
        <a
          href="#"
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          View full calendar
        </a>
      </div>
    </div>
  );
};

export default MiniCalendar;