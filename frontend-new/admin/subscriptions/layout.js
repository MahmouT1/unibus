'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import AdminRoute from '../../../lib/AdminRoute';
import ExpenseForm from '../../../src/components/admin/ExpenseForm';
import DriverSalaryForm from '../../../src/components/admin/DriverSalaryForm';
import { useLanguage } from '../../../lib/contexts/LanguageContext';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import '../admin-layout.css';

function AdminSubscriptionsLayoutContent({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

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

  const handleExpenseSuccess = () => {
    // Refresh the page or trigger a data refresh
    window.location.reload();
  };

  const handleDriverSuccess = () => {
    // Refresh the page or trigger a data refresh
    window.location.reload();
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
            <span className="nav-label">{t('dashboard')}</span>
          </Link>
          
          <Link href="/admin/attendance" className={`nav-item ${pathname === '/admin/attendance' ? 'active' : ''}`}>
            <span className="nav-icon">👥</span>
            <span className="nav-label">{t('attendanceManagement')}</span>
          </Link>
          
          <Link href="/admin/subscriptions" className={`nav-item ${pathname === '/admin/subscriptions' ? 'active' : ''}`}>
            <span className="nav-icon">💳</span>
            <span className="nav-label">{t('subscriptionManagement')}</span>
          </Link>
          
          <Link href="/admin/reports" className={`nav-item ${pathname === '/admin/reports' ? 'active' : ''}`}>
            <span className="nav-icon">📈</span>
            <span className="nav-label">{t('reports')}</span>
          </Link>
          
          <Link href="/admin/users" className={`nav-item ${pathname === '/admin/users' ? 'active' : ''}`}>
            <span className="nav-icon">🔍</span>
            <span className="nav-label">{t('studentSearch')}</span>
          </Link>
          
          <Link href="/admin/support" className={`nav-item ${pathname === '/admin/support' ? 'active' : ''}`}>
            <span className="nav-icon">🎧</span>
            <span className="nav-label">{t('supportManagement')}</span>
          </Link>
        </nav>

        {/* Quick Actions Section */}
        <div className="sidebar-actions">
          <div className="actions-header">
            <span className="actions-title">Quick Actions</span>
          </div>
          
          <button 
            className="action-btn expense-btn"
            onClick={() => setShowExpenseForm(true)}
          >
            <span className="action-icon">💸</span>
            <span className="action-label">Add Expense</span>
          </button>
          
          <button 
            className="action-btn driver-btn"
            onClick={() => setShowDriverForm(true)}
          >
            <span className="action-icon">🚌</span>
            <span className="action-label">Add Driver Salary</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="btn-icon">🚪</span>
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {children}
      </main>

      {/* Forms */}
      {showExpenseForm && (
        <ExpenseForm 
          onClose={() => setShowExpenseForm(false)}
          onSuccess={handleExpenseSuccess}
        />
      )}

      {showDriverForm && (
        <DriverSalaryForm 
          onClose={() => setShowDriverForm(false)}
          onSuccess={handleDriverSuccess}
        />
      )}
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
