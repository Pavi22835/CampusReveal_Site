import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Admin Layout and Pages
import AdminLayout from './components/Layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Universities from './pages/Universities';
import AddUniversity from './pages/AddUniversity';
import EditUniversity from './pages/EditUniversity';
import ViewUniversity from './pages/ViewUniversity';
import Reviews from './pages/Reviews';
import Users from './pages/Users';
import Discussions from './pages/Discussions';
import Login from './pages/Login';

import './App.css';

const LoadingSpinner = () => (
  <div className="app-loading-container">
    <div className="loading-spinner"></div>
    <p>Loading application...</p>
  </div>
);

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="universities" element={<Universities />} />
        <Route path="universities/add" element={<AddUniversity />} />
        <Route path="universities/edit/:id" element={<EditUniversity />} />
        <Route path="universities/view/:id" element={<ViewUniversity />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="users" element={<Users />} />
        <Route path="discussions" element={<Discussions />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

function App() {
  return <AppContent />;
}

export default App;