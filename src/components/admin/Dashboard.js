import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    activeSubscriptions: 0,
    todayAttendanceRate: 0,
    pendingSubscriptions: 0,
    openTickets: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  console.log('Dashboard component rendering');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data.stats);
      } else {
        setError('Failed to fetch dashboard statistics');
        console.error('API Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };
  
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>Manage your travel administration system</p>
      <div style={{ background: '#e5f3ff', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
        <h3>Dashboard Content</h3>
        <p>This is the main dashboard content area.</p>
        <p>Current time: {new Date().toLocaleString()}</p>
        {loading && <p>Loading dashboard statistics...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
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
          <h3>Attendance</h3>
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

      <section className="summary-stats">
        <div className="stat blue">
          <div className="stat-label">Total Students</div>
          <div className="stat-value">
            {loading ? '...' : error ? 'Error' : formatNumber(dashboardStats.totalStudents)}
          </div>
        </div>
        <div className="stat green">
          <div className="stat-label">Active Subscriptions</div>
          <div className="stat-value">
            {loading ? '...' : error ? 'Error' : formatNumber(dashboardStats.activeSubscriptions)}
          </div>
        </div>
        <div className="stat purple">
          <div className="stat-label">Today's Attendance</div>
          <div className="stat-value">
            {loading ? '...' : error ? 'Error' : `${dashboardStats.todayAttendanceRate}%`}
          </div>
        </div>
      </section>

      {/* Additional Stats Section */}
      {!loading && !error && (
        <section className="additional-stats" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div className="stat orange" style={{ padding: '15px', borderRadius: '8px', background: '#fff3cd', textAlign: 'center' }}>
            <div className="stat-label">Pending Subscriptions</div>
            <div className="stat-value">{dashboardStats.pendingSubscriptions}</div>
          </div>
          <div className="stat red" style={{ padding: '15px', borderRadius: '8px', background: '#f8d7da', textAlign: 'center' }}>
            <div className="stat-label">Open Tickets</div>
            <div className="stat-value">{dashboardStats.openTickets}</div>
          </div>
          <div className="stat teal" style={{ padding: '15px', borderRadius: '8px', background: '#d1ecf1', textAlign: 'center' }}>
            <div className="stat-label">Monthly Revenue</div>
            <div className="stat-value">${formatNumber(dashboardStats.monthlyRevenue)}</div>
          </div>
        </section>
      )}

      {/* Refresh Button */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button 
          onClick={fetchDashboardStats}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Loading...' : 'Refresh Stats'}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
