import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { CalendarEvent } from '../../types';
import { Link } from 'react-router-dom';

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
      <div key={`header-${index}`} className="text-center text-xs font-medium text-gray-600">
        {dayName}
      </div>
    ));
    
    grid.push(
      <div key="header-row" className="grid grid-cols-7 gap-1.5 mb-3">
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
                relative h-8 w-8 flex items-center justify-center text-sm cursor-pointer
                rounded-full transition-all duration-200
                ${isToday 
                  ? 'bg-blue-500 font-semibold text-white shadow-sm' 
                  : hasEventsForDay 
                    ? 'hover:bg-blue-50 text-gray-800 font-medium' 
                    : 'hover:bg-gray-50 text-gray-600'}
              `}
              title={dateEvents.length > 0 ? `${dateEvents.length} events` : ''}
            >
              {day}
              {hasEventsForDay && !isToday && (
                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              )}
            </div>
          );
          
          day++;
        }
      }
      
      if (day > daysInMonth && week < 5) break;
      
      grid.push(
        <div key={`week-${week}`} className="grid grid-cols-7 gap-1.5 mb-1.5">
          {weekCells}
        </div>
      );
    }
    
    return grid;
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors duration-200"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <h3 className="text-base font-semibold text-gray-800">{formatMonthYear(currentDate)}</h3>
          
          <button
            onClick={goToNextMonth}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors duration-200"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="calendar-grid mt-2">
        {generateCalendarGrid()}
      </div>
      
      <div className="mt-4 text-center">
        <Link
          to="/calendar"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center transition-colors duration-200"
        >
          <CalendarIcon size={14} className="mr-1.5" />
          View full calendar
        </Link>
      </div>
    </div>
  );
};

export default MiniCalendar;