import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SubscriptionPaymentModal from '../SubscriptionPaymentModal';
import './SupervisorDashboard.css';

const SupervisorDashboard = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  
  const [returnDate, setReturnDate] = useState('');
  const [firstAppointmentCount, setFirstAppointmentCount] = useState(0);
  const [secondAppointmentCount, setSecondAppointmentCount] = useState(0);
  const [activeTab, setActiveTab] = useState('qr-scanner');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedStudent, setScannedStudent] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [scanError, setScanError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [paymentData, setPaymentData] = useState({
    email: '',
    paymentMethod: 'credit_card',
    amount: ''
  });

  // Real data states
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 150,
    activeSubscriptions: 120,
    todayAttendanceRate: 85,
    pendingSubscriptions: 5,
    openTickets: 3,
    monthlyRevenue: 15000
  });
  const [todayAttendance, setTodayAttendance] = useState([
    { id: 1, studentName: 'أحمد محمد', email: 'ahmed@example.com', time: '08:30', status: 'Present' },
    { id: 2, studentName: 'فاطمة علي', email: 'fatima@example.com', time: '08:35', status: 'Present' },
    { id: 3, studentName: 'محمد حسن', email: 'mohamed@example.com', time: '08:40', status: 'Present' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);

  // Get user from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }, []);

  const handleQRCodeScan = (result) => {
    try {
      const studentData = JSON.parse(result);
      setScannedStudent(studentData);
      setShowStudentDetails(true);
      setScanError('');
    } catch (error) {
      setScanError('Invalid QR code format');
    }
  };

  const handleAttendanceRegistration = () => {
    if (!scannedStudent) {
      setScanError('لا يوجد طالب محدد للتسجيل');
      return;
    }

    console.log('تسجيل حضور الطالب:', scannedStudent);
    
    // Show success message
    setScanError('');
    alert(`تم تسجيل حضور ${scannedStudent.name || scannedStudent.email} بنجاح!`);
    
    // Add to today's attendance
    const newRecord = {
      id: Date.now(),
      studentName: scannedStudent.name || 'طالب',
      email: scannedStudent.email,
      time: new Date().toLocaleTimeString('ar-EG'),
      status: 'Present'
    };
    setTodayAttendance(prev => [newRecord, ...prev]);
    
    // Clear scanned student
    setScannedStudent(null);
    setShowStudentDetails(false);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    console.log('Payment submitted:', paymentData);
    setShowPaymentForm(false);
    alert('Payment processed successfully!');
  };

  if (loading) {
    return (
      <div className="supervisor-dashboard">
        <div className="loading-container">
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="supervisor-dashboard">
        <div className="error-container">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="supervisor-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Supervisor Dashboard</h1>
          <p>Manage student attendance, QR scanning, and return schedules</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => router.push('/admin/attendance')}
          >
            <span className="btn-icon">👥</span>
            Student Attendance
          </button>
          <button className="btn-secondary">
            <span className="btn-icon">📊</span>
            Export Report
          </button>
          <button className="btn-secondary">
            <span className="btn-icon">⚙️</span>
            Settings
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{dashboardStats.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{dashboardStats.activeSubscriptions}</h3>
            <p>Active Subscriptions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{dashboardStats.todayAttendanceRate}%</h3>
            <p>Today's Attendance</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>${dashboardStats.monthlyRevenue}</h3>
            <p>Monthly Revenue</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'qr-scanner' ? 'active' : ''}`}
          onClick={() => setActiveTab('qr-scanner')}
        >
          <span className="tab-icon">📱</span>
          QR Scanner
        </button>
        <button 
          className={`nav-tab ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <span className="tab-icon">📋</span>
          Attendance Records
        </button>
        <button 
          className={`nav-tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <span className="tab-icon">🕒</span>
          Return Schedule
        </button>
        <button 
          className={`nav-tab ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          <span className="tab-icon">💳</span>
          Payment Processing
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'qr-scanner' && (
          <div className="qr-scanner-container">
            <h2>QR Code Scanner</h2>
            <div className="scanner-section">
              <div className="scanner-placeholder">
                <div className="qr-frame">
                  <div className="scan-line"></div>
                  <p>Position QR code within the frame</p>
                </div>
                <button 
                  className="scan-btn"
                  onClick={() => {
                    // Simulate QR scan for demo
                    const mockStudent = {
                      name: 'أحمد محمد علي',
                      email: 'ahmed@student.edu',
                      id: 'STU-' + Date.now(),
                      college: 'كلية الهندسة',
                      grade: 'السنة الثالثة'
                    };
                    handleQRCodeScan(JSON.stringify(mockStudent));
                  }}
                >
                  📱 Simulate Scan
                </button>
              </div>
              
              {scanError && (
                <div className="error-message">
                  <p>{scanError}</p>
                </div>
              )}
              
              {scannedStudent && showStudentDetails && (
                <div className="student-details-modal">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h3>Student Details</h3>
                      <button 
                        className="close-btn"
                        onClick={() => setShowStudentDetails(false)}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="student-info">
                      <p><strong>Name:</strong> {scannedStudent.name}</p>
                      <p><strong>Email:</strong> {scannedStudent.email}</p>
                      <p><strong>ID:</strong> {scannedStudent.id}</p>
                      <p><strong>College:</strong> {scannedStudent.college}</p>
                      <p><strong>Grade:</strong> {scannedStudent.grade}</p>
                    </div>
                    <div className="action-buttons">
                      <button 
                        className="action-btn attendance-btn"
                        onClick={handleAttendanceRegistration}
                      >
                        ✅ Register Attendance
                      </button>
                      <button 
                        className="action-btn payment-btn"
                        onClick={() => setShowPaymentForm(true)}
                      >
                        💳 Process Payment
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="attendance-section">
            <h2>Today's Attendance Records</h2>
            <div className="attendance-table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAttendance.map((record) => (
                    <tr key={record.id}>
                      <td>{record.studentName}</td>
                      <td>{record.email}</td>
                      <td>{record.time}</td>
                      <td>
                        <span className={`status ${record.status.toLowerCase()}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="schedule-section">
            <h2>Return Schedule Management</h2>
            <div className="schedule-form">
              <div className="form-group">
                <label htmlFor="returnDate">Return Date:</label>
                <input
                  type="date"
                  id="returnDate"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
              <div className="appointment-counts">
                <div className="appointment-group">
                  <label>First Appointment:</label>
                  <input
                    type="number"
                    value={firstAppointmentCount}
                    onChange={(e) => setFirstAppointmentCount(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="appointment-group">
                  <label>Second Appointment:</label>
                  <input
                    type="number"
                    value={secondAppointmentCount}
                    onChange={(e) => setSecondAppointmentCount(e.target.value)}
                    min="0"
                  />
                </div>
              </div>
              <button className="schedule-btn">
                📅 Update Schedule
              </button>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="payment-section">
            <h2>Payment Processing</h2>
            <div className="payment-info">
              <p>Process subscription payments and manage student accounts</p>
              <button 
                className="payment-btn"
                onClick={() => setShowPaymentForm(true)}
              >
                💳 New Payment
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentForm && (
        <SubscriptionPaymentModal
          onClose={() => setShowPaymentForm(false)}
          onSubmit={handlePaymentSubmit}
          paymentData={paymentData}
          setPaymentData={setPaymentData}
        />
      )}
    </div>
  );
};

export default SupervisorDashboard;