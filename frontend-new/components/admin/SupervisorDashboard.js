import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import QrScanner from 'qr-scanner';
import SubscriptionPaymentModal from '../SubscriptionPaymentModal';
import './SupervisorDashboard.css';

const SupervisorDashboard = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  
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
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);

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
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchDashboardStats();
    fetchTodayAttendance();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/dashboard/stats', {
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
      const response = await fetch('http://localhost:3000/api/attendance/today', {
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

  const fetchAttendanceRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/attendance/records-simple?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data.attendance || []);
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    }
  };

  const deleteAttendanceRecord = async (attendanceId) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/attendance/delete/${attendanceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // eslint-disable-next-line no-unused-vars
        const data = await response.json();
        alert('Attendance record deleted successfully');
        fetchAttendanceRecords(); // Refresh the list
        fetchTodayAttendance(); // Refresh today's attendance
        fetchDashboardStats(); // Refresh stats
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete attendance record');
      }
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      alert('Error deleting attendance record');
    }
  };

  const viewStudentDetails = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/students/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedStudent(data.student);
        setShowStudentDetails(true);
      } else {
        alert('Failed to fetch student details');
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
      alert('Error fetching student details');
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

      // Use the QR code data directly since it contains real student information
      console.log('Using QR code data directly:', studentData);
      
      // Set the scanned student data from QR code
      setScannedStudent({
        id: studentData.id,
        studentId: studentData.studentId,
        name: studentData.fullName,
        email: studentData.email,
        phoneNumber: studentData.phoneNumber,
        college: studentData.college,
        grade: studentData.grade,
        major: studentData.major,
        address: studentData.address,
        photo: null, // QR codes don't contain photos
        attendanceRate: 95, // Default value
        subscription: {
          status: 'Active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        recentAttendance: [
          {
            date: new Date().toISOString(),
            status: 'Present',
            checkInTime: new Date().toISOString()
          }
        ]
      });
      
      stopScanning();
      setActiveTab('student-details');
      
    } catch (error) {
      console.error('Error processing QR code:', error);
      setScanError('Invalid QR code or server error');
    }
  };

  const handleAttendanceRegistration = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Prepare student data for attendance registration
      const studentData = {
        id: scannedStudent.id,
        fullName: scannedStudent.name,
        email: scannedStudent.email,
        phoneNumber: scannedStudent.phoneNumber,
        college: scannedStudent.college,
        grade: scannedStudent.grade,
        major: scannedStudent.major,
        address: scannedStudent.address
      };

      const attendanceData = {
        studentData: studentData,
        appointmentSlot: 'first', // You can make this dynamic
        stationName: 'Main Station',
        stationLocation: 'Campus Entrance',
        coordinates: '30.0444,31.2357',
        supervisorId: user.id || 'supervisor-001',
        supervisorName: user.fullName || 'Supervisor'
      };

      console.log('Registering attendance for:', studentData.fullName);

      const response = await fetch('http://localhost:3000/api/attendance/register-simple', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(attendanceData)
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Attendance registered successfully for ${studentData.fullName}!\n\nStudent: ${studentData.fullName}\nCollege: ${studentData.college}\nGrade: ${studentData.grade}\nTime: ${new Date().toLocaleTimeString()}`);
        console.log('Attendance record created:', result.attendance);
        
        fetchTodayAttendance(); // Refresh attendance data
        fetchDashboardStats(); // Refresh stats
        fetchAttendanceRecords(); // Refresh attendance records
        
        // Navigate to Student Attendance page to show updated data
        setTimeout(() => {
          router.push('/admin/attendance');
        }, 1500);
      } else {
        // Handle different error types with user-friendly messages
        let errorMessage = 'Failed to register attendance';
        
        if (result.message && result.message.includes('already registered')) {
          errorMessage = `⚠️ Student ${studentData.fullName} has already registered attendance for today.\n\nThis prevents duplicate registrations.\n\nIf this is a mistake, please contact the system administrator.`;
        } else if (result.message) {
          errorMessage = `❌ ${result.message}`;
        }
        
        alert(errorMessage);
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
  // eslint-disable-next-line no-unused-vars
  const absentStudents = todayAttendance.filter(s => s.status === 'Absent').length;
  const totalAttendanceToday = todayAttendance.length;

  const incrementFirst = () => setFirstAppointmentCount(firstAppointmentCount + 1);
  const decrementFirst = () => setFirstAppointmentCount(Math.max(0, firstAppointmentCount - 1));
  const incrementSecond = () => setSecondAppointmentCount(secondAppointmentCount + 1);
  const decrementSecond = () => setSecondAppointmentCount(Math.max(0, secondAppointmentCount - 1));

  const handleSubscriptionPayment = () => {
    setShowPaymentForm(true);
  };

  const handlePaymentComplete = (paymentResult) => {
    console.log('Payment completed:', paymentResult);
    setShowPaymentForm(false);
    // Refresh dashboard stats after payment
    fetchDashboardStats();
    // Show success message
    alert(`Payment of ${paymentResult.amount} EGP processed successfully for ${scannedStudent.name}`);
  };

  const handleBackToScanner = () => {
    setScannedStudent(null);
    setShowPaymentForm(false);
    setScanError('');
    setActiveTab('qr-scanner');
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


      {/* Navigation Tabs */}
      <div className="nav-tabs">
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
        <button 
          className={`nav-tab ${activeTab === 'attendance-management' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('attendance-management');
            fetchAttendanceRecords();
          }}
        >
          📋 Attendance Management
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
                <button className="control-btn" onClick={stopScanning}>
                  <span className="btn-icon">❌</span>
                  Stop
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
                        src={scannedStudent.photo || '/profile.png.png'} 
                        alt={scannedStudent.name}
                        onError={(e) => {
                          console.log('Photo load error:', e.target.src);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        onLoad={() => {
                          console.log('Photo loaded successfully:', scannedStudent.photo);
                        }}
                      />
                    ) : null}
                    <div className="photo-fallback" style={{ display: scannedStudent.photo ? 'none' : 'flex' }}>
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
                        <span className="detail-value">
                          {scannedStudent.grade ? scannedStudent.grade.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
                        </span>
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

            {/* Subscription Payment Modal */}
            <SubscriptionPaymentModal
              isOpen={showPaymentForm}
              onClose={() => setShowPaymentForm(false)}
              studentData={scannedStudent}
              onPaymentComplete={handlePaymentComplete}
            />
          </div>
        )}

        {activeTab === 'attendance-management' && (
          <div className="attendance-management-content">
            <div className="management-header">
              <h3>Attendance Management</h3>
              <p>Manage student attendance records and view detailed information</p>
              <button 
                className="refresh-btn"
                onClick={fetchAttendanceRecords}
              >
                🔄 Refresh Records
              </button>
            </div>
            
            <div className="attendance-table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Student ID</th>
                    <th>College</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Appointment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.length > 0 ? (
                    attendanceRecords.map((record, index) => (
                      <tr key={index} className={`attendance-row ${record.status.toLowerCase()}`}>
                        <td>
                          <div className="student-info">
                            <span className="student-name">
                              {record.studentId?.fullName || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td>{record.studentId?.studentId || 'N/A'}</td>
                        <td>{record.studentId?.college || 'N/A'}</td>
                        <td>
                          {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td>
                          {record.checkInTime ? 
                            new Date(record.checkInTime).toLocaleTimeString() : 'N/A'
                          }
                        </td>
                        <td>
                          <span className={`status-badge ${record.status.toLowerCase()}`}>
                            {record.status}
                          </span>
                        </td>
                        <td>
                          <span className="appointment-badge">
                            {record.appointmentSlot === 'first' ? 'First (8:00 AM)' : 'Second (2:00 PM)'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-btn view-btn"
                              onClick={() => viewStudentDetails(record.studentId?._id)}
                              title="View Student Details"
                            >
                              📁
                            </button>
                            <button 
                              className="action-btn delete-btn"
                              onClick={() => deleteAttendanceRecord(record._id)}
                              title="Delete Record"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="no-records">
                        No attendance records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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

      {/* Student Details Modal */}
      {showStudentDetails && selectedStudent && (
        <div className="modal-overlay">
          <div className="student-details-modal">
            <div className="modal-header">
              <h3>Student File Details</h3>
              <button 
                className="close-modal-btn"
                onClick={() => {
                  setShowStudentDetails(false);
                  setSelectedStudent(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="student-profile-section">
                <div className="student-photo-large">
                  {selectedStudent.profilePhoto ? (
                    <img 
                      src={selectedStudent.profilePhoto.startsWith('http') ? 
                        selectedStudent.profilePhoto : 
                        selectedStudent.profilePhoto || '/profile.png.png'} 
                      alt={selectedStudent.fullName}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="photo-fallback-large" style={{ display: selectedStudent.profilePhoto ? 'none' : 'flex' }}>
                    {selectedStudent.fullName ? selectedStudent.fullName.charAt(0) : 'S'}
                  </div>
                </div>
                
                <div className="student-info-detailed">
                  <h2>{selectedStudent.fullName}</h2>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Student ID:</span>
                      <span className="info-value">{selectedStudent.studentId}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">College:</span>
                      <span className="info-value">{selectedStudent.college}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Grade:</span>
                      <span className="info-value">
                        {selectedStudent.grade ? selectedStudent.grade.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Major:</span>
                      <span className="info-value">{selectedStudent.major || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Status:</span>
                      <span className={`status-badge ${selectedStudent.status?.toLowerCase()}`}>
                        {selectedStudent.status}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Attendance Rate:</span>
                      <span className="info-value">{selectedStudent.attendanceStats?.attendanceRate || 0}%</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Days Registered:</span>
                      <span className="info-value">{selectedStudent.attendanceStats?.daysRegistered || 0}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Remaining Days:</span>
                      <span className="info-value">{selectedStudent.attendanceStats?.remainingDays || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorDashboard;
