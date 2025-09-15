'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyToken } from './next-auth-middleware';
import { refreshToken, getCurrentUser, getCurrentToken } from './token-refresh';

export default function ProtectedRoute({ 
  children, 
  allowedRoles = ['student', 'admin', 'supervisor'],
  redirectTo = '/login' 
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getCurrentToken();
        const user = getCurrentUser();
        
        if (!token || !user) {
          router.push(redirectTo);
          return;
        }

        // Verify token
        const { valid, payload } = verifyToken(token);
        
        if (!valid) {
          // Try to refresh the token
          try {
            const refreshResult = await refreshToken();
            
            if (!refreshResult.success) {
              console.log('Token refresh failed:', refreshResult.error);
              // Refresh failed, clear storage and redirect
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('student');
              router.push(redirectTo);
              return;
            }
            
            // Use refreshed user data
            const refreshedUser = refreshResult.user;
            
            // Check if user role is allowed
            if (!allowedRoles.includes(refreshedUser.role)) {
              // User doesn't have permission, redirect to appropriate page
              if (refreshedUser.role === 'admin' || refreshedUser.role === 'supervisor') {
                router.push('/admin/dashboard');
              } else {
                router.push('/student/portal');
              }
              return;
            }
          } catch (refreshError) {
            console.error('Token refresh error:', refreshError);
            // Clear storage and redirect on any error
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('student');
            router.push(redirectTo);
            return;
          }
        } else {
          // Token is valid, check role
          if (!allowedRoles.includes(user.role)) {
            // User doesn't have permission, redirect to appropriate page
            if (user.role === 'admin' || user.role === 'supervisor') {
              router.push('/admin/dashboard');
            } else {
              router.push('/student/portal');
            }
            return;
          }
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('student');
        router.push(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [allowedRoles, redirectTo, router]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#666', fontSize: '16px' }}>Verifying access...</p>
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

  if (!isAuthorized) {
    return null;
  }

  return children;
}
