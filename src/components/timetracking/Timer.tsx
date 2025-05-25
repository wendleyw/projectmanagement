import React, { useState, useEffect } from 'react';
import { Play, Pause, Plus } from 'lucide-react';
import Button from '../ui/Button';
import useTimeTrackingStore from '../../store/timeTrackingStore';
import useProjectStore from '../../store/projectStore';
import useTaskStore from '../../store/taskStore';
import useUserStore from '../../store/userStore';
import TimeEntryForm from './TimeEntryForm';

interface TimerProps {
  onManualEntryClick?: () => void;
}

const Timer: React.FC<TimerProps> = ({ onManualEntryClick }) => {
  const { activeEntry, startTimer, stopTimer } = useTimeTrackingStore();
  const { projects } = useProjectStore();
  const { tasks } = useTaskStore();
  const { currentUser } = useUserStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [isBillable, setIsBillable] = useState<boolean>(true);
  
  // Filter tasks based on selected project
  const filteredTasks = selectedProjectId
    ? tasks.filter(task => task.project_id === selectedProjectId)
    : [];
  
  // Update elapsed time when timer is active
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (activeEntry) {
      // Initialize elapsed time based on already recorded time
      const startTime = activeEntry.startTime ? new Date(activeEntry.startTime).getTime() : Date.now();
      const initialElapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(initialElapsed);
      
      // Update form state based on active entry
      setDescription(activeEntry.description);
      setSelectedProjectId(activeEntry.projectId);
      setSelectedTaskId(activeEntry.taskId || '');
      setIsBillable(activeEntry.billable);
      
      // Set interval to update elapsed time every second
      intervalId = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      // Reset elapsed time when there is no active timer
      setElapsedTime(0);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeEntry]);
  
  // Format elapsed time for display (HH:MM:SS)
  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      remainingSeconds.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Start the timer
  const handleStartTimer = async () => {
    if (!selectedProjectId || !description || !currentUser) return;
    
    await startTimer({
      userId: currentUser.id,
      projectId: selectedProjectId,
      taskId: selectedTaskId || undefined,
      description,
      date: new Date().toISOString().split('T')[0],
      billable: isBillable,
      tags: [],
      hours: 0 // Adding required hours property
    });
  };
  
  // Stop the timer
  const handleStopTimer = async () => {
    if (activeEntry) {
      await stopTimer(activeEntry.id);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Timer</h3>
        <div className="text-2xl font-mono font-bold text-blue-600">
          {formatElapsedTime(elapsedTime)}
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            What are you working on?
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Development of feature X"
            disabled={!!activeEntry}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              id="project"
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedTaskId(''); // Resetar a tarefa quando o projeto mudar
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={!!activeEntry}
            >
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="task" className="block text-sm font-medium text-gray-700 mb-1">
              Task (optional)
            </label>
            <select
              id="task"
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={!selectedProjectId || !!activeEntry}
            >
              <option value="">Select a task</option>
              {filteredTasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="billable"
            checked={isBillable}
            onChange={(e) => setIsBillable(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={!!activeEntry}
          />
          <label htmlFor="billable" className="ml-2 block text-sm text-gray-700">
            Billable
          </label>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          {activeEntry ? (
            <Button
              variant="danger"
              icon={<Pause size={18} />}
              onClick={handleStopTimer}
            >
              Parar
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={<Play size={18} />}
              onClick={handleStartTimer}
              disabled={!selectedProjectId || !description}
            >
              Iniciar
            </Button>
          )}
          
          <Button
            variant="outline"
            icon={<Plus size={18} />}
            onClick={() => {
              if (onManualEntryClick) {
                onManualEntryClick();
              } else {
                setIsFormOpen(true);
              }
            }}
          >
            Adicionar Manualmente
          </Button>
        </div>
      </div>
      
      {/* Modal para adicionar registro de tempo manualmente */}
      {!onManualEntryClick && (
        <TimeEntryForm 
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

export default Timer;
