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
  const clientProjects = projects.filter(project => project.clientId === client.id);
  
  // Count active projects
  const activeProjects = clientProjects.filter(
    project => project.status !== 'completed' && project.status !== 'cancelled'
  ).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            <Link to={`/clients/${client.id}`}>{client.name}</Link>
          </h3>
          <Badge variant={client.status === 'active' ? 'success' : 'danger'}>
            {client.status}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <Building className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-700">{client.contactName}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 text-gray-400 mr-2" />
            <a href={`mailto:${client.email}`} className="text-gray-700 hover:text-blue-600 transition-colors">
              {client.email}
            </a>
          </div>
          
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 text-gray-400 mr-2" />
            <a href={`tel:${client.phone}`} className="text-gray-700 hover:text-blue-600 transition-colors">
              {client.phone}
            </a>
          </div>
        </div>
        
        <div className="flex items-center text-sm">
          <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-gray-700">
            {clientProjects.length} {clientProjects.length === 1 ? 'Project' : 'Projects'}
            {activeProjects > 0 && ` (${activeProjects} Active)`}
          </span>
        </div>
      </div>
      
      {clientProjects.length > 0 && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Recent Projects:</h4>
          <div className="space-y-1">
            {clientProjects.slice(0, 2).map(project => (
              <div key={project.id} className="flex items-center justify-between">
                <Link 
                  to={`/projects/${project.id}`} 
                  className="text-xs text-gray-700 hover:text-blue-600 transition-colors truncate"
                >
                  {project.name}
                </Link>
                <Badge 
                  variant={
                    project.status === 'in-progress' ? 'primary' :
                    project.status === 'completed' ? 'success' :
                    project.status === 'on-hold' ? 'warning' :
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
  );
};

export default ClientCard;