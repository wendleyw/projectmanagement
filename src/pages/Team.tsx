import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import TeamMemberList from '../components/team/TeamMemberList';
import UserForm from '../components/team/UserForm';
import Modal from '../components/ui/Modal';
import QuickPermissionSettings from '../components/team/QuickPermissionSettings';
import useUserStore, { User } from '../store/userStore';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Team: React.FC = () => {
  const { fetchUsers, currentUser } = useUserStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<User | null>(null);
  const [showQuickPermissions, setShowQuickPermissions] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const handleEditMember = (member: User) => {
    setMemberToEdit(member);
    setIsFormOpen(true);
  };
  
  // Open quick permissions settings
  const handleQuickPermissions = (userId: string) => {
    setSelectedUserId(userId);
    setShowQuickPermissions(true);
  };
  
  // Check if the current user is an administrator
  const isAdmin = currentUser?.role === 'admin';
  
  return (
    <div>
      <PageHeader 
        title="Team" 
        subtitle="Manage team members and their permissions."
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Team' },
        ]}
        actions={
          isAdmin && (
            <Button 
              variant="primary" 
              icon={<Plus size={18} />}
              onClick={() => {
                setMemberToEdit(null);
                setIsFormOpen(true);
              }}
            >
              Novo Membro
            </Button>
          )
        }
      />
      
      <TeamMemberList 
        onEditMember={handleEditMember}
        isAdmin={isAdmin}
        onQuickPermissions={handleQuickPermissions}
      />
      
      {/* Modal for adding/editing team member */}
      {isAdmin && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={memberToEdit ? 'Edit Member' : 'Add New Member'}
          size="lg"
        >
          <UserForm 
            user={memberToEdit || undefined}
            onClose={() => setIsFormOpen(false)}
          />
        </Modal>
      )}
      
      {/* Modal for quick permission settings */}
      {isAdmin && (
        <Modal
          isOpen={showQuickPermissions}
          onClose={() => setShowQuickPermissions(false)}
          title="Quick Permission Settings"
          size="md"
        >
          <QuickPermissionSettings 
            userId={selectedUserId}
            onClose={() => setShowQuickPermissions(false)}
            onSave={() => {
              setShowQuickPermissions(false);
              // Update user list after saving
              fetchUsers();
            }}
          />
        </Modal>
      )}
      
      <ToastContainer />
    </div>
  );
};

export default Team;
