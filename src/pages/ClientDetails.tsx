import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, Users, Briefcase, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import useClientStore from '../store/clientStore';
import useProjectStore from '../store/projectStore';
import useTaskStore from '../store/taskStore';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { showNotification } from '../utils/notifications';

const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getClient, currentClient, deleteClient } = useClientStore();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const navigate = useNavigate();
  const { projects, fetchProjects } = useProjectStore();
  const { tasks, fetchTasks } = useTaskStore();
  
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
  const clientProjects = projects.filter(project => project.client_id === currentClient.id);
  
  // Get tasks from client's projects
  const clientTasks = tasks.filter(task => 
    clientProjects.some(project => project.id === task.project_id)
  );

  // Calculate statistics
  const activeProjects = clientProjects.filter(
    project => project.status === 'in_progress'
  ).length;
  
  const completedProjects = clientProjects.filter(
    project => project.status === 'completed'
  ).length;
  
  const totalTasks = clientTasks.length;
  const completedTasks = clientTasks.filter(
    task => task.status === 'done'
  ).length;
  
  // Handle client deletion
  const handleDeleteClient = async () => {
    try {
      await deleteClient(currentClient.id);
      showNotification('Client deleted successfully', 'success');
      navigate('/clients');
    } catch (error) {
      console.error('Error deleting client:', error);
      showNotification('Error deleting client', 'error');
    }
  };

  return (
    <>
      <PageHeader 
        title={currentClient.name}
        subtitle="Client Overview and Details"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Clients', path: '/clients' },
          { label: currentClient.name },
        ]}
        actions={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/clients/edit/${currentClient.id}`)}
              icon={<Edit size={16} />}
            >
              Edit Client
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsConfirmDeleteOpen(true)}
              icon={<Trash2 size={16} />}
            >
              Delete Client
            </Button>
          </div>
        }
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
              <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-3">
                  <Link to={`/projects/${project.id}`} className="text-lg font-medium text-blue-600 hover:text-blue-800">
                    {project.name}
                  </Link>
                  <div className="flex space-x-1">
                    <Link to={`/projects/edit/${project.id}`}>
                      <button className="text-gray-500 hover:text-blue-600">
                        <Edit size={16} />
                      </button>
                    </Link>
                    <button onClick={() => alert(`Delete project ${project.id}`)} className="text-gray-500 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div>
                  <Badge variant={project.status === 'completed' ? 'success' : project.status === 'in_progress' ? 'primary' : 'default'}>
                    {project.status === 'in_progress' ? 'In Progress' : 
                     project.status === 'completed' ? 'Completed' : 
                     project.status === 'on_hold' ? 'On Hold' : 
                     project.status === 'cancelled' ? 'Cancelled' : 'Planned'}
                  </Badge>
                </div>
                
                <div className="mt-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                </div>
                
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Calendar size={14} className="mr-1" />
                  <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>
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
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 6)
              .map(task => (
                <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <Link to={`/tasks/${task.id}`} className="text-lg font-medium text-blue-600 hover:text-blue-800">
                      {task.title}
                    </Link>
                    <div className="flex space-x-1">
                      <Link to={`/tasks/edit/${task.id}`}>
                        <button className="text-gray-500 hover:text-blue-600">
                          <Edit size={16} />
                        </button>
                      </Link>
                      <button onClick={() => alert(`Delete task ${task.id}`)} className="text-gray-500 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <Badge variant={task.status === 'done' ? 'success' : task.status === 'in_progress' ? 'primary' : 'default'}>
                      {task.status === 'todo' ? 'To Do' : 
                       task.status === 'in_progress' ? 'In Progress' : 
                       task.status === 'review' ? 'In Review' : 'Done'}
                    </Badge>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                  </div>
                  
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <Clock size={14} className="mr-1" />
                    <span>{new Date(task.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No tasks found for this client.</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        title="Delete Client"
      >
        <div className="p-4">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
          </div>
          
          <p className="text-center text-gray-600 mb-6">
            Are you sure you want to delete this client? All related data will be permanently removed.
            This action cannot be undone.
          </p>
          
          <div className="flex justify-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsConfirmDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteClient}
            >
              Delete Client
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ClientDetails;
