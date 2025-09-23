'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobileQRScanner from './MobileQRScanner';
import './MobileSupervisor.css';
import './admin/SupervisorDashboard.css';

const MobileSupervisorDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('qr-scanner');
  const [isMobile, setIsMobile] = useState(false);
  const [scannedStudent, setScannedStudent] = useState(null);
  const [currentShift, setCurrentShift] = useState(null);
  const [notification, setNotification] = useState(null);
  const router = useRouter();

  // Additional states from original dashboard
  const [returnDate, setReturnDate] = useState('');
  const [firstAppointmentCount, setFirstAppointmentCount] = useState(0);
  const [secondAppointmentCount, setSecondAppointmentCount] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [autoRegistered, setAutoRegistered] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [scanError, setScanError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [paymentData, setPaymentData] = useState({
    email: '',
    paymentMethod: 'credit_card',
    amount: ''
  });

  // Dashboard data states
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
  const [shiftLoading, setShiftLoading] = useState(false);
  const [shiftResult, setShiftResult] = useState(null);

  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                           window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Get user data
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      if (parsedUser.role !== 'supervisor') {
        router.push('/auth');
        return;
      }
    } else {
      router.push('/auth');
    }
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [router]);

  // Fetch dashboard data
  useEffect(() => {
    if (user) {
      fetchDashboardStats();
      fetchTodayAttendance();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Simulate dashboard stats (replace with actual API call)
      setDashboardStats({
        totalStudents: 245,
        activeSubscriptions: 189,
        todayAttendanceRate: 87,
        pendingSubscriptions: 12,
        openTickets: 3,
        monthlyRevenue: 15420
      });
      setLoading(false);
    } catch (error) {
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      // Simulate today's attendance (replace with actual API call)
      setTodayAttendance([
        { id: 1, name: 'أحمد محمد', time: '07:30', status: 'present' },
        { id: 2, name: 'فاطمة علي', time: '07:45', status: 'present' },
        { id: 3, name: 'محمد حسن', time: '08:00', status: 'present' }
      ]);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  };

  // Shift management functions
  const startShift = async () => {
    try {
      setShiftLoading(true);
      setCurrentShift({
        id: Date.now(),
        supervisorId: user?.id,
        supervisorName: user?.email,
        startTime: new Date(),
        status: 'active'
      });
      setShiftResult('Shift started successfully');
      showNotification('success', 'Shift Started', 'Your supervisor shift has been activated');
    } catch (error) {
      setShiftResult('Failed to start shift');
      showNotification('error', 'Shift Error', 'Failed to start supervisor shift');
    } finally {
      setShiftLoading(false);
    }
  };

  const endShift = async () => {
    try {
      setShiftLoading(true);
      setCurrentShift(null);
      setShiftResult('Shift ended successfully');
      showNotification('success', 'Shift Ended', 'Your supervisor shift has been ended');
    } catch (error) {
      setShiftResult('Failed to end shift');
      showNotification('error', 'Shift Error', 'Failed to end supervisor shift');
    } finally {
      setShiftLoading(false);
    }
  };

  const showNotification = (type, title, message) => {
    setNotification({ type, title, message, id: Date.now() });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleQRScanSuccess = async (studentData) => {
    console.log('🎯 QR Scan Success:', studentData);
    
    setScannedStudent({
      id: studentData.id || studentData.studentId,
      studentId: studentData.studentId || studentData.id,
      name: studentData.fullName || studentData.name,
      email: studentData.email,
      phoneNumber: studentData.phoneNumber,
      college: studentData.college,
      grade: studentData.grade,
      major: studentData.major,
      address: studentData.address,
      photo: studentData.profilePhoto
    });
    
    // Show success notification
    showNotification(
      'success',
      'QR Code Scanned!',
      `Student: ${studentData.fullName || studentData.name}`
    );
    
    // Switch to student details tab
    setActiveTab('student-details');
  };

  const handleQRScanError = (errorMessage) => {
    console.error('❌ QR Scan Error:', errorMessage);
    showNotification('error', 'QR Scan Error', errorMessage);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  const registerAttendance = async () => {
    if (!scannedStudent) return;
    
    try {
      // Add to attendance records
      const newRecord = {
        id: Date.now(),
        studentId: scannedStudent.studentId,
        studentName: scannedStudent.name,
        email: scannedStudent.email,
        timestamp: new Date(),
        supervisorId: user?.id,
        supervisorName: user?.email,
        status: 'present'
      };
      
      setAttendanceRecords(prev => [newRecord, ...prev]);
      
      // Update today's attendance
      setTodayAttendance(prev => [
        ...prev,
        {
          id: newRecord.id,
          name: scannedStudent.name,
          time: new Date().toLocaleTimeString(),
          status: 'present'
        }
      ]);
      
      // Update stats
      setDashboardStats(prev => ({
        ...prev,
        todayAttendanceRate: Math.min(100, prev.todayAttendanceRate + 1)
      }));
      
      showNotification(
        'success',
        'Attendance Registered',
        `Successfully registered attendance for ${scannedStudent.name}`
      );
      
      console.log('✅ Attendance registered for:', scannedStudent.name);
      
      // Auto switch to attendance tab to show the record
      setTimeout(() => {
        setActiveTab('attendance');
      }, 2000);
      
    } catch (error) {
      showNotification('error', 'Registration Failed', 'Failed to register attendance');
    }
  };

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Mobile Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: isMobile ? '16px' : '24px',
        color: 'white',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div>
            <h1 style={{
              margin: '0',
              fontSize: isMobile ? '18px' : '28px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🚌 Supervisor Dashboard
            </h1>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: isMobile ? '11px' : '14px',
              opacity: 0.9
            }}>
              {user.email}
            </p>
            {currentShift && (
              <div style={{
                fontSize: isMobile ? '10px' : '12px',
                background: 'rgba(72, 187, 120, 0.8)',
                padding: '2px 8px',
                borderRadius: '12px',
                marginTop: '4px',
                display: 'inline-block'
              }}>
                🟢 Shift Active
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {!currentShift ? (
              <button
                onClick={startShift}
                style={{
                  padding: isMobile ? '6px 12px' : '8px 16px',
                  background: '#48bb78',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: isMobile ? '10px' : '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                ▶️ Start
              </button>
            ) : (
              <button
                onClick={endShift}
                style={{
                  padding: isMobile ? '6px 12px' : '8px 16px',
                  background: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: isMobile ? '10px' : '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                ⏹️ End
              </button>
            )}
            
            <button
              onClick={handleLogout}
              style={{
                padding: isMobile ? '6px 12px' : '12px 20px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                fontSize: isMobile ? '10px' : '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      <div style={{
        background: 'white',
        padding: isMobile ? '8px' : '16px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        <div style={{
          display: 'flex',
          gap: isMobile ? '4px' : '8px',
          minWidth: 'fit-content',
          justifyContent: isMobile ? 'flex-start' : 'center'
        }}>
          <button
            onClick={() => setActiveTab('qr-scanner')}
            style={{
              padding: isMobile ? '8px 12px' : '12px 20px',
              background: activeTab === 'qr-scanner' ? '#667eea' : '#f7fafc',
              color: activeTab === 'qr-scanner' ? 'white' : '#4a5568',
              border: 'none',
              borderRadius: '8px',
              fontSize: isMobile ? '11px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              minWidth: isMobile ? '80px' : '120px',
              flexShrink: 0
            }}
          >
            📱 Scanner
          </button>
          
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: isMobile ? '8px 12px' : '12px 20px',
              background: activeTab === 'dashboard' ? '#667eea' : '#f7fafc',
              color: activeTab === 'dashboard' ? 'white' : '#4a5568',
              border: 'none',
              borderRadius: '8px',
              fontSize: isMobile ? '11px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              minWidth: isMobile ? '80px' : '120px',
              flexShrink: 0
            }}
          >
            📊 Stats
          </button>
          
          <button
            onClick={() => setActiveTab('shift')}
            style={{
              padding: isMobile ? '8px 12px' : '12px 20px',
              background: activeTab === 'shift' ? '#667eea' : '#f7fafc',
              color: activeTab === 'shift' ? 'white' : '#4a5568',
              border: 'none',
              borderRadius: '8px',
              fontSize: isMobile ? '11px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              minWidth: isMobile ? '80px' : '120px',
              flexShrink: 0
            }}
          >
            🕐 Shift
          </button>
          
          {scannedStudent && (
            <button
              onClick={() => setActiveTab('student-details')}
              style={{
                padding: isMobile ? '8px 12px' : '12px 20px',
                background: activeTab === 'student-details' ? '#667eea' : '#f7fafc',
                color: activeTab === 'student-details' ? 'white' : '#4a5568',
                border: 'none',
                borderRadius: '8px',
                fontSize: isMobile ? '11px' : '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                minWidth: isMobile ? '80px' : '120px',
                flexShrink: 0
              }}
            >
              👤 Student
            </button>
          )}
          
          <button
            onClick={() => setActiveTab('attendance')}
            style={{
              padding: isMobile ? '8px 12px' : '12px 20px',
              background: activeTab === 'attendance' ? '#667eea' : '#f7fafc',
              color: activeTab === 'attendance' ? 'white' : '#4a5568',
              border: 'none',
              borderRadius: '8px',
              fontSize: isMobile ? '11px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              minWidth: isMobile ? '80px' : '120px',
              flexShrink: 0
            }}
          >
            📋 Records
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{
        padding: isMobile ? '16px' : '24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* QR Scanner Tab */}
        {activeTab === 'qr-scanner' && (
          <div style={{
            background: 'white',
            borderRadius: isMobile ? '12px' : '16px',
            padding: isMobile ? '16px' : '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            marginBottom: isMobile ? '16px' : '24px'
          }}>
            <MobileQRScanner
              onScanSuccess={handleQRScanSuccess}
              onScanError={handleQRScanError}
              supervisorId={user?.id || 'supervisor-001'}
              supervisorName={user?.email || 'Supervisor'}
            />
          </div>
        )}

        {/* Student Details Tab */}
        {activeTab === 'student-details' && scannedStudent && (
          <div style={{
            background: 'white',
            borderRadius: isMobile ? '12px' : '16px',
            padding: isMobile ? '16px' : '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: isMobile ? '16px' : '24px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <button
                onClick={() => setActiveTab('qr-scanner')}
                style={{
                  padding: isMobile ? '8px 12px' : '10px 16px',
                  background: '#f7fafc',
                  color: '#4a5568',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: isMobile ? '12px' : '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ← Back to Scanner
              </button>
              
              <h2 style={{
                margin: '0',
                fontSize: isMobile ? '18px' : '24px',
                fontWeight: '600',
                color: '#2d3748'
              }}>
                Student Information
              </h2>
            </div>

            {/* Mobile Student Card */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr',
              gap: isMobile ? '16px' : '24px',
              alignItems: 'start'
            }}>
              {/* Student Photo */}
              <div style={{
                textAlign: 'center'
              }}>
                <div style={{
                  width: isMobile ? '80px' : '120px',
                  height: isMobile ? '80px' : '120px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: isMobile ? '32px' : '48px',
                  fontWeight: '600',
                  margin: '0 auto',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                }}>
                  {scannedStudent.name ? scannedStudent.name.charAt(0) : '👤'}
                </div>
              </div>

              {/* Student Details */}
              <div style={{
                display: 'grid',
                gap: isMobile ? '12px' : '16px'
              }}>
                <div>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: isMobile ? '16px' : '20px',
                    fontWeight: '600',
                    color: '#2d3748'
                  }}>
                    {scannedStudent.name}
                  </h3>
                  <p style={{
                    margin: '0',
                    fontSize: isMobile ? '12px' : '14px',
                    color: '#718096'
                  }}>
                    {scannedStudent.email}
                  </p>
                </div>

                {/* Mobile Info Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                  gap: isMobile ? '8px' : '12px'
                }}>
                  <div style={{
                    padding: isMobile ? '8px' : '12px',
                    background: '#f7fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      fontSize: isMobile ? '10px' : '12px',
                      fontWeight: '600',
                      color: '#4a5568',
                      marginBottom: '4px'
                    }}>
                      Student ID
                    </div>
                    <div style={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: '#2d3748',
                      fontWeight: '500'
                    }}>
                      {scannedStudent.studentId}
                    </div>
                  </div>

                  <div style={{
                    padding: isMobile ? '8px' : '12px',
                    background: '#f7fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      fontSize: isMobile ? '10px' : '12px',
                      fontWeight: '600',
                      color: '#4a5568',
                      marginBottom: '4px'
                    }}>
                      College
                    </div>
                    <div style={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: '#2d3748',
                      fontWeight: '500'
                    }}>
                      {scannedStudent.college}
                    </div>
                  </div>

                  <div style={{
                    padding: isMobile ? '8px' : '12px',
                    background: '#f7fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      fontSize: isMobile ? '10px' : '12px',
                      fontWeight: '600',
                      color: '#4a5568',
                      marginBottom: '4px'
                    }}>
                      Grade
                    </div>
                    <div style={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: '#2d3748',
                      fontWeight: '500'
                    }}>
                      {scannedStudent.grade}
                    </div>
                  </div>

                  <div style={{
                    padding: isMobile ? '8px' : '12px',
                    background: '#f7fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      fontSize: isMobile ? '10px' : '12px',
                      fontWeight: '600',
                      color: '#4a5568',
                      marginBottom: '4px'
                    }}>
                      Major
                    </div>
                    <div style={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: '#2d3748',
                      fontWeight: '500'
                    }}>
                      {scannedStudent.major}
                    </div>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '8px' : '12px',
                  marginTop: isMobile ? '16px' : '20px'
                }}>
                  <button
                    onClick={registerAttendance}
                    style={{
                      flex: 1,
                      padding: isMobile ? '12px' : '16px',
                      background: '#48bb78',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: isMobile ? '14px' : '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(72, 187, 120, 0.4)',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    ✅ Register Attendance
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('qr-scanner')}
                    style={{
                      flex: isMobile ? 'none' : 1,
                      padding: isMobile ? '10px' : '16px',
                      background: '#4299e1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: isMobile ? '14px' : '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(66, 153, 225, 0.4)',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    📱 Scan Next Student
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Stats Tab */}
        {activeTab === 'dashboard' && (
          <div style={{
            background: 'white',
            borderRadius: isMobile ? '12px' : '16px',
            padding: isMobile ? '16px' : '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              margin: '0 0 20px 0',
              fontSize: isMobile ? '18px' : '24px',
              fontWeight: '600',
              color: '#2d3748',
              textAlign: 'center'
            }}>
              📊 Dashboard Statistics
            </h2>
            
            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
              gap: isMobile ? '12px' : '16px',
              marginBottom: '20px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
                color: 'white',
                padding: isMobile ? '12px' : '16px',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold' }}>
                  {dashboardStats.totalStudents}
                </div>
                <div style={{ fontSize: isMobile ? '10px' : '12px', opacity: 0.9 }}>
                  Total Students
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                color: 'white',
                padding: isMobile ? '12px' : '16px',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold' }}>
                  {dashboardStats.activeSubscriptions}
                </div>
                <div style={{ fontSize: isMobile ? '10px' : '12px', opacity: 0.9 }}>
                  Active Subscriptions
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                color: 'white',
                padding: isMobile ? '12px' : '16px',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold' }}>
                  {dashboardStats.todayAttendanceRate}%
                </div>
                <div style={{ fontSize: isMobile ? '10px' : '12px', opacity: 0.9 }}>
                  Today's Attendance
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #805ad5 0%, #6b46c1 100%)',
                color: 'white',
                padding: isMobile ? '12px' : '16px',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold' }}>
                  {dashboardStats.pendingSubscriptions}
                </div>
                <div style={{ fontSize: isMobile ? '10px' : '12px', opacity: 0.9 }}>
                  Pending
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
                color: 'white',
                padding: isMobile ? '12px' : '16px',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold' }}>
                  {dashboardStats.openTickets}
                </div>
                <div style={{ fontSize: isMobile ? '10px' : '12px', opacity: 0.9 }}>
                  Open Tickets
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
                color: 'white',
                padding: isMobile ? '12px' : '16px',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold' }}>
                  ${dashboardStats.monthlyRevenue}
                </div>
                <div style={{ fontSize: isMobile ? '10px' : '12px', opacity: 0.9 }}>
                  Monthly Revenue
                </div>
              </div>
            </div>
            
            {/* Today's Attendance */}
            <div style={{
              background: '#f7fafc',
              borderRadius: '10px',
              padding: isMobile ? '12px' : '16px',
              marginTop: '16px'
            }}>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: '600',
                color: '#2d3748'
              }}>
                📅 Today's Attendance
              </h3>
              {todayAttendance.length > 0 ? (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {todayAttendance.map((record, index) => (
                    <div key={index} style={{
                      background: 'white',
                      padding: isMobile ? '8px' : '12px',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: isMobile ? '12px' : '14px'
                    }}>
                      <span style={{ fontWeight: '500' }}>{record.name}</span>
                      <span style={{ color: '#718096' }}>{record.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#718096', fontSize: isMobile ? '12px' : '14px' }}>
                  No attendance records today
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shift Management Tab */}
        {activeTab === 'shift' && (
          <div style={{
            background: 'white',
            borderRadius: isMobile ? '12px' : '16px',
            padding: isMobile ? '16px' : '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              margin: '0 0 20px 0',
              fontSize: isMobile ? '18px' : '24px',
              fontWeight: '600',
              color: '#2d3748',
              textAlign: 'center'
            }}>
              🕐 Shift Management
            </h2>
            
            {/* Current Shift Status */}
            <div style={{
              background: currentShift ? '#f0fff4' : '#fff5f5',
              border: `2px solid ${currentShift ? '#48bb78' : '#fed7d7'}`,
              borderRadius: '10px',
              padding: isMobile ? '16px' : '20px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: isMobile ? '32px' : '48px',
                marginBottom: '8px'
              }}>
                {currentShift ? '🟢' : '🔴'}
              </div>
              <div style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '600',
                color: currentShift ? '#22543d' : '#742a2a',
                marginBottom: '8px'
              }}>
                {currentShift ? 'Shift Active' : 'Shift Inactive'}
              </div>
              {currentShift && (
                <div style={{
                  fontSize: isMobile ? '12px' : '14px',
                  color: '#22543d'
                }}>
                  Started: {new Date(currentShift.startTime).toLocaleTimeString()}
                </div>
              )}
            </div>
            
            {/* Shift Controls */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '12px'
            }}>
              {!currentShift ? (
                <button
                  onClick={startShift}
                  disabled={shiftLoading}
                  style={{
                    flex: 1,
                    padding: isMobile ? '16px' : '18px',
                    background: '#48bb78',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: '600',
                    cursor: shiftLoading ? 'not-allowed' : 'pointer',
                    opacity: shiftLoading ? 0.7 : 1,
                    transition: 'all 0.3s'
                  }}
                >
                  {shiftLoading ? '⏳ Starting...' : '▶️ Start Shift'}
                </button>
              ) : (
                <button
                  onClick={endShift}
                  disabled={shiftLoading}
                  style={{
                    flex: 1,
                    padding: isMobile ? '16px' : '18px',
                    background: '#e53e3e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: '600',
                    cursor: shiftLoading ? 'not-allowed' : 'pointer',
                    opacity: shiftLoading ? 0.7 : 1,
                    transition: 'all 0.3s'
                  }}
                >
                  {shiftLoading ? '⏳ Ending...' : '⏹️ End Shift'}
                </button>
              )}
            </div>
            
            {shiftResult && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#f0f9ff',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: isMobile ? '14px' : '16px',
                color: '#1e40af'
              }}>
                {shiftResult}
              </div>
            )}
          </div>
        )}

        {/* Attendance Records Tab */}
        {activeTab === 'attendance' && (
          <div style={{
            background: 'white',
            borderRadius: isMobile ? '12px' : '16px',
            padding: isMobile ? '16px' : '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: isMobile ? '18px' : '24px',
              fontWeight: '600',
              color: '#2d3748',
              textAlign: 'center'
            }}>
              📋 Attendance Records
            </h2>
            
            {attendanceRecords.length > 0 ? (
              <div style={{
                display: 'grid',
                gap: isMobile ? '8px' : '12px'
              }}>
                {attendanceRecords.map((record, index) => (
                  <div key={index} style={{
                    background: '#f7fafc',
                    padding: isMobile ? '12px' : '16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{
                        fontSize: isMobile ? '14px' : '16px',
                        fontWeight: '600',
                        color: '#2d3748'
                      }}>
                        {record.studentName}
                      </div>
                      <div style={{
                        fontSize: isMobile ? '12px' : '14px',
                        color: '#718096'
                      }}>
                        {record.studentId}
                      </div>
                    </div>
                    <div style={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: '#4a5568'
                    }}>
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: isMobile ? '20px' : '40px',
                color: '#718096'
              }}>
                <div style={{ fontSize: isMobile ? '48px' : '64px', marginBottom: '16px' }}>📊</div>
                <p style={{ 
                  fontSize: isMobile ? '14px' : '16px',
                  margin: '0'
                }}>
                  Attendance records will appear here after QR scanning
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: isMobile ? '80px' : '100px',
          left: isMobile ? '16px' : '50%',
          right: isMobile ? '16px' : 'auto',
          transform: isMobile ? 'none' : 'translateX(-50%)',
          background: notification.type === 'success' ? '#f0fff4' : '#fed7d7',
          color: notification.type === 'success' ? '#22543d' : '#742a2a',
          border: `2px solid ${notification.type === 'success' ? '#48bb78' : '#e53e3e'}`,
          borderRadius: '12px',
          padding: isMobile ? '12px' : '16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          maxWidth: isMobile ? 'none' : '400px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px'
          }}>
            <span style={{ fontSize: isMobile ? '16px' : '18px' }}>
              {notification.type === 'success' ? '✅' : '❌'}
            </span>
            <strong style={{ fontSize: isMobile ? '14px' : '16px' }}>
              {notification.title}
            </strong>
          </div>
          <div style={{ fontSize: isMobile ? '12px' : '14px' }}>
            {notification.message}
          </div>
        </div>
      )}

      <style jsx>{`
        /* Mobile-specific styles */
        @media (max-width: 768px) {
          /* Ensure no horizontal scrolling */
          * {
            box-sizing: border-box;
          }
          
          /* Optimize touch targets */
          button {
            min-height: 44px;
            touch-action: manipulation;
          }
          
          /* Improve text readability on mobile */
          body {
            -webkit-text-size-adjust: 100%;
            -webkit-font-smoothing: antialiased;
          }
        }
        
        /* Prevent zoom on input focus (mobile) */
        @media (max-width: 768px) {
          input, select, textarea {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MobileSupervisorDashboard;
