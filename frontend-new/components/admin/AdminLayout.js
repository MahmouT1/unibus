import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSwitcher from '../LanguageSwitcher';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const { t } = useLanguage();
  
  console.log('AdminLayout rendered, current location:', location.pathname);
  console.log('Outlet should render content for:', location.pathname);

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="admin-user">
          <div className="user-icon">👤</div>
          <div>
            <div className="user-name">{t('welcomeAdmin')}</div>
            <div className="user-role">Administrator</div>
          </div>
        </div>
        <nav className="admin-nav">
          <Link to="/admin/dashboard" className={location.pathname === '/admin/dashboard' ? 'active' : ''}>
            {t('dashboard')}
          </Link>
          <Link to="/admin/attendance" className={location.pathname === '/admin/attendance' ? 'active' : ''}>
            {t('attendanceManagement')}
          </Link>
          <Link to="/admin/reports" className={location.pathname === '/admin/reports' ? 'active' : ''}>
            {t('reports')}
          </Link>
          <Link to="/admin/subscriptions" className={location.pathname === '/admin/subscriptions' ? 'active' : ''}>
            {t('subscriptionManagement')}
          </Link>
          <Link to="/admin/supervisor-dashboard" className={location.pathname === '/admin/supervisor-dashboard' ? 'active' : ''}>
            {t('supervisorManagement')}
          </Link>
          <Link to="/admin/support" className={location.pathname === '/admin/support' ? 'active' : ''}>
            {t('supportManagement')}
          </Link>
        </nav>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-title">X Travel <span className="badge">{t('adminDashboard')}</span></div>
          <div className="admin-header-right">
            <LanguageSwitcher variant="admin" />
            <button className="icon-button" aria-label="Notifications">
              🔔<span className="notification-count">3</span>
            </button>
            <button className="icon-button" aria-label="User Profile">
              👤 Admin
            </button>
          </div>
        </header>
        <section className="admin-content">
          <div style={{ minHeight: '200px', padding: '20px' }}>
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;
