import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  
  console.log('AdminLayout rendered, current location:', location.pathname);
  console.log('Outlet should render content for:', location.pathname);

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="admin-user">
          <div className="user-icon">👤</div>
          <div>
            <div className="user-name">Admin User</div>
            <div className="user-role">Administrator</div>
          </div>
        </div>
        <nav className="admin-nav">
          <Link to="/admin/dashboard" className={location.pathname === '/admin/dashboard' ? 'active' : ''}>
            Dashboard
          </Link>
          <Link to="/admin/attendance" className={location.pathname === '/admin/attendance' ? 'active' : ''}>
            Attendance
          </Link>
          <Link to="/admin/reports" className={location.pathname === '/admin/reports' ? 'active' : ''}>
            Reports
          </Link>
          <Link to="/admin/subscription-management" className={location.pathname === '/admin/subscription-management' ? 'active' : ''}>
            Subscriptions
          </Link>
          <Link to="/admin/supervisor-dashboard" className={location.pathname === '/admin/supervisor-dashboard' ? 'active' : ''}>
            Supervisor
          </Link>
        </nav>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-title">X Travel <span className="badge">Admin Dashboard</span></div>
          <div className="admin-header-right">
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
