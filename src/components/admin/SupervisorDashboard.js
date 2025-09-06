import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import QrScanner from 'qr-scanner';
import './SupervisorDashboard.css';

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  
  const [returnDate, setReturnDate] = useState('');
  const [firstAppointmentCount, setFirstAppointmentCount] = useState(0);
  const [secondAppointmentCount, setSecondAppointmentCount] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
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
    totalStudents: 0,
    activeSubscriptions: 0,
    todayAttendanceRate: 0,
    pendingSubscriptions: 0,
    openTickets: 0,
    monthlyRevenue: 0
  });
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Initialize QR Scanner
  useEffect(() => {
    // Get available cameras
    QrScanner.listCameras(true).then(cameras => {
      setCameras(cameras);
      if (cameras.length > 0) {
        setSelectedCamera(cameras[0].id);
      }
    }).catch(err => {
      console.error('Error listing cameras:', err);
      setScanError('No cameras available');
    });

    return () => {
      // Cleanup scanner on unmount
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardStats();
    fetchTodayAttendance();
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
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/attendance/today', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTodayAttendance(data.records || []);
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      setIsScanning(true);
      setScanError('');
      
      // Create QR scanner instance
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleQRCodeScanned(result.data),
        {
          onDecodeError: (err) => {
            // Don't show decode errors as they're normal during scanning
            console.log('Decode error (normal):', err);
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: selectedCamera || 'environment'
        }
      );

      await qrScannerRef.current.start();
      setActiveTab('qr-scanner');
      
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      setScanError('Failed to start camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleQRCodeScanned = async (qrData) => {
    console.log('QR Code scanned:', qrData);
    
    try {
      // Parse QR code data
      const studentData = JSON.parse(qrData);
      
      // Verify this is a valid student QR code
      if (!studentData.studentId || !studentData.id) {
        setScanError('Invalid QR code format');
        return;
      }

      // Fetch student details from backend
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/students/${studentData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setScannedStudent({
          id: data.student._id,
          studentId: data.student.studentId,
          name: data.student.fullName,
          email: data.student.userId?.email,
          college: data.student.college,
          grade: data.student.grade,
          photo: data.student.profilePhoto,
          attendanceRate: data.student.attendanceStats?.attendanceRate || 0,
          subscription: data.subscription,
          recentAttendance: data.recentAttendance
        });
        
        stopScanning();
        setActiveTab('student-details');
      } else {
        setScanError('Student not found in database');
      }
      
    } catch (error) {
      console.error('Error processing QR code:', error);
      setScanError('Invalid QR code or server error');
    }
  };

  const handleAttendanceRegistration = async () => {
    try {
      const token = localStorage.getItem('token');
      const attendanceData = {
        qrData: JSON.stringify({
          id: scannedStudent.id,
          studentId: scannedStudent.studentId,
          name: scannedStudent.name
        }),
        appointmentSlot: 'first', // You can make this dynamic
        stationName: 'Main Station',
        stationLocation: 'Campus Entrance',
        coordinates: '30.0444,31.2357'
      };

      const response = await fetch('http://localhost:5000/api/attendance/scan-qr', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(attendanceData)
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Attendance registered successfully for ${scannedStudent.name}`);
        fetchTodayAttendance(); // Refresh attendance data
        fetchDashboardStats(); // Refresh stats
      } else {
        alert(result.message || 'Failed to register attendance');
      }
    } catch (error) {
      console.error('Error registering attendance:', error);
      alert('Error registering attendance');
    }
  };

  const switchCamera = async () => {
    if (cameras.length > 1) {
      const currentIndex = cameras.findIndex(cam => cam.id === selectedCamera);
      const nextIndex = (currentIndex + 1) % cameras.length;
      const nextCamera = cameras[nextIndex];
      
      setSelectedCamera(nextCamera.id);
      
      if (qrScannerRef.current) {
        await qrScannerRef.current.setCamera(nextCamera.id);
      }
    }
  };

  const toggleFlash = async () => {
    if (qrScannerRef.current) {
      try {
        await qrScannerRef.current.toggleFlash();
      } catch (error) {
        console.error('Flash not supported:', error);
      }
    }
  };

  // Calculate attendance statistics
  const presentStudents = todayAttendance.filter(s => s.status === 'Present').length;
  const lateStudents = todayAttendance.filter(s => s.status === 'Late').length;
  const absentStudents = todayAttendance.filter(s => s.status === 'Absent').length;
  const totalAttendanceToday = todayAttendance.length;

  const incrementFirst = () => setFirstAppointmentCount(firstAppointmentCount + 1);
  const decrementFirst = () => setFirstAppointmentCount(Math.max(0, firstAppointmentCount - 1));
  const incrementSecond = () => setSecondAppointmentCount(secondAppointmentCount + 1);
  const decrementSecond = () => setSecondAppointmentCount(Math.max(0, secondAppointmentCount - 1));

  const handleSubscriptionPayment = () => {
    setShowPaymentForm(true);
    setPaymentData({ ...paymentData, email: scannedStudent.email });
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    alert(`Payment of $${paymentData.amount} processed successfully for ${scannedStudent.name}`);
    setShowPaymentForm(false);
    setPaymentData({ email: '', paymentMethod: 'credit_card', amount: '' });
    fetchDashboardStats();
  };

  const handleBackToScanner = () => {
    setScannedStudent(null);
    setShowPaymentForm(false);
    setScanError('');
    setActiveTab('qr-scanner');
  };

  const handleBackToOverview = () => {
    setScannedStudent(null);
    setShowPaymentForm(false);
    setScanError('');
    stopScanning();
    setActiveTab('overview');
  };

  if (loading) {
    return (
      <div className="supervisor-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
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
          <button onClick={fetchDashboardStats} className="retry-btn">
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
          <button className="btn-primary">
            <span className="btn-icon">📊</span>
            Export Report
          </button>
          <button className="btn-secondary">
            <span className="btn-icon">⚙️</span>
            Settings
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{dashboardStats.totalStudents}</div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{presentStudents}</div>
            <div className="stat-label">Present Today</div>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-value">{lateStudents}</div>
            <div className="stat-label">Late Today</div>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{dashboardStats.todayAttendanceRate}%</div>
            <div className="stat-label">Attendance Rate</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`nav-tab ${activeTab === 'qr-scanner' ? 'active' : ''}`}
          onClick={() => setActiveTab('qr-scanner')}
        >
          📱 QR Scanner
        </button>
        <button 
          className={`nav-tab ${activeTab === 'return-schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('return-schedule')}
        >
          🕒 Return Schedule
        </button>
        {scannedStudent && (
          <button 
            className={`nav-tab ${activeTab === 'student-details' ? 'active' : ''}`}
            onClick={() => setActiveTab('student-details')}
          >
            👤 Student Details
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="content-grid">
              <div className="content-card qr-scanner-card">
                <div className="card-header">
                  <span className="card-icon">📱</span>
                  <h3>QR Code Scanner</h3>
                </div>
                <div className="scanner-interface">
                  <div className="scanner-placeholder">
                    <div className="scanner-icon">📲</div>
                    <p>Scanner Ready</p>
                  </div>
                  <button className="scan-button" onClick={startScanning}>
                    <span className="btn-icon">📷</span>
                    Start Scanning
                  </button>
                </div>
                <div className="scanner-stats">
                  <div className="stat-item">
                    <span className="stat-number">{totalAttendanceToday}</span>
                    <span className="stat-text">Scanned Today</span>
                  </div>
                </div>
              </div>

              <div className="content-card student-list-card">
                <div className="card-header">
                  <span className="card-icon">👥</span>
                  <h3>Today's Attendance</h3>
                  <button onClick={fetchTodayAttendance} className="refresh-btn">
                    🔄 Refresh
                  </button>
                </div>
                <div className="student-list">
                  {todayAttendance.length > 0 ? (
                    todayAttendance.slice(0, 6).map((attendance, index) => (
                      <div key={index} className={`student-item ${attendance.status.toLowerCase()}`}>
                        <div className="student-avatar">
                          {attendance.studentId?.fullName ? attendance.studentId.fullName.charAt(0) : 'S'}
                        </div>
                        <div className="student-info">
                          <div className="student-name">
                            {attendance.studentId?.fullName || 'Unknown Student'}
                          </div>
                          <div className="student-status">
                            <span className={`status-badge ${attendance.status.toLowerCase()}`}>
                              {attendance.status}
                            </span>
                            <span className="student-time">
                              {attendance.checkInTime ? 
                                new Date(attendance.checkInTime).toLocaleTimeString() : 
                                'N/A'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-attendance">
                      <p>No attendance records for today</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'qr-scanner' && (
          <div className="qr-scanner-content">
            <div className="scanner-fullscreen">
              <div className="scanner-header">
                <h3>QR Code Scanner</h3>
                <p>Point camera at student QR code to scan</p>
                {scanError && (
                  <div className="scan-error" style={{ color: 'red', marginTop: '10px' }}>
                    {scanError}
                  </div>
                )}
              </div>
              
              <div className="scanner-video-container">
                <video 
                  ref={videoRef}
                  className="scanner-video"
                  style={{
                    width: '100%',
                    maxWidth: '500px',
                    height: 'auto',
                    borderRadius: '12px'
                  }}
                />
                {!isScanning && (
                  <div className="scanner-overlay">
                    <button className="start-scan-btn" onClick={startScanning}>
                      Start Camera
                    </button>
                  </div>
                )}
              </div>
              
              <div className="scanner-controls">
                <button className="control-btn" onClick={switchCamera} disabled={cameras.length <= 1}>
                  <span className="btn-icon">📷</span>
                  Switch Camera
                </button>
                <button className="control-btn" onClick={toggleFlash}>
                  <span className="btn-icon">💡</span>
                  Flash
                </button>
                <button className="control-btn" onClick={handleBackToOverview}>
                  <span className="btn-icon">❌</span>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'student-details' && scannedStudent && (
          <div className="student-details-content">
            <div className="student-profile">
              <div className="profile-header">
                <button className="back-btn" onClick={handleBackToScanner}>
                  <span className="btn-icon">←</span>
                  Back to Scanner
                </button>
                <h3>Student Information</h3>
              </div>
              
              <div className="profile-content">
                <div className="student-photo-section">
                  <div className="student-photo">
                    {scannedStudent.photo ? (
                      <img 
                        src={`http://localhost:5000${scannedStudent.photo}`} 
                        alt={scannedStudent.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="photo-fallback">
                      {scannedStudent.name ? scannedStudent.name.charAt(0) : 'S'}
                    </div>
                  </div>
                  <div className="student-basic-info">
                    <h2>{scannedStudent.name}</h2>
                    <p className="student-email">{scannedStudent.email}</p>
                    <div className="student-details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Student ID:</span>
                        <span className="detail-value">{scannedStudent.studentId}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">College:</span>
                        <span className="detail-value">{scannedStudent.college}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Grade:</span>
                        <span className="detail-value">{scannedStudent.grade}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Attendance Rate:</span>
                        <span className="detail-value">{scannedStudent.attendanceRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="action-buttons">
                  <button className="action-btn attendance-btn" onClick={handleAttendanceRegistration}>
                    <span className="btn-icon">✅</span>
                    Register Attendance
                  </button>
                  <button className="action-btn payment-btn" onClick={handleSubscriptionPayment}>
                    <span className="btn-icon">💳</span>
                    Subscription Payment
                  </button>
                </div>
              </div>
            </div>

            {showPaymentForm && (
              <div className="payment-form-overlay">
                <div className="payment-form">
                  <div className="payment-header">
                    <h4>Subscription Payment</h4>
                    <button 
                      className="close-payment-btn"
                      onClick={() => setShowPaymentForm(false)}
                    >
                      ×
                    </button>
                  </div>
                  
                  <form onSubmit={handlePaymentSubmit}>
                    <div className="form-group">
                      <label htmlFor="paymentEmail">Email</label>
                      <input
                        type="email"
                        id="paymentEmail"
                        value={paymentData.email}
                        onChange={(e) => setPaymentData({...paymentData, email: e.target.value})}
                        required
                        className="payment-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="paymentMethod">Payment Method</label>
                      <select
                        id="paymentMethod"
                        value={paymentData.paymentMethod}
                        onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                        className="payment-input"
                      >
                        <option value="credit_card">Credit Card</option>
                        <option value="debit_card">Debit Card</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cash">Cash</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="paymentAmount">Amount ($)</label>
                      <input
                        type="number"
                        id="paymentAmount"
                        value={paymentData.amount}
                        onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                        className="payment-input"
                      />
                    </div>
                    
                    <div className="payment-actions">
                      <button type="button" className="cancel-payment-btn" onClick={() => setShowPaymentForm(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="confirm-payment-btn">
                        Confirm Payment
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'return-schedule' && (
          <div className="return-schedule-content">
            <div className="schedule-header">
              <h3>Return Schedule Management</h3>
              <p>Set and manage student return dates and appointment slots</p>
            </div>
            
            <div className="schedule-form">
              <div className="form-group">
                <label htmlFor="returnDate">Return Date</label>
                <div className="input-group">
                  <input
                    type="date"
                    id="returnDate"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="date-input"
                  />
                  <button className="add-date-btn">
                    <span className="btn-icon">➕</span>
                    Add Date
                  </button>
                </div>
              </div>
            </div>

            <div className="appointment-slots">
              <h4>Appointment Slots</h4>
              <div className="slots-container">
                <div className="appointment-slot first-slot">
                  <div className="slot-header">
                    <span className="slot-time">2:50 PM</span>
                    <span className="slot-label">First Appointment</span>
                  </div>
                  <div className="slot-counter">
                    <button onClick={decrementFirst} className="counter-btn">
                      <span>−</span>
                    </button>
                    <span className="counter-value">{firstAppointmentCount}</span>
                    <button onClick={incrementFirst} className="counter-btn">
                      <span>+</span>
                    </button>
                  </div>
                  <div className="slot-status">
                    {firstAppointmentCount > 0 ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="appointment-slot second-slot">
                  <div className="slot-header">
                    <span className="slot-time">4:00 PM</span>
                    <span className="slot-label">Second Appointment</span>
                  </div>
                  <div className="slot-counter">
                    <button onClick={decrementSecond} className="counter-btn">
                      <span>−</span>
                    </button>
                    <span className="counter-value">{secondAppointmentCount}</span>
                    <button onClick={incrementSecond} className="counter-btn">
                      <span>+</span>
                    </button>
                  </div>
                  <div className="slot-status">
                    {secondAppointmentCount > 0 ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorDashboard;
