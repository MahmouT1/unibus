'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AccurateQRScanner from '../../../components/AccurateQRScanner';
import SubscriptionPaymentModal from '../../../components/SubscriptionPaymentModal';
import '../../../components/admin/SupervisorDashboard.css';

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

  // Shift management states
  const [currentShift, setCurrentShift] = useState(null);
  const [shiftLoading, setShiftLoading] = useState(false);
  const [shiftResult, setShiftResult] = useState(null);
  
  // Notification system
  const [notification, setNotification] = useState(null);
  

  // Show notification function
  const showNotification = (type, title, message, duration = 5000) => {
    setNotification({
      type, // 'success' or 'error'
      title,
      message,
      id: Date.now()
    });
    
    // Auto-hide notification after duration
    setTimeout(() => {
      setNotification(null);
    }, duration);
  };

  // Logout function
  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('student');
    sessionStorage.clear();
    
    // Show logout notification
    showNotification('success', 'Logged Out', 'You have been successfully logged out');
    
    // Redirect to login page after a short delay
    setTimeout(() => {
      router.push('/auth');
    }, 1000);
  };

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
    // Check camera availability without using QrScanner.listCameras
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const cameras = devices.filter(device => device.kind === 'videoinput');
        setCameras(cameras);
        if (cameras.length > 0) {
          setSelectedCamera(cameras[0].deviceId);
        }
        console.log('📹 Found cameras:', cameras.length);
      })
      .catch(err => {
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
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Check if user is supervisor
      if (parsedUser.role !== 'supervisor') {
        router.push('/auth');
        return;
      }
      
      // Load current shift
      loadCurrentShift(parsedUser.id);
    } else {
      router.push('/login');
    }
    fetchDashboardStats();
    fetchTodayAttendance();
    fetchAttendanceRecords(); // Load general attendance records
  }, [router]);

  // Shift management functions
  const loadCurrentShift = async (supervisorId) => {
    try {
      console.log('=== DEBUG: loadCurrentShift called ===');
      console.log('supervisorId:', supervisorId);
      
      const response = await fetch(`/api/shifts?supervisorId=${supervisorId}&status=open`);
      const data = await response.json();
      
      console.log('Shift API response:', data);
      
      if (data.success && data.shifts.length > 0) {
        console.log('Setting current shift:', data.shifts[0]);
        setCurrentShift(data.shifts[0]);
      } else {
        console.log('No active shifts found or API error');
        setCurrentShift(null);
      }
    } catch (error) {
      console.error('Error loading current shift:', error);
      setCurrentShift(null);
    }
  };

  const openShift = async () => {
    if (!user) return;
    
    setShiftLoading(true);
    try {
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supervisorId: user.id,
          supervisorEmail: user.email,
          supervisorName: user.fullName || user.email
        })
      });

      const data = await response.json();
      
      console.log('=== DEBUG: openShift response ===');
      console.log('Response data:', data);
      
      if (data.success) {
        console.log('Setting current shift from openShift:', data.shift);
        setCurrentShift(data.shift);
        setShiftResult({ type: 'success', message: 'Shift opened successfully!' });
        // New shift opened - attendance table will be empty for new session
        console.log('New shift opened - attendance table is ready for new session');
      } else {
        console.log('Failed to open shift:', data.message);
        setShiftResult({ type: 'error', message: data.message });
      }
    } catch (error) {
      setShiftResult({ type: 'error', message: 'Failed to open shift' });
    } finally {
      setShiftLoading(false);
    }
  };

  const closeShift = async () => {
    if (!currentShift) return;
    
    console.log('=== DEBUG: closeShift called ===');
    console.log('currentShift:', currentShift);
    console.log('user:', user);
    
    // Show confirmation dialog
    const confirmClose = window.confirm(
      `Are you sure you want to close this shift?\n\n` +
      `Shift ID: ${currentShift.id}\n` +
      `Started: ${new Date(currentShift.shiftStart || currentShift.startTime).toLocaleString()}\n\n` +
      `This action cannot be undone.`
    );
    
    if (!confirmClose) {
      console.log('Shift close cancelled by user');
      return;
    }
    
    setShiftLoading(true);
    try {
      const closeData = {
        shiftId: currentShift.id,
        supervisorId: user.id
      };
      
      console.log('Sending close request:', closeData);
      
      const response = await fetch('/api/shifts/close', {
        method: 'POST', // Changed from PUT to POST to match backend
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(closeData)
      });

      const data = await response.json();
      
      console.log('Close shift response:', data);
      
      if (data.success) {
        setCurrentShift(null);
        setShiftResult({ type: 'success', message: 'Shift closed successfully!' });
        showNotification('success', 'Shift Closed', 'The shift has been closed successfully');
        // Refresh attendance records to show the completed shift data
        await fetchAttendanceRecords();
        console.log('Shift closed - attendance records refreshed');
      } else {
        setShiftResult({ type: 'error', message: data.message });
        showNotification('error', 'Close Failed', data.message || 'Failed to close shift');
      }
    } catch (error) {
      console.error('Error closing shift:', error);
      setShiftResult({ type: 'error', message: 'Failed to close shift' });
      showNotification('error', 'Close Error', 'Failed to close shift. Please try again.');
    } finally {
      setShiftLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // For now, set basic stats without API calls to prevent errors
      setDashboardStats({
        totalStudents: 0,
        activeSubscriptions: 0,
        todayAttendanceRate: 0,
        pendingSubscriptions: 0,
        openTickets: 0,
        monthlyRevenue: 0
      });
      setError(''); // Clear any errors
      setLoading(false);
    } catch (error) {
      console.error('Error setting dashboard stats:', error);
      setError('Error loading dashboard data');
      setLoading(false);
      // Set empty stats on error
      setDashboardStats({
        totalStudents: 0,
        activeSubscriptions: 0,
        todayAttendanceRate: 0,
        pendingSubscriptions: 0,
        openTickets: 0,
        monthlyRevenue: 0
      });
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      // For now, set empty attendance to prevent errors
      setTodayAttendance([]);
    } catch (error) {
      console.error('Error setting today attendance:', error);
      setTodayAttendance([]);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      // For now, set empty attendance records to prevent errors
      setAttendanceRecords([]);
    } catch (error) {
      console.error('Error setting attendance records:', error);
      setAttendanceRecords([]);
    }
  };

  const fetchCurrentShiftAttendance = async () => {
    if (!currentShift || !currentShift.id) {
      console.log('No current shift to fetch attendance for');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/shifts?supervisorId=${user?.id}&status=open`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.shifts && data.shifts.length > 0) {
          const shift = data.shifts[0];
          setCurrentShift(shift);
          console.log('Current shift attendance records:', shift.attendanceRecords?.length || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching current shift attendance:', error);
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
        showNotification(
          'success',
          'Record Deleted',
          'Attendance record deleted successfully'
        );
        fetchAttendanceRecords(); // Refresh the list
        fetchTodayAttendance(); // Refresh today's attendance
        fetchDashboardStats(); // Refresh stats
      } else {
        const errorData = await response.json();
        showNotification(
          'error',
          'Delete Failed',
          errorData.message || 'Failed to delete attendance record'
        );
      }
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      showNotification(
        'error',
        'Delete Error',
        'Error deleting attendance record'
      );
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
        showNotification(
          'error',
          'Fetch Failed',
          'Failed to fetch student details'
        );
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
      showNotification(
        'error',
        'Fetch Error',
        'Error fetching student details'
      );
    }
  };

  const startScanning = async () => {
    if (!videoRef.current) {
      setScanError('Video element not found');
      return;
    }

    try {
      setIsScanning(true);
      setScanError('');
      console.log('🎥 Starting camera directly...');
      
      // Direct camera access without QrScanner library
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'environment'
        }
      });
      
      console.log('✅ Camera stream obtained');
      
      // Set video source
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      
      await videoRef.current.play();
      console.log('✅ Video playing successfully');
      
      // Simulate QR detection after 4 seconds for testing
      setTimeout(() => {
        if (isScanning) {
          const mockStudent = {
            studentId: 'STU-' + Date.now(),
            id: 'STU-' + Date.now(),
            name: 'أحمد محمد علي',
            email: 'ahmed@student.edu',
            phoneNumber: '+20123456789',
            college: 'كلية الهندسة',
            grade: 'السنة الثالثة',
            major: 'هندسة حاسوب',
            address: 'القاهرة، مصر',
            profilePhoto: '/uploads/profiles/default.png'
          };
          
          console.log('🎯 Auto QR detection (demo):', mockStudent);
          handleQRCodeScanned(JSON.stringify(mockStudent));
        }
      }, 4000);
      
    } catch (error) {
      console.error('❌ Camera error:', error);
      
      if (error.name === 'NotAllowedError') {
        setScanError('تم رفض إذن الكاميرا. يرجى السماح للكاميرا في المتصفح.');
      } else if (error.name === 'NotFoundError') {
        setScanError('لم يتم العثور على كاميرا. تأكد من وجود كاميرا متصلة.');
      } else if (error.name === 'NotReadableError') {
        setScanError('الكاميرا مستخدمة من تطبيق آخر. أغلق التطبيقات الأخرى.');
      } else {
        setScanError('فشل في تشغيل الكاميرا: ' + error.message);
      }
      
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    console.log('🛑 Stopping camera...');
    
    // Stop video stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => {
        track.stop();
        console.log('📹 Camera track stopped');
      });
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
    console.log('✅ Camera stopped');
  };

  // New QR Scanner callback functions
  const handleQRScanSuccess = async (studentData) => {
    console.log('🎯 QR Scan Success:', studentData);
    
    // Set the scanned student data
    setAutoRegistered(false);
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
      photo: studentData.profilePhoto,
      attendanceRate: 95,
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
    
    // Switch to attendance management tab
    setActiveTab('attendance-management');
    await fetchCurrentShiftAttendance();
    
    // Auto-register attendance if shift is open
    if (currentShift && currentShift.id) {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        const scanData = {
          shiftId: currentShift.id,
          qrCodeData: JSON.stringify(studentData),
          location: 'Main Station',
          notes: 'QR Code Scan - Auto Registration'
        };

        console.log('=== Auto-registering attendance ===');
        console.log('Student:', studentData.fullName);
        console.log('Shift ID:', currentShift.id);

        const response = await fetch('/api/shifts/scan', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(scanData)
        });

        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Auto-registration successful');
          setAutoRegistered(true);
          showNotification(
            'success',
            'Attendance Registered Successfully!',
            `Student: ${studentData.fullName}\nStudent ID: ${studentData.studentId}\nShift: ${currentShift.shiftType}\n\nAttendance has been automatically registered.`
          );
        } else {
          console.log('❌ Auto-registration failed:', result.message);
          setAutoRegistered(false);
          showNotification(
            'success',
            'QR Code Scanned Successfully!',
            `Student: ${studentData.fullName}\nStudent ID: ${studentData.studentId}\n\nNote: Could not auto-register attendance. Please register manually.`
          );
        }
      } catch (error) {
        console.error('Error auto-registering attendance:', error);
        showNotification(
          'success',
          'QR Code Scanned Successfully!',
          `Student: ${studentData.fullName}\nStudent ID: ${studentData.studentId}\n\nNote: Could not auto-register attendance. Please register manually.`
        );
      }
    } else {
      showNotification(
        'success',
        'QR Code Scanned Successfully!',
        `Student: ${studentData.fullName}\nStudent ID: ${studentData.studentId}\n\nNote: Please open a shift first to register attendance.`
      );
    }
  };

  const handleQRScanError = (errorMessage) => {
    console.error('❌ QR Scan Error:', errorMessage);
    setScanError(errorMessage);
    showNotification(
      'error',
      'QR Scan Error',
      errorMessage
    );
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
      console.log('Setting scanned student with profile photo:', studentData.profilePhoto);
      setAutoRegistered(false); // Reset auto-registration status for new student
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
        photo: studentData.profilePhoto, // Use the profile photo from QR code data
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
      
      // Automatically switch to attendance management tab and refresh records
      setActiveTab('attendance-management');
      await fetchCurrentShiftAttendance(); // Refresh current shift attendance records
      
      // Auto-register attendance if shift is open
      if (currentShift && currentShift.id) {
        try {
          const token = localStorage.getItem('token');
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          
          const scanData = {
            shiftId: currentShift.id,
            qrCodeData: JSON.stringify({
              id: studentData.id,
              fullName: studentData.fullName,
              email: studentData.email,
              phoneNumber: studentData.phoneNumber,
              college: studentData.college,
              grade: studentData.grade,
              major: studentData.major,
              address: studentData.address,
              studentId: studentData.studentId
            }),
            location: 'Main Station',
            notes: 'QR Code Scan - Auto Registration'
          };

          console.log('=== Auto-registering attendance ===');
          console.log('Student:', studentData.fullName);
          console.log('Shift ID:', currentShift.id);

          const response = await fetch('http://localhost:3000/api/shifts/scan', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(scanData)
          });

          const result = await response.json();
          
          if (result.success) {
            console.log('✅ Auto-registration successful');
            setAutoRegistered(true);
            // Show success notification with attendance registration
            setTimeout(() => {
              showNotification(
                'success',
                'Attendance Registered Successfully!',
                `Student: ${studentData.fullName}\nStudent ID: ${studentData.studentId}\nShift: ${currentShift.shiftType}\n\nAttendance has been automatically registered.`
              );
            }, 500);
          } else {
            console.log('❌ Auto-registration failed:', result.message);
            setAutoRegistered(false);
            // Show success notification without attendance registration
            setTimeout(() => {
              showNotification(
                'success',
                'QR Code Scanned Successfully!',
                `Student: ${studentData.fullName}\nStudent ID: ${studentData.studentId}\n\nNote: Could not auto-register attendance. Please register manually.`
              );
            }, 500);
          }
        } catch (error) {
          console.error('Error auto-registering attendance:', error);
          // Show success notification without attendance registration
          setTimeout(() => {
            showNotification(
              'success',
              'QR Code Scanned Successfully!',
              `Student: ${studentData.fullName}\nStudent ID: ${studentData.studentId}\n\nNote: Could not auto-register attendance. Please register manually.`
            );
          }, 500);
        }
      } else {
        // Show success notification without attendance registration
        setTimeout(() => {
          showNotification(
            'success',
            'QR Code Scanned Successfully!',
            `Student: ${studentData.fullName}\nStudent ID: ${studentData.studentId}\n\nNote: Please open a shift first to register attendance.`
          );
        }, 500);
      }
      
    } catch (error) {
      console.error('Error processing QR code:', error);
      setScanError('Invalid QR code or server error');
      showNotification(
        'error',
        'QR Code Processing Error',
        'Error processing QR code. Please try again.'
      );
    }
  };

  const handleAttendanceRegistration = async () => {
    console.log('=== DEBUG: handleAttendanceRegistration called ===');
    console.log('currentShift:', currentShift);
    console.log('scannedStudent:', scannedStudent);
    
    if (!currentShift) {
      showNotification(
        'error',
        'No Active Shift',
        'Please open a shift first before scanning students!'
      );
      return;
    }

    if (!scannedStudent) {
      showNotification(
        'error',
        'No Student Data',
        'No student data found. Please scan a QR code first!'
      );
      return;
    }

    // Check if attendance was already auto-registered
    if (autoRegistered) {
      showNotification(
        'success',
        'Already Registered',
        'Attendance has already been registered automatically for this student.'
      );
      return;
    }

    if (!currentShift.id) {
      showNotification(
        'error',
        'Shift Error',
        'Shift ID is missing. Please close and reopen your shift!'
      );
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Use the shift scanning API instead of the old attendance API
      const scanData = {
        shiftId: currentShift.id, // Add the required shiftId
        qrCodeData: JSON.stringify({
          id: scannedStudent.id,
          fullName: scannedStudent.name,
          email: scannedStudent.email,
          phoneNumber: scannedStudent.phoneNumber,
          college: scannedStudent.college,
          grade: scannedStudent.grade,
          major: scannedStudent.major,
          address: scannedStudent.address,
          studentId: scannedStudent.studentId
        }),
        location: 'Main Station',
        notes: 'QR Code Scan'
      };

      console.log('Scanning student for shift:', scannedStudent.name);
      console.log('Current shift ID:', currentShift.id);
      console.log('Scan data:', scanData);

      const response = await fetch('/api/shifts/scan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scanData)
      });

      const result = await response.json();
      
      if (result.success) {
        // Show confirmation notification
        showNotification(
          'success',
          'Attendance Registered Successfully!',
          `Student: ${scannedStudent.name}\nCollege: ${scannedStudent.college}\nTime: ${new Date().toLocaleTimeString()}\n\nReturning to camera for next scan...`
        );
        
        // Clear scanned student and return to camera
        setScannedStudent(null);
        setActiveTab('qr-scanner');
        
        // Reload current shift to get updated attendance records
        loadCurrentShift(user.id);
        
        // Auto-start camera for next scan
        setTimeout(() => {
          startScanning();
        }, 2000);
        
      } else {
        // Handle different error types with user-friendly messages
        let errorMessage = 'Failed to register attendance';
        
        if (result.message && result.message.includes('already scanned')) {
          errorMessage = `⚠️ Student ${scannedStudent.name} has already been scanned in this shift.\n\nThis prevents duplicate scans.\n\nScanning another student...`;
          
          // Clear and return to camera even on duplicate
          setScannedStudent(null);
          setActiveTab('qr-scanner');
          setTimeout(() => {
            startScanning();
          }, 2000);
        } else if (result.message) {
          errorMessage = `❌ ${result.message}`;
        }
        
        showNotification(
          'error',
          'Registration Failed',
          errorMessage
        );
      }
    } catch (error) {
      console.error('Error scanning student:', error);
      showNotification(
        'error',
        'Registration Error',
        'Error scanning student. Please try again.'
      );
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
    // Show success notification
    showNotification(
      'success',
      'Payment Processed Successfully!',
      `Payment of ${paymentResult.amount} EGP processed successfully for ${scannedStudent.name}`
    );
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
      <style jsx>{`
        /* Safe base: prevent horizontal scroll without forcing fixed widths */
        :global(html), :global(body) { overflow-x: hidden; }
        .supervisor-dashboard { width: 100%; box-sizing: border-box; }
        .supervisor-dashboard * { box-sizing: border-box; }

        @media (max-width: 768px) {
          .supervisor-dashboard { padding: 8px; }
          .dashboard-header,
          .shift-management-section,
          .qr-scanner-content,
          .student-details-content,
          .attendance-management-content {
            width: 100%;
            max-width: 100%;
            margin: 0; /* avoid side gaps */
          }
          .dashboard-header { padding: 12px; margin-bottom: 12px; border-radius: 16px; }
          .header-content h1 { font-size: clamp(22px, 6vw, 28px); line-height: 1.15; }
          .header-content p { font-size: clamp(13px, 3.5vw, 15px); }

          .nav-tabs { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
          .nav-tab { width: 100%; padding: 12px; font-size: 14px; }

          .camera-controls { display: flex; flex-direction: column; gap: 8px; }
          .camera-controls button { width: 100%; padding: 12px; font-size: 14px; }

          .attendance-table { overflow-x: auto; font-size: 12px; }
          .attendance-table th, .attendance-table td { padding: 8px; white-space: nowrap; }
        }

        @media (max-width: 480px) {
          .supervisor-dashboard { padding: 6px; }
          .dashboard-header h1 { font-size: clamp(20px, 7vw, 24px); }
          .nav-tab { font-size: 12px; padding: 10px; }
          .attendance-table { font-size: 10px; }
        }
      `}</style>
      
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Supervisor Dashboard</h1>
          <p>Manage student attendance, QR scanning, and return schedules</p>
          
          {/* Supervisor Information */}
          {user && (
            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '15px',
              borderRadius: '10px',
              marginTop: '15px',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  👨‍💼
                </div>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '600' }}>
                    {user.fullName || user.email || 'Supervisor'}
                  </h3>
                  <p style={{ margin: '0', fontSize: '14px', opacity: '0.9' }}>
                    Email: {user.email}
                  </p>
                  <p style={{ margin: '0', fontSize: '14px', opacity: '0.9' }}>
                    Role: {user.role || 'Supervisor'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => router.push('/admin/attendance')}
          >
            <span className="btn-icon">👥</span>
            <span className="btn-text">Student Attendance</span>
          </button>
          <button className="btn-secondary">
            <span className="btn-icon">📊</span>
            <span className="btn-text">Export Report</span>
          </button>
          <button className="btn-secondary">
            <span className="btn-icon">⚙️</span>
            <span className="btn-text">Settings</span>
          </button>
          <button 
            className="btn-logout"
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
            <span className="btn-icon">🚪</span>
            <span className="btn-text">Logout</span>
          </button>
        </div>
      </div>


      {/* Shift Management Section */}
      <div className="shift-management-section">
        <div className="shift-status">
          <h3 style={{
            color: currentShift ? '#10b981' : '#6b7280',
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {currentShift ? '🟢' : '🔴'} Shift Status: {currentShift ? 'OPEN' : 'CLOSED'}
          </h3>
          {currentShift ? (
            <div className="shift-info" style={{
              background: 'linear-gradient(135deg, #f0fff4, #e6fffa)',
              border: '2px solid #10b981',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <p style={{ margin: '5px 0', color: '#065f46' }}>
                    <strong>🕐 Started:</strong> {new Date(currentShift.shiftStart || currentShift.startTime).toLocaleString()}
                  </p>
                  <p style={{ margin: '5px 0', color: '#065f46' }}>
                    <strong>📊 Total Scans:</strong> {currentShift.totalScans || 0}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '5px 0', color: '#065f46' }}>
                    <strong>🆔 Shift ID:</strong> {currentShift.id || 'Missing'}
                  </p>
                  <p style={{ margin: '5px 0', color: '#065f46' }}>
                    <strong>👨‍💼 Supervisor:</strong> {currentShift.supervisorName || 'Unknown'}
                  </p>
                </div>
              </div>
              <div style={{
                background: '#10b981',
                color: 'white',
                padding: '10px',
                borderRadius: '8px',
                marginTop: '15px',
                textAlign: 'center',
                fontWeight: '600'
              }}>
                ⚠️ This shift will remain OPEN until manually closed by the supervisor
              </div>
            </div>
          ) : (
            <div style={{
              background: '#f9fafb',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <p style={{ fontSize: '18px', margin: '0 0 10px 0' }}>
                No active shift. Click "Open Shift" to start working.
              </p>
              <p style={{ fontSize: '14px', margin: '0' }}>
                Shifts stay open until manually closed by the supervisor.
              </p>
            </div>
          )}
        </div>
        
        <div className="shift-controls">
          {!currentShift ? (
            <button
              onClick={openShift}
              disabled={shiftLoading}
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              {shiftLoading ? 'Opening...' : 'Open Shift'}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={closeShift}
                disabled={shiftLoading}
                className="btn-danger"
                style={{
                  background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
                  color: 'white',
                  border: '3px solid #dc2626',
                  padding: '15px 30px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: shiftLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 6px 20px rgba(229, 62, 62, 0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseOver={(e) => {
                  if (!shiftLoading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(229, 62, 62, 0.5)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!shiftLoading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 6px 20px rgba(229, 62, 62, 0.4)';
                  }
                }}
              >
                {shiftLoading ? '🔄 Closing...' : '🛑 CLOSE SHIFT'}
              </button>
              <button
                onClick={() => loadCurrentShift(user.id)}
                disabled={shiftLoading}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                🔄 Refresh Shift
              </button>
            </div>
          )}
        </div>

        {/* Shift Result */}
        {shiftResult && (
          <div className={`shift-result ${shiftResult.type}`} style={{
            marginTop: '15px',
            padding: '12px 16px',
            borderRadius: '8px',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            {shiftResult.message}
          </div>
        )}
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
            // Only refresh current shift attendance for this shift-specific table
            if (currentShift) {
              fetchCurrentShiftAttendance();
            }
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
            <AccurateQRScanner
              onScanSuccess={handleQRScanSuccess}
              onScanError={handleQRScanError}
              supervisorId={user?.id || 'supervisor-001'}
              supervisorName={user?.email || 'Supervisor'}
            />
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
                        src={scannedStudent.photo} 
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
              <p>{currentShift ? 'Live attendance records for the current shift session' : 'No active shift - start a shift to begin tracking attendance'}</p>
              <div className="header-actions">
                <button 
                  className="refresh-btn"
                  onClick={fetchCurrentShiftAttendance}
                  disabled={!currentShift}
                >
                  🔄 Refresh
                </button>
                {currentShift ? (
                  <span className="shift-info">
                    Shift: {currentShift.shiftType} | 
                    Total Records: {currentShift.attendanceRecords?.length || 0}
                  </span>
                ) : (
                  <span className="shift-info">
                    No Active Shift
                  </span>
                )}
              </div>
            </div>
            
            <div className="attendance-table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th>Student ID</th>
                    <th>College</th>
                    <th>Major</th>
                    <th>Grade</th>
                    <th>Scan Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // ONLY show current shift records - this table is shift-specific
                    const currentShiftRecords = currentShift && currentShift.attendanceRecords ? currentShift.attendanceRecords : [];
                    
                    return currentShiftRecords.length > 0 ? (
                      currentShiftRecords.map((record, index) => {
                      // Extract data from current shift record
                      const studentName = record.studentName || 'Unknown';
                      const studentId = record.studentId || 'N/A';
                      const college = record.college || 'N/A';
                      const major = record.major || 'N/A';
                      const grade = record.grade || 'N/A';
                      const scanTime = record.scanTime;
                      const studentEmail = record.studentEmail || '';
                      
                      // Check if this record belongs to the scanned student
                      const isScannedStudent = scannedStudent && (
                        studentEmail === scannedStudent.email
                      );
                      
                      return (
                        <tr 
                          key={index} 
                          className={`attendance-row ${isScannedStudent ? 'scanned-student-highlight' : ''}`}
                        >
                          <td>{index + 1}</td>
                          <td>
                            <div className="student-info">
                              <span className="student-name">
                                {studentName}
                              </span>
                            </div>
                          </td>
                          <td>{studentId}</td>
                          <td>{college}</td>
                          <td>{major}</td>
                          <td>
                            {grade ? 
                              grade.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                              'N/A'
                            }
                          </td>
                          <td>
                            {scanTime ? 
                              new Date(scanTime).toLocaleTimeString() : 
                              'N/A'
                            }
                          </td>
                          <td>
                            <span className="status-badge present">
                              Present
                            </span>
                          </td>
                        </tr>
                      );
                    })
                    ) : (
                      <tr>
                        <td colSpan="8" className="no-records">
                          {currentShift ? 
                            'No students scanned in this shift yet. Scan QR codes to add attendance records.' : 
                            'No active shift. Start a shift to begin tracking attendance.'
                          }
                        </td>
                      </tr>
                    );
                  })()}
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

      {/* Notification System */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          maxWidth: '400px',
          minWidth: '300px'
        }}>
          <div style={{
            background: notification.type === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            animation: 'slideInRight 0.3s ease-out',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              zIndex: 0
            }} />
            
            <div style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0
              }}>
                {notification.type === 'success' ? '✅' : '❌'}
              </div>
              
              <div style={{ flex: 1 }}>
                <h4 style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: '700',
                  lineHeight: '1.2'
                }}>
                  {notification.title}
                </h4>
                <p style={{
                  margin: '0',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  opacity: '0.9',
                  whiteSpace: 'pre-line'
                }}>
                  {notification.message}
                </p>
              </div>
              
              <button
                onClick={() => setNotification(null)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Styles */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default SupervisorDashboard;