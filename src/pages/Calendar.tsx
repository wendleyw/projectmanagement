import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import useProjectStore from '../store/projectStore';
import ProjectCalendar from '../components/calendar/ProjectCalendar';

const Calendar: React.FC = () => {
  const { fetchProjects } = useProjectStore();
  
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
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
      
      <ProjectCalendar />
    </div>
  );
};

export default Calendar;
