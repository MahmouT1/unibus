'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '../../../lib/contexts/LanguageContext';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import '../admin-layout.css';

function AdminDashboardLayoutContent({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
    // Get user from localStorage
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      const adminToken = localStorage.getItem('adminToken');
      
      if (userData && adminToken) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    router.push('/admin-login');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="admin-profile">
            <div className="admin-avatar">
              👨‍💼
            </div>
            <div className="admin-info">
              <div className="admin-name">{user?.email || 'Admin User'}</div>
              <div className="admin-role">{user?.role === 'admin' ? 'Administrator' : 'Supervisor'}</div>
            </div>
          </div>
          <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center' }}>
            <LanguageSwitcher variant="admin" />
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link href="/admin/dashboard" className={`nav-item ${pathname === '/admin/dashboard' ? 'active' : ''}`}>
            <span className="nav-icon">📊</span>
            <span className="nav-label">Dashboard</span>
          </Link>
          
          <Link href="/admin/attendance" className={`nav-item ${pathname === '/admin/attendance' ? 'active' : ''}`}>
            <span className="nav-icon">👥</span>
            <span className="nav-label">Attendance Management</span>
          </Link>
          
          <Link href="/admin/subscriptions" className={`nav-item ${pathname === '/admin/subscriptions' ? 'active' : ''}`}>
            <span className="nav-icon">💳</span>
            <span className="nav-label">Subscription Management</span>
          </Link>
          
          <Link href="/admin/reports" className={`nav-item ${pathname === '/admin/reports' ? 'active' : ''}`}>
            <span className="nav-icon">📈</span>
            <span className="nav-label">Reports</span>
          </Link>
          
          <Link href="/admin/users" className={`nav-item ${pathname === '/admin/users' ? 'active' : ''}`}>
            <span className="nav-icon">🔍</span>
            <span className="nav-label">Student Search</span>
          </Link>
          
          <Link href="/admin/support" className={`nav-item ${pathname === '/admin/support' ? 'active' : ''}`}>
            <span className="nav-icon">🎧</span>
            <span className="nav-label">Support Management</span>
          </Link>
        </nav>

        {/* Quick Actions */}
        <div className="sidebar-actions" style={{ padding: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ marginBottom: '1rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            QUICK ACTIONS
          </div>
          
          <button
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '8px',
              color: '#4ade80',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <span>💰</span>
            Add Expense
          </button>
          
          <button
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              borderRadius: '8px',
              color: '#fcd34d',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(251, 191, 36, 0.2)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'rgba(251, 191, 36, 0.1)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <span>🚗</span>
            Add Driver Salary
          </button>
        </div>

        {/* Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#ef4444';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.target.style.color = '#ef4444';
            }}
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: '280px', flex: 1, minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        {children}
      </main>
    </div>
  );
}

export default function AdminDashboardLayout({ children }) {
  return (
    <AdminDashboardLayoutContent>
      {children}
    </AdminDashboardLayoutContent>
  );
}
