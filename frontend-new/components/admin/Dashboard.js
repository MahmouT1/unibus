import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);

  console.log('Dashboard component rendering');

  useEffect(() => {
    // Get user from localStorage (only on client side)
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, []);
  
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>Manage your travel administration system</p>
      <div style={{ background: '#e5f3ff', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
        <h3>Dashboard Content</h3>
        <p>This is the main dashboard content area.</p>
        <p>Current time: {new Date().toLocaleString()}</p>
      </div>

      <section className="cards">
        <div className="card" onClick={() => window.location.href = '/admin/attendance'} style={{cursor: 'pointer'}}>
          <div className="card-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h3>ِAttendance</h3>
          <p>Track student attendance</p>
        </div>
        <div className="card" onClick={() => window.location.href = '/admin/subscription-management'} style={{cursor: 'pointer'}}>
          <div className="card-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 3h-1a4 4 0 0 0-8 0H6"></path>
            </svg>
          </div>
          <h3>Subscriptions</h3>
          <p>Manage student subscriptions</p>
        </div>
        <div className="card" onClick={() => window.location.href = '/admin/reports'} style={{cursor: 'pointer'}}>
          <div className="card-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="20" x2="12" y2="10"></line>
              <line x1="18" y1="20" x2="18" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="16"></line>
            </svg>
          </div>
          <h3>Reports</h3>
          <p>View analytics and reports</p>
        </div>
        <div className="card" onClick={() => window.location.href = '/admin/supervisor-dashboard'} style={{cursor: 'pointer'}}>
          <div className="card-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"></path>
              <path d="M6 20v-2c0-2.21 3.58-4 6-4s6 1.79 6 4v2"></path>
            </svg>
          </div>
          <h3>Supervisor Dashboard</h3>
          <p>Manage attendance and return schedules</p>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;
