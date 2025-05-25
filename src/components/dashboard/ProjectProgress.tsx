import React, { useState } from 'react';
import { Project, Task } from '../../types';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Modal from '../ui/Modal';
import ProjectForm from '../projects/ProjectForm';

interface ProjectProgressProps {
  projects: Project[];
  tasks: Task[];
}

const ProjectProgress: React.FC<ProjectProgressProps> = ({ projects, tasks }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          <Plus size={16} className="mr-1" />
          New Project
        </button>
      </div>
      
      <div className="space-y-5">
        {sortedProjects.length > 0 ? (
          sortedProjects.slice(0, 5).map((project) => {
            const progress = calculateProgress(project.id);
            
            return (
              <div key={project.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Link to={`/projects/${project.id}`} className="text-sm font-medium text-gray-900 truncate hover:text-blue-600">
                    {project.name}
                  </Link>
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
                  ></div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No active projects found.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto"
            >
              <Plus size={16} className="mr-1" />
              Create your first project
            </button>
          </div>
        )}
        
        {sortedProjects.length > 5 && (
          <div className="text-center pt-2">
            <Link to="/projects" className="text-sm text-blue-600 hover:text-blue-800">
              View all projects
            </Link>
          </div>
        )}
      </div>

      {/* Modal para adicionar novo projeto */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Adicionar Novo Projeto"
        size="lg"
      >
        <ProjectForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default ProjectProgress;