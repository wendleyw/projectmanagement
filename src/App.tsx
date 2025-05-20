import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import Calendar from './pages/Calendar';
import useAuthStore from './store/authStore';

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} 
        />
        
        {/* Protected routes */}
        <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientDetails />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/time" element={<div className="p-6">Time Tracking Implementation Coming Soon</div>} />
          <Route path="/settings" element={<div className="p-6">Settings Implementation Coming Soon</div>} />
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;