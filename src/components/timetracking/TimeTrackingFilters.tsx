import React from 'react';
import { Filter } from 'lucide-react';
import Button from '../ui/Button';
import useProjectStore from '../../store/projectStore';
import useUserStore from '../../store/userStore';

interface TimeTrackingFiltersProps {
  filter: {
    startDate?: string;
    endDate?: string;
    projectId?: string;
    userId?: string;
  };
  onFilterChange: (filter: TimeTrackingFiltersProps['filter']) => void;
}

const TimeTrackingFilters: React.FC<TimeTrackingFiltersProps> = ({ filter, onFilterChange }) => {
  const { projects } = useProjectStore();
  const { users } = useUserStore();
  
  // Predefined date ranges
  const dateRanges = [
    { label: 'Today', getValue: () => {
      const today = new Date().toISOString().split('T')[0];
      return { startDate: today, endDate: today };
    }},
    { label: 'This week', getValue: () => {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      const endOfWeek = new Date(now);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
      
      return {
        startDate: startOfWeek.toISOString().split('T')[0],
        endDate: endOfWeek.toISOString().split('T')[0]
      };
    }},
    { label: 'This month', getValue: () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      return {
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0]
      };
    }},
    { label: 'Last 7 days', getValue: () => {
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      
      return {
        startDate: sevenDaysAgo.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
      };
    }},
    { label: 'Last 30 days', getValue: () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      
      return {
        startDate: thirtyDaysAgo.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
      };
    }},
    { label: 'All', getValue: () => ({ startDate: undefined, endDate: undefined }) },
  ];
  
  // Handler for date range selection
  const handleDateRangeSelect = (range: { startDate?: string; endDate?: string }) => {
    onFilterChange({
      ...filter,
      ...range
    });
  };
  
  // Handler for project selection
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filter,
      projectId: e.target.value || undefined
    });
  };
  
  // Handler for user selection
  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filter,
      userId: e.target.value || undefined
    });
  };
  
  // Handler for custom date range
  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFilterChange({
      ...filter,
      [field]: value || undefined
    });
  };
  
  // Handler for clearing all filters
  const handleClearFilters = () => {
    onFilterChange({
      startDate: undefined,
      endDate: undefined,
      projectId: undefined,
      userId: undefined
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Filter size={18} />
          Filters
        </h3>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearFilters}
        >
          Clear Filters
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Period
          </label>
          <div className="flex flex-wrap gap-2">
            {dateRanges.map((range, index) => (
              <button
                key={index}
                onClick={() => handleDateRangeSelect(range.getValue())}
                className={`px-3 py-1 text-sm rounded-md ${filter.startDate === range.getValue().startDate && filter.endDate === range.getValue().endDate ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={filter.startDate || ''}
              onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={filter.endDate || ''}
              onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              id="project"
              value={filter.projectId || ''}
              onChange={handleProjectChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
            <select
              id="user"
              value={filter.userId || ''}
              onChange={handleUserChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All users</option>
              {users.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTrackingFilters;
