// src/App.js - Updated with authentication routes and logout
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Import components
import StudentRegistration from './components/StudentRegistration';
import SupportCenter from './components/SupportCenter';
import NewStudentPortal from './components/NewStudentPortal';
import Subscription from './components/Subscription';
import TransportationTimes from './components/TransportationTimes';
import Login from './components/Login';
import SignUp from './components/SignUp';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import StudentAttendance from './components/admin/StudentAttendance';
import Reports from './components/admin/Reports';
import SubscriptionManagement from './components/admin/SubscriptionManagement';
import SupervisorDashboard from './components/admin/SupervisorDashboard';

// Loading component
import LoadingSpinner from './components/LoadingSpinner';

import './App.css';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isLoggedIn, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route component (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { isLoggedIn, loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isLoggedIn) {
    // Redirect based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'supervisor') {
      return <Navigate to="/admin/supervisor-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

function App() {
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <div className="logo">SP</div>
          <div className="site-title">Student Portal</div>
          <div className="user-profile">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="user-icon">👤 {user.role}</span>
                <button 
                  onClick={handleLogout}
                  style={{
                    background: '#dc2626',
                    border: 'none',
                    color: 'white',
                    padding: '5px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <span className="user-icon">👤 Guest</span>
            )}
          </div>
        </header>
        
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            } />

            {/* Home route - redirect based on role */}
            <Route path="/" element={
              user?.role === 'admin' ? (
                <Navigate to="/admin/dashboard" replace />
              ) : user?.role === 'supervisor' ? (
                <Navigate to="/admin/supervisor-dashboard" replace />
              ) : (
                <ProtectedRoute allowedRoles={['student']}>
                  <NewStudentPortal />
                </ProtectedRoute>
              )
            } />

            {/* Protected Student Routes */}
            <Route path="/registration" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentRegistration />
              </ProtectedRoute>
            } />
            <Route path="/new-student" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentRegistration />
              </ProtectedRoute>
            } />
            <Route path="/new-portal" element={
              <ProtectedRoute allowedRoles={['student']}>
                <NewStudentPortal />
              </ProtectedRoute>
            } />
            <Route path="/support" element={
              <ProtectedRoute allowedRoles={['student']}>
                <SupportCenter />
              </ProtectedRoute>
            } />
            <Route path="/subscription" element={
              <ProtectedRoute allowedRoles={['student']}>
                <Subscription />
              </ProtectedRoute>
            } />
            <Route path="/transportation" element={
              <ProtectedRoute allowedRoles={['student']}>
                <TransportationTimes />
              </ProtectedRoute>
            } />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="attendance" element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <StudentAttendance />
                </ProtectedRoute>
              } />
              <Route path="reports" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="subscription-management" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SubscriptionManagement />
                </ProtectedRoute>
              } />
              <Route path="supervisor-dashboard" element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <SupervisorDashboard />
                </ProtectedRoute>
              } />
            </Route>

            {/* About page for all users */}
            <Route path="/about" element={<div>About Page (to be implemented)</div>} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
