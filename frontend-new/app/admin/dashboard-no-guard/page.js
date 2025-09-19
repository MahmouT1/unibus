'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboardNoGuard() {
  const [user, setUser] = useState(null);
  const [authData, setAuthData] = useState(null);

  useEffect(() => {
    // Check localStorage data
    const adminToken = localStorage.getItem('adminToken');
    const userRole = localStorage.getItem('userRole');
    const userData = localStorage.getItem('user');
    
    setAuthData({
      adminToken,
      userRole,
      userData
    });
    
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    window.location.href = '/admin-login';
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '30px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '20px'
        }}>
          <div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>
              🎯 Admin Dashboard (No Guard)
            </h1>
            <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>
              Welcome to the admin control panel
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🚪 Logout
          </button>
        </div>

        {/* User Info */}
        <div style={{
          backgroundColor: '#dcfce7',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#166534', margin: '0 0 10px 0' }}>
            ✅ Authentication Status
          </h3>
          {user ? (
            <div>
              <p style={{ margin: '5px 0', color: '#166534' }}>
                <strong>Email:</strong> {user.email}
              </p>
              <p style={{ margin: '5px 0', color: '#166534' }}>
                <strong>Role:</strong> {user.role}
              </p>
              <p style={{ margin: '5px 0', color: '#166534' }}>
                <strong>Full Name:</strong> {user.fullName || 'N/A'}
              </p>
            </div>
          ) : (
            <p style={{ color: '#dc2626', margin: 0 }}>
              ❌ No user data found
            </p>
          )}
        </div>

        {/* Auth Data Debug */}
        <div style={{
          backgroundColor: '#f1f5f9',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#475569', margin: '0 0 15px 0' }}>
            🔍 localStorage Debug
          </h3>
          <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>adminToken:</strong> {authData?.adminToken || 'NOT FOUND'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>userRole:</strong> {authData?.userRole || 'NOT FOUND'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>userData:</strong> {authData?.userData || 'NOT FOUND'}
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            backgroundColor: '#f8fafc',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '25px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>👥</div>
            <h3 style={{ color: '#1f2937', marginBottom: '10px' }}>User Management</h3>
            <p style={{ color: '#6b7280', marginBottom: '15px' }}>
              Manage system users and permissions
            </p>
            <a
              href="/admin/users"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '500'
              }}
            >
              Manage Users
            </a>
          </div>

          <div style={{
            backgroundColor: '#f8fafc',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '25px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
            <h3 style={{ color: '#1f2937', marginBottom: '10px' }}>Attendance</h3>
            <p style={{ color: '#6b7280', marginBottom: '15px' }}>
              View and manage attendance records
            </p>
            <a
              href="/admin/attendance"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '500'
              }}
            >
              View Attendance
            </a>
          </div>

          <div style={{
            backgroundColor: '#f8fafc',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '25px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📈</div>
            <h3 style={{ color: '#1f2937', marginBottom: '10px' }}>Reports</h3>
            <p style={{ color: '#6b7280', marginBottom: '15px' }}>
              Generate and view system reports
            </p>
            <a
              href="/admin/reports"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#f59e0b',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '500'
              }}
            >
              View Reports
            </a>
          </div>

          <div style={{
            backgroundColor: '#f8fafc',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '25px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>👨‍💼</div>
            <h3 style={{ color: '#1f2937', marginBottom: '10px' }}>Supervisor Dashboard</h3>
            <p style={{ color: '#6b7280', marginBottom: '15px' }}>
              Access supervisor tools and QR scanning
            </p>
            <a
              href="/admin/supervisor-dashboard"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '500'
              }}
            >
              Supervisor Tools
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
