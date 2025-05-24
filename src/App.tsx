import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import EditClient from './pages/EditClient';
import Calendar from './pages/Calendar';
import Team from './pages/Team';
import TimeTracking from './pages/TimeTracking';
import DatabaseSetup from './pages/DatabaseSetup';
import Notifications from './components/ui/Notifications';
import PermissionGuard from './components/auth/PermissionGuard';
import AdminOnlyRoute from './components/auth/AdminOnlyRoute';
import ProjectDetailsWrapper from './components/projects/ProjectDetailsWrapper';
import PermissionExample from './components/examples/PermissionExample';
import { useIsAuthenticated } from './store/authStore';
import useUserStore from './store/userStore';
import PermissionsDocPage from './pages/PermissionsDocPage';
import PermissionsSummaryPage from './pages/PermissionsSummaryPage';

const App: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const { fetchCurrentUser } = useUserStore();
  
  // Load current user when the application starts
  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUser();
    }
  }, [isAuthenticated, fetchCurrentUser]);
  
  return (
    <Router>
      <Notifications />
      <Routes>
        {/* Auth routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} 
        />
        
        {/* Protected routes */}
        <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
          {/* Dashboard accessible to all authenticated users */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Projects - only users with project permissions */}
          <Route path="/projects" element={
            <PermissionGuard requiredPermission="project">
              <Projects />
            </PermissionGuard>
          } />
          
          {/* Detalhes do projeto - apenas usuu00e1rios com permissu00e3o para o projeto especu00edfico */}
          <Route path="/projects/:id" element={
            <ProjectDetailsWrapper />
          } />
          
          {/* Tarefas - apenas usuu00e1rios com permissu00e3o de tarefas */}
          <Route path="/tasks" element={
            <PermissionGuard requiredPermission="task">
              <Tasks />
            </PermissionGuard>
          } />
          
          {/* Clientes - apenas administradores */}
          <Route path="/clients" element={
            <AdminOnlyRoute>
              <Clients />
            </AdminOnlyRoute>
          } />
          
          {/* Detalhes do cliente - apenas administradores */}
          <Route path="/clients/:id" element={
            <AdminOnlyRoute>
              <ClientDetails />
            </AdminOnlyRoute>
          } />
          
          {/* Edição de cliente - apenas administradores */}
          <Route path="/clients/edit/:id" element={
            <AdminOnlyRoute>
              <EditClient />
            </AdminOnlyRoute>
          } />
          
          {/* Equipe - apenas administradores */}
          <Route path="/team" element={
            <AdminOnlyRoute>
              <Team />
            </AdminOnlyRoute>
          } />
          
          {/* Calendu00e1rio - apenas usuu00e1rios com permissu00e3o de calendu00e1rio */}
          <Route path="/calendar" element={
            <PermissionGuard requiredPermission="calendar">
              <Calendar />
            </PermissionGuard>
          } />
          
          {/* Time Tracking - apenas usuu00e1rios com permissu00e3o de tracking */}
          <Route path="/time" element={
            <PermissionGuard requiredPermission="tracking">
              <TimeTracking />
            </PermissionGuard>
          } />
          
          {/* Configuracu00f5es - apenas administradores */}
          <Route path="/settings" element={
            <AdminOnlyRoute>
              <div className="p-6">Settings Implementation Coming Soon</div>
            </AdminOnlyRoute>
          } />
          
          {/* Configuracu00e7u00e3o do banco de dados - apenas administradores */}
          <Route path="/database-setup" element={
            <AdminOnlyRoute>
              <DatabaseSetup />
            </AdminOnlyRoute>
          } />
          
          {/* Exemplo do sistema de permissu00f5es - apenas administradores */}
          <Route path="/permissions-example" element={
            <AdminOnlyRoute>
              <PermissionExample />
            </AdminOnlyRoute>
          } />
          
          {/* Documentação do sistema de permissões - apenas administradores */}
          <Route path="/permissions-docs" element={
            <AdminOnlyRoute>
              <PermissionsDocPage />
            </AdminOnlyRoute>
          } />
          <Route path="/permissions-summary" element={
            <AdminOnlyRoute>
              <PermissionsSummaryPage />
            </AdminOnlyRoute>
          } />
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;