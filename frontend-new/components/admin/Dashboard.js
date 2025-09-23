import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './Dashboard.css';

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalAttendance: 0,
    activeShifts: 0,
    todayAttendance: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [shiftIndicator, setShiftIndicator] = useState(null);

  console.log('Dashboard component rendering');

  useEffect(() => {
    // Get user from localStorage (only on client side)
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      loadDashboardData();
      
      // Auto-refresh shift data every 30 seconds
      const interval = setInterval(() => {
        loadDashboardData();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, []);

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('student');
    sessionStorage.clear();
    
    // Redirect to login page
    router.push('/auth');
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load students count
      const studentsResponse = await fetch('/api/students/profile-simple?admin=true');
      const studentsData = await studentsResponse.json();
      
      // Load attendance records
      const attendanceResponse = await fetch('/api/attendance/all-records?limit=50');
      const attendanceData = await attendanceResponse.json();
      
      // Load shifts
      const shiftsResponse = await fetch('/api/shifts?limit=20');
      const shiftsData = await shiftsResponse.json();
      
      // Calculate stats
      const totalStudents = studentsData.success ? Object.keys(studentsData.students || {}).length : 0;
      const totalAttendance = attendanceData.success ? attendanceData.pagination.totalRecords : 0;
      const activeShifts = shiftsData.success ? shiftsData.shifts.filter(shift => shift.status === 'open').length : 0;
      
      // Update shift indicator
      if (shiftsData.success && shiftsData.shifts && shiftsData.shifts.length > 0) {
        const openShifts = shiftsData.shifts.filter(shift => shift.status === 'open');
        if (openShifts.length > 0) {
          setShiftIndicator({
            isActive: true,
            count: openShifts.length,
            shifts: openShifts
          });
        } else {
          setShiftIndicator(null);
        }
      } else {
        setShiftIndicator(null);
      }
      const todayAttendance = attendanceData.success ? 
        attendanceData.records.filter(record => 
          new Date(record.scanTime).toDateString() === new Date().toDateString()
        ).length : 0;
      
      const recentActivity = attendanceData.success ? 
        attendanceData.records.slice(0, 5).map(record => ({
          student: record.studentName,
          time: new Date(record.scanTime).toLocaleString(),
          location: record.location
        })) : [];

      setDashboardData({
        totalStudents,
        totalAttendance,
        activeShifts,
        todayAttendance,
        recentActivity
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="dashboard" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', color: '#6b7280' }}>Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="dashboard" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Manage your student transportation system</p>
          {user && (
            <p style={{ color: '#4a5568', margin: '10px 0 0 0' }}>Welcome, {user.email}! Role: {user.role}</p>
          )}
        </div>
        
        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          style={{
            background: 'linear-gradient(135deg, #e53e3e, #c53030)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(229, 62, 62, 0.3)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(229, 62, 62, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(229, 62, 62, 0.3)';
          }}
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>

      {/* Shift Indicator - Large Green Box */}
      {shiftIndicator && shiftIndicator.isActive && (
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
          border: '2px solid #10b981',
          animation: 'pulse 2s infinite'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
                🟢 ACTIVE SHIFTS DETECTED
              </h2>
              <p style={{ margin: '0', fontSize: '16px', opacity: '0.9' }}>
                {shiftIndicator.count} supervisor{shiftIndicator.count > 1 ? 's' : ''} currently working
              </p>
              <div style={{ marginTop: '10px', fontSize: '14px', opacity: '0.8' }}>
                {shiftIndicator.shifts.map((shift, index) => (
                  <div key={index} style={{ marginBottom: '4px' }}>
                    • {shift.supervisorName || 'Supervisor'} - {shift.shiftType || 'Shift'} (Started: {new Date(shift.shiftStart || shift.startTime).toLocaleTimeString()})
                  </div>
                ))}
              </div>
            </div>
            <div style={{ fontSize: '48px', opacity: '0.8' }}>
              🔄
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#f0fff4', border: '2px solid #48bb78', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ color: '#22543d', margin: '0 0 10px 0', fontSize: '1.5rem' }}>👥 Total Students</h3>
          <p style={{ color: '#2d3748', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{dashboardData.totalStudents}</p>
        </div>
        
        <div style={{ background: '#f0f9ff', border: '2px solid #3b82f6', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ color: '#1e40af', margin: '0 0 10px 0', fontSize: '1.5rem' }}>📅 Total Attendance</h3>
          <p style={{ color: '#2d3748', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{dashboardData.totalAttendance}</p>
        </div>
        
        <div style={{ background: '#fff5f5', border: '2px solid #ed8936', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ color: '#c05621', margin: '0 0 10px 0', fontSize: '1.5rem' }}>⏰ Active Shifts</h3>
          <p style={{ color: '#2d3748', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{dashboardData.activeShifts}</p>
        </div>
        
        <div style={{ background: '#f0fff4', border: '2px solid #48bb78', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ color: '#22543d', margin: '0 0 10px 0', fontSize: '1.5rem' }}>📊 Today's Attendance</h3>
          <p style={{ color: '#2d3748', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{dashboardData.todayAttendance}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ background: '#f7fafc', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ color: '#2d3748', margin: '0 0 15px 0' }}>📈 Recent Activity</h3>
        {dashboardData.recentActivity.length > 0 ? (
          <div>
            {dashboardData.recentActivity.map((activity, index) => (
              <div key={index} style={{ 
                background: 'white', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                padding: '15px', 
                margin: '10px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{activity.student}</strong>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{activity.location}</div>
                </div>
                <div style={{ color: '#4a5568', fontSize: '0.9rem' }}>{activity.time}</div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>No recent activity</p>
        )}
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

    </div>
  );
};

export default Dashboard;
