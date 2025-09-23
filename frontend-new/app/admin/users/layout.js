'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import ExpenseForm from '../../../components/admin/ExpenseForm';
import DriverSalaryForm from '../../../components/admin/DriverSalaryForm';
import { useLanguage } from '../../../lib/contexts/LanguageContext';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import '../admin-layout.css';

function AdminUsersLayoutContent({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
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
    sessionStorage.clear();
    router.push('/auth');
  };

  const handleExpenseSuccess = () => {
    window.location.reload();
  };

  const handleDriverSuccess = () => {
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

      <main className="admin-main">
        {children}
      </main>

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

export default function AdminUsersLayout({ children }) {
  return (
    <AdminUsersLayoutContent>
      {children}
    </AdminUsersLayoutContent>
  );
}
