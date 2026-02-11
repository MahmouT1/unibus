'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '../../../lib/contexts/LanguageContext';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import '../admin-layout.css';

function AdminSubscriptionsLayoutContent({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
    // Get user from localStorage
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (userData && token) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
          router.push('/auth');
          return;
        }
      } else {
        router.push('/auth');
        return;
      }
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    sessionStorage.clear();
    window.location.href = '/auth';
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>💳</div>
          <p style={{ color: '#6b7280' }}>Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="admin-profile">
            <div className="admin-avatar">👨‍💼</div>
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
          
          <Link href="/admin/transportation" className={`nav-item ${pathname === '/admin/transportation' ? 'active' : ''}`}>
            <span className="nav-icon">🚌</span>
            <span className="nav-label">Transportation Management</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="btn-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}

export default function AdminSubscriptionsLayout({ children }) {
  return (
    <AdminSubscriptionsLayoutContent>
      {children}
    </AdminSubscriptionsLayoutContent>
  );
}
