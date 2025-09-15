'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminRoute from '../../../lib/AdminRoute';

function SupervisorLayoutContent({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('student');
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f8f9fa'
      }}>
        <div style={{
          padding: '20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f8f9fa',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1001,
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          border: 'none',
          borderRadius: '12px',
          padding: '12px',
          color: 'white',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
        }}
      >
        ☰
      </button>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: 'block'
          }}
        />
      )}

      {/* Minimal Sidebar */}
      <aside style={{
        width: '280px',
        background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        zIndex: 1000,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease'
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '2rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}>
              👨‍💼
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'white',
                wordBreak: 'break-all'
              }}>
                {user?.email || 'Supervisor'}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#cbd5e1',
                fontWeight: '500'
              }}>
                Supervisor
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer - Only Logout */}
        <div style={{
          marginTop: 'auto',
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.color = '#f87171';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = '#fca5a5';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '1rem' }}>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: '0', // Mobile: no margin
        padding: '20px',
        paddingTop: '80px', // Space for mobile menu button
        overflowY: 'auto',
        background: '#f8f9fa',
        minHeight: '100vh'
      }}>
        {children}
      </main>

      {/* Mobile-specific styles */}
      <style jsx>{`
        @media (min-width: 768px) {
          aside {
            transform: translateX(0) !important;
          }
          main {
            margin-left: 280px !important;
            padding-top: 20px !important;
          }
        }
        
        @media (max-width: 767px) {
          main {
            margin-left: 0 !important;
            padding: 20px !important;
            padding-top: 80px !important;
          }
        }
      `}</style>
      
    </div>
  );
}

export default function SupervisorLayout({ children }) {
  return (
    <AdminRoute>
      <SupervisorLayoutContent>
        {children}
      </SupervisorLayoutContent>
    </AdminRoute>
  );
}
