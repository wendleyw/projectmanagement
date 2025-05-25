import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import ClientCard from '../components/clients/ClientCard';
import ClientForm from '../components/clients/ClientForm';
import Modal from '../components/ui/Modal';
import useClientStore from '../store/clientStore';
import useProjectStore from '../store/projectStore';

const Clients: React.FC = () => {
  const { clients, fetchClients } = useClientStore();
  const { projects, fetchProjects } = useProjectStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch data
  useEffect(() => {
    fetchClients();
    fetchProjects();
  }, [fetchClients, fetchProjects]);
  
  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div>
      <PageHeader 
        title="Clients" 
        subtitle="Manage your client relationships and projects."
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Clients' },
        ]}
        actions={
          <Button 
            variant="primary" 
            icon={<Plus size={18} />}
            onClick={() => setIsModalOpen(true)}
          >
            New Client
          </Button>
        }
      />
      
      {/* Filters */}
      <div className="mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-blue-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2 min-w-[200px]">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-blue-500" />
              </div>
              <select
                className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm appearance-none bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredClients.length > 0 ? (
          filteredClients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              projects={projects}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
            <div className="bg-gray-50 p-6 rounded-full mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-gray-700 text-lg font-medium mb-2">No clients found</p>
            <p className="text-gray-500 mb-6 text-center max-w-md">Add your first client to start managing your projects and relationships.</p>
            <Button 
              variant="primary" 
              size="md" 
              icon={<Plus size={18} />}
              onClick={() => setIsModalOpen(true)}
              className="shadow-md hover:shadow-lg transition-all duration-300"
            >
              Add New Client
            </Button>
          </div>
        )}
      </div>
      
      {/* Modal for adding a new client */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Client"
        size="lg"
      >
        <ClientForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Clients;