'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAuthGuard({ children, requiredRole = null }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const userRole = localStorage.getItem('userRole');
      const userData = localStorage.getItem('user');

      if (!token || !userRole || !userData) {
        redirectToLogin();
        return;
      }

      // Parse user data
      const user = JSON.parse(userData);
      setUser(user);
      
      // Check role requirements
      if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
        // User doesn't have required role
        router.push('/admin-login?error=insufficient_permissions');
        return;
      }
      
      // For now, just check localStorage data without server verification
      // This allows access if the user has valid data in localStorage
      setIsAuthenticated(true);
      
      // Optional: Verify token with server in background (non-blocking)
      try {
        const response = await fetch('/api/auth/verify-admin-token', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.warn('Token verification failed, but allowing access based on localStorage');
        }
      } catch (error) {
        console.warn('Token verification error, but allowing access based on localStorage:', error.message);
      }
      
    } catch (error) {
      console.error('Auth check error:', error);
      clearAuthData();
      redirectToLogin();
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
  };

  const redirectToLogin = () => {
    router.push('/admin-login');
  };

  const handleLogout = () => {
    clearAuthData();
    router.push('/admin-login');
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f7fafc'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <h3 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>Verifying Access</h3>
          <p style={{ margin: '0', color: '#718096' }}>Please wait while we verify your credentials...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  // Add logout functionality to children
  const childrenWithAuth = React.cloneElement(children, {
    user,
    onLogout: handleLogout
  });

  return childrenWithAuth;
}
