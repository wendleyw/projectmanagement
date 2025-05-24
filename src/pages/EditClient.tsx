import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import ClientForm from '../components/clients/ClientForm';
import useClientStore from '../store/clientStore';

const EditClient: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClient, currentClient, isLoading, error } = useClientStore();
  
  useEffect(() => {
    if (id) {
      getClient(id);
    }
  }, [id, getClient]);
  
  const handleClose = () => {
    navigate(`/clients/${id}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 rounded-lg bg-white shadow-md">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-center mt-4 text-gray-600">Loading client data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 rounded-lg bg-white shadow-md max-w-md">
          <div className="text-red-500 mb-4 text-center">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-center mb-2">Error Loading Client</h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/clients')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back to Clients
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!currentClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 rounded-lg bg-white shadow-md">
          <p className="text-center text-gray-600">Client not found</p>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => navigate('/clients')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back to Clients
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit Client: ${currentClient.name}`}
        subtitle="Update client information"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Clients', path: '/clients' },
          { label: currentClient.name, path: `/clients/${id}` },
          { label: 'Edit' },
        ]}
      />
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <ClientForm 
          client={currentClient} 
          onClose={handleClose} 
        />
      </div>
    </div>
  );
};

export default EditClient;
