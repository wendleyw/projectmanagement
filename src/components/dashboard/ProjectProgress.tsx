import React from 'react';
import { Project, Task } from '../../types';

interface ProjectProgressProps {
  projects: Project[];
  tasks: Task[];
}

const ProjectProgress: React.FC<ProjectProgressProps> = ({ projects, tasks }) => {
  // Helper function to calculate project progress based on completed tasks
  const calculateProgress = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    
    if (projectTasks.length === 0) return 0;
    
    const completedTasks = projectTasks.filter(task => task.status === 'completed');
    return Math.round((completedTasks.length / projectTasks.length) * 100);
  };

  // Get active projects
  const activeProjects = projects.filter(
    project => project.status !== 'completed' && project.status !== 'cancelled'
  );

  // Sort projects by progress (ascending)
  const sortedProjects = [...activeProjects].sort(
    (a, b) => calculateProgress(a.id) - calculateProgress(b.id)
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
      
      <div className="space-y-5">
        {sortedProjects.length > 0 ? (
          sortedProjects.slice(0, 5).map((project) => {
            const progress = calculateProgress(project.id);
            
            return (
              <div key={project.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{project.name}</h4>
                  <span className="text-sm text-gray-500">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      progress < 30
                        ? 'bg-red-500'
                        : progress < 70
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No active projects</p>
          </div>
        )}
      </div>
      
      {sortedProjects.length > 5 && (
        <div className="mt-6 text-center">
          <a
            href="#"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all projects
          </a>
        </div>
      )}
    </div>
  );
};

export default ProjectProgress;