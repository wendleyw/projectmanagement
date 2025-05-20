import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, Users, Briefcase } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import ProjectCard from '../components/projects/ProjectCard';
import TaskCard from '../components/tasks/TaskCard';
import useClientStore from '../store/clientStore';
import useProjectStore from '../store/projectStore';
import useTaskStore from '../store/taskStore';
import useAuthStore from '../store/authStore';

const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { clients, getClient, currentClient } = useClientStore();
  const { projects, fetchProjects } = useProjectStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { user } = useAuthStore();
  
  useEffect(() => {
    if (id) {
      getClient(id);
      fetchProjects();
      fetchTasks();
    }
  }, [id, getClient, fetchProjects, fetchTasks]);

  if (!currentClient) {
    return <div>Loading...</div>;
  }

  // Get client's projects
  const clientProjects = projects.filter(project => project.clientId === currentClient.id);
  
  // Get tasks from client's projects
  const clientTasks = tasks.filter(task => 
    clientProjects.some(project => project.id === task.projectId)
  );

  // Calculate statistics
  const activeProjects = clientProjects.filter(
    project => project.status === 'in-progress'
  ).length;
  
  const completedProjects = clientProjects.filter(
    project => project.status === 'completed'
  ).length;
  
  const totalTasks = clientTasks.length;
  const completedTasks = clientTasks.filter(
    task => task.status === 'completed'
  ).length;

  return (
    <div>
      <PageHeader 
        title={currentClient.name}
        subtitle="Client Overview and Details"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Clients', path: '/clients' },
          { label: currentClient.name },
        ]}
      />

      {/* Client Information Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Contact Person</label>
                <p className="text-gray-900">{currentClient.contactName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">
                  <a href={`mailto:${currentClient.email}`} className="text-blue-600 hover:text-blue-800">
                    {currentClient.email}
                  </a>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">
                  <a href={`tel:${currentClient.phone}`} className="text-blue-600 hover:text-blue-800">
                    {currentClient.phone}
                  </a>
                </p>
              </div>
              {currentClient.address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900">{currentClient.address}</p>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Active Projects</p>
                    <p className="text-2xl font-bold text-blue-700">{activeProjects}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Completed Projects</p>
                    <p className="text-2xl font-bold text-green-700">{completedProjects}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Total Tasks</p>
                    <p className="text-2xl font-bold text-purple-700">{totalTasks}</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-600">Completed Tasks</p>
                    <p className="text-2xl font-bold text-indigo-700">{completedTasks}</p>
                  </div>
                  <Users className="h-8 w-8 text-indigo-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientProjects.length > 0 ? (
            clientProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                client={currentClient}
                manager={user}
                tasks={clientTasks.filter(task => task.projectId === project.id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">No projects found for this client.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Tasks Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientTasks.length > 0 ? (
            clientTasks
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 6)
              .map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  assignee={user}
                />
              ))
          ) : (
            <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">No tasks found for this client's projects.</p>
            </div>
          )}
        </div>
      </div>

      {/* Activity Timeline */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h3>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flow-root">
            <ul className="-mb-8">
              {clientProjects.map((project, index) => (
                <li key={project.id}>
                  <div className="relative pb-8">
                    {index !== clientProjects.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                          <Briefcase className="h-4 w-4 text-white" />
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm text-gray-500">
                            Project <span className="font-medium text-gray-900">{project.name}</span> was{' '}
                            <span className="font-medium text-gray-900">{project.status}</span>
                          </p>
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-gray-500">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;