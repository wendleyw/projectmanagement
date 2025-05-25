import React, { useState, useEffect } from 'react';
import { Clock, Plus } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Timer from '../components/timetracking/Timer';
import TimeEntryList from '../components/timetracking/TimeEntryList';
import TimeTrackingFilters from '../components/timetracking/TimeTrackingFilters';
import TimeTrackingSummary from '../components/timetracking/TimeTrackingSummary';
import TimeEntryForm from '../components/timetracking/TimeEntryForm';
import useTimeTrackingStore from '../store/timeTrackingStore';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TimeTracking: React.FC = () => {
  const { fetchEntries } = useTimeTrackingStore();
  
  // State for filters
  const [filter, setFilter] = useState({
    startDate: undefined,
    endDate: undefined,
    projectId: undefined,
    userId: undefined
  });
  
  // State to control the add/edit entry modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState(null);
  
  // Fetch time entries when page loads
  useEffect(() => {
    fetchEntries(filter);
  }, [fetchEntries, filter]);
  
  // Handler for filter changes
  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
  };
  
  return (
    <div>
      <PageHeader 
        title="Time Tracking" 
        subtitle="Record and monitor time spent on projects and tasks."
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Time Tracking' },
        ]}
        actions={
          <Button 
            variant="primary" 
            icon={<Plus size={18} />}
            onClick={() => {
              setEntryToEdit(null);
              setIsFormOpen(true);
            }}
          >
            New Entry
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Timer 
            onManualEntryClick={() => {
              setEntryToEdit(null);
              setIsFormOpen(true);
            }}
          />
        </div>
        
        <div>
          <TimeTrackingSummary filter={filter} />
        </div>
      </div>
      
      <TimeTrackingFilters 
        filter={filter} 
        onFilterChange={handleFilterChange} 
      />
      
      <TimeEntryList filter={filter} />
      
      {/* Modal for adding/editing time entry */}
      <TimeEntryForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        entryToEdit={entryToEdit}
      />
      
      <ToastContainer />
    </div>
  );
};

export default TimeTracking;
