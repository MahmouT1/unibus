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
    todayAttendance: 0
  });
  const [loading, setLoading] = useState(true);
  const [shiftIndicator, setShiftIndicator] = useState(null);
  const [showResetTermModal, setShowResetTermModal] = useState(false);
  const [resettingTerm, setResettingTerm] = useState(false);

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
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    localStorage.removeItem('student');
    sessionStorage.clear();
    
    // Full redirect to login page (ensures clean state)
    window.location.href = '/auth';
  };

    const handleResetTerm = async () => {
    try {
      setResettingTerm(true);
      const response = await fetch('/api/admin/reset-term', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        setShowResetTermModal(false);
        loadDashboardData();
        alert('تم بدء التيرم الجديد بنجاح! تم تصفير أيام الحضور فقط.');
      } else {
        alert(data.message || 'حدث خطأ أثناء بدء التيرم الجديد');
      }
    } catch (error) {
      console.error('Reset term error:', error);
      alert('حدث خطأ في الاتصال. تأكد من تشغيل السيرفر.');
    } finally {
      setResettingTerm(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load data in parallel
      const [studentsResponse, attendanceResponse, shiftsResponse] = await Promise.all([
        fetch('/api/students/profile-simple?admin=true'),
        fetch('/api/attendance/records?limit=1'), // Just to get total count
        fetch('/api/shifts?limit=20')
      ]);

      // Parse responses
      const studentsData = await studentsResponse.json();
      const attendanceData = await attendanceResponse.json();
      const shiftsData = await shiftsResponse.json();
      
      // Calculate stats
      const totalStudents = studentsData.success ? Object.keys(studentsData.students || {}).length : 0;
      const totalAttendance = attendanceData.success ? attendanceData.total : 0;
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

      // Calculate today's attendance (simplified without recent activity data)
      const todayAttendance = 0; // Will be calculated from actual attendance data if needed

      setDashboardData({
        totalStudents,
        totalAttendance,
        activeShifts,
        todayAttendance
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
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* بدء تيرم جديد */}
          <button 
            onClick={() => setShowResetTermModal(true)}
            style={{
              background: 'linear-gradient(135deg, #3182ce, #2c5282)',
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
              boxShadow: '0 4px 12px rgba(49, 130, 206, 0.3)'
            }}
          >
            <span>📅</span>
            <span>بدء تيرم جديد</span>
          </button>
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
      </div>

      {/* نافذة تأكيد بدء التيرم الجديد */}
      {showResetTermModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => !resettingTerm && setShowResetTermModal(false)}>
          <div style={{
            background: 'white',
            padding: '28px',
            borderRadius: '12px',
            maxWidth: '420px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 12px 0', color: '#1a202c', fontSize: '1.25rem' }}>
              ⚠️ تأكيد بدء تيرم جديد
            </h3>
            <p style={{ color: '#4a5568', margin: '0 0 20px 0', lineHeight: 1.6 }}>
              سيتم تصفير <strong>أيام الحضور فقط</strong> لجميع الطلاب. لن يتم حذف الحسابات أو بيانات الطلاب أو الاشتراكات.
            </p>
            <p style={{ color: '#718096', margin: '0 0 20px 0', fontSize: '0.9rem' }}>
              هل أنت متأكد من المتابعة؟
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => !resettingTerm && setShowResetTermModal(false)}
                disabled={resettingTerm}
                style={{
                  padding: '10px 20px',
                  border: '2px solid #cbd5e0',
                  background: 'white',
                  borderRadius: '8px',
                  cursor: resettingTerm ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  color: '#4a5568'
                }}
              >
                إلغاء
              </button>
              <button
                onClick={handleResetTerm}
                disabled={resettingTerm}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: resettingTerm ? '#a0aec0' : 'linear-gradient(135deg, #3182ce, #2c5282)',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: resettingTerm ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                {resettingTerm ? 'جاري التنفيذ...' : 'تأكيد'}
              </button>
            </div>
          </div>
        </div>
      )}

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
        <div className="card" onClick={() => window.location.href = '/admin/subscriptions'} style={{cursor: 'pointer'}}>
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
        <div className="card" onClick={() => window.location.href = '/admin/transportation'} style={{cursor: 'pointer'}}>
          <div className="card-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="6" width="18" height="12" rx="2" ry="2"></rect>
              <circle cx="7" cy="12" r="1"></circle>
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="17" cy="12" r="1"></circle>
              <path d="M7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"></path>
            </svg>
          </div>
          <h3>Transportation</h3>
          <p>Manage bus schedules and stations</p>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;
