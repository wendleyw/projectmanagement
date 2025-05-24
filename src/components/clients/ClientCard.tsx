import React from 'react';
import { Link } from 'react-router-dom';
import { Client, Project } from '../../types';
import { Building, Mail, Phone, Briefcase } from 'lucide-react';
import Badge from '../ui/Badge';

interface ClientCardProps {
  client: Client;
  projects: Project[];
}

const ClientCard: React.FC<ClientCardProps> = ({ client, projects }) => {
  // Get client's projects
  const clientProjects = projects.filter(project => project.client_id === client.id);
  
  // Count active projects
  const activeProjects = clientProjects.filter(
    project => project.status !== 'completed' && project.status !== 'cancelled'
  ).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            <Link to={`/clients/${client.id}`} className="flex items-center">
              <span className="mr-2">{client.name}</span>
            </Link>
          </h3>
          <div>
            <Badge variant={client.status === 'active' ? 'success' : 'danger'}>
              {client.status}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-3 mb-5">
          <div className="flex items-center text-sm">
            <Building className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
            <span className="text-gray-700">{client.contactName}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
            <a href={`mailto:${client.email}`} className="text-gray-700 hover:text-blue-600 transition-colors truncate">
              {client.email}
            </a>
          </div>
          
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
            <a href={`tel:${client.phone}`} className="text-gray-700 hover:text-blue-600 transition-colors">
              {client.phone}
            </a>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm">
            <Briefcase className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
            <span className="text-gray-700">
              {clientProjects.length} {clientProjects.length === 1 ? 'Project' : 'Projects'}
              {activeProjects > 0 && ` (${activeProjects} Active)`}
            </span>
          </div>
        </div>
        
        {clientProjects.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-medium text-gray-500 mb-2">Recent Projects:</h4>
            <div className="space-y-2">
              {clientProjects.slice(0, 2).map(project => (
                <div key={project.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                  <Link 
                    to={`/projects/${project.id}`} 
                    className="text-sm text-gray-700 hover:text-blue-600 transition-colors truncate font-medium"
                  >
                    {project.name}
                  </Link>
                  <Badge 
                    variant={
                      project.status === 'in_progress' ? 'primary' :
                      project.status === 'completed' ? 'success' :
                      project.status === 'on_hold' ? 'warning' :
                      project.status === 'cancelled' ? 'danger' : 'secondary'
                    }
                    size="sm"
                  >
                    {project.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientCard;