'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const SupervisorDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('scanner');
  const [currentShift, setCurrentShift] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [scannedStudent, setScannedStudent] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'supervisor') {
      router.push('/auth');
      return;
    }

    setUser(parsedUser);
    setLoading(false);
  }, [router]);

  // Start QR Scanner
  const startScanner = async () => {
    try {
      setIsScanning(true);
      setScanError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      // Mock QR detection for now
      setTimeout(() => {
        if (isScanning) {
          handleQRScan('{"studentId":"ST001","fullName":"أحمد محمد","email":"ahmed@example.com","college":"الهندسة","major":"علوم الحاسوب","grade":"third-year"}');
        }
      }, 3000);
      
    } catch (err) {
      console.error('Scanner error:', err);
      setScanError('فشل في الوصول للكاميرا. تأكد من السماح بالوصول للكاميرا.');
      setIsScanning(false);
    }
  };

  // Stop QR Scanner
  const stopScanner = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Handle QR Scan
  const handleQRScan = (qrData) => {
    try {
      const studentData = JSON.parse(qrData);
      setScannedStudent({
        id: Date.now(),
        studentId: studentData.studentId,
        fullName: studentData.fullName,
        email: studentData.email,
        college: studentData.college,
        major: studentData.major,
        grade: studentData.grade,
        scanTime: new Date().toLocaleString('ar-EG')
      });
      
      // Add to attendance records
      setAttendanceRecords(prev => [{
        id: Date.now(),
        studentId: studentData.studentId,
        fullName: studentData.fullName,
        college: studentData.college,
        major: studentData.major,
        grade: studentData.grade,
        scanTime: new Date().toLocaleString('ar-EG'),
        status: 'حاضر'
      }, ...prev]);
      
      stopScanner();
      alert(`تم مسح QR للطالب: ${studentData.fullName}`);
      
    } catch (err) {
      console.error('QR parsing error:', err);
      setScanError('خطأ في قراءة رمز QR');
    }
  };

  // Open/Close Shift
  const toggleShift = () => {
    if (currentShift) {
      setCurrentShift(null);
      alert('تم إغلاق الوردية');
    } else {
      setCurrentShift({
        id: Date.now(),
        startTime: new Date().toLocaleString('ar-EG'),
        supervisorId: user?.id
      });
      alert('تم فتح الوردية');
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🎯 لوحة تحكم المشرف</h1>
        <p style={styles.subtitle}>إدارة الحضور ومسح رموز QR</p>
        <div style={styles.userInfo}>
          <span>👤 {user?.email}</span>
          <button 
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = '/auth';
            }}
            style={styles.logoutBtn}
          >
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Shift Status */}
      <div style={styles.shiftSection}>
        <div style={styles.shiftStatus}>
          <h3>📋 حالة الوردية: {currentShift ? '🟢 مفتوحة' : '🔴 مغلقة'}</h3>
          {currentShift && (
            <p>بدأت في: {currentShift.startTime}</p>
          )}
        </div>
        <button 
          onClick={toggleShift}
          style={{
            ...styles.btn,
            backgroundColor: currentShift ? '#dc3545' : '#28a745'
          }}
        >
          {currentShift ? '🔒 إغلاق الوردية' : '🔓 فتح الوردية'}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabs}>
        <button 
          onClick={() => setActiveTab('scanner')}
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'scanner' ? '#007bff' : 'transparent'
          }}
        >
          📱 ماسح QR
        </button>
        <button 
          onClick={() => setActiveTab('attendance')}
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'attendance' ? '#007bff' : 'transparent'
          }}
        >
          📊 سجل الحضور
        </button>
        <button 
          onClick={() => setActiveTab('student')}
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'student' ? '#007bff' : 'transparent'
          }}
        >
          👤 الطالب الممسوح
        </button>
      </div>

      {/* Tab Content */}
      <div style={styles.content}>
        
        {/* QR Scanner Tab */}
        {activeTab === 'scanner' && (
          <div style={styles.scannerSection}>
            <h3>📱 ماسح رموز QR</h3>
            
            <div style={styles.videoContainer}>
              <video 
                ref={videoRef}
                style={styles.video}
                autoPlay
                playsInline
                muted
              />
              
              {!isScanning && (
                <div style={styles.videoOverlay}>
                  <button 
                    onClick={startScanner}
                    style={styles.startBtn}
                    disabled={!currentShift}
                  >
                    {currentShift ? '📷 تشغيل الكاميرا' : '⚠️ افتح الوردية أولاً'}
                  </button>
                </div>
              )}
              
              {isScanning && (
                <div style={styles.scanningOverlay}>
                  <div style={styles.scanFrame}></div>
                  <p style={styles.scanText}>📖 وجه الكاميرا نحو رمز QR</p>
                  <button 
                    onClick={stopScanner}
                    style={styles.stopBtn}
                  >
                    ⏹️ إيقاف
                  </button>
                </div>
              )}
            </div>
            
            {scanError && (
              <div style={styles.error}>
                ❌ {scanError}
              </div>
            )}
            
            {scannedStudent && (
              <div style={styles.lastScan}>
                <h4>✅ آخر طالب تم مسحه:</h4>
                <p><strong>{scannedStudent.fullName}</strong></p>
                <p>رقم الطالب: {scannedStudent.studentId}</p>
                <p>الكلية: {scannedStudent.college}</p>
                <p>وقت المسح: {scannedStudent.scanTime}</p>
              </div>
            )}
          </div>
        )}

        {/* Attendance Records Tab */}
        {activeTab === 'attendance' && (
          <div style={styles.attendanceSection}>
            <h3>📊 سجل الحضور ({attendanceRecords.length})</h3>
            
            {attendanceRecords.length === 0 ? (
              <div style={styles.emptyState}>
                <p>📝 لا توجد سجلات حضور بعد</p>
                <p>ابدأ بمسح رموز QR للطلاب</p>
              </div>
            ) : (
              <div style={styles.recordsList}>
                {attendanceRecords.map(record => (
                  <div key={record.id} style={styles.recordItem}>
                    <div style={styles.recordInfo}>
                      <strong>{record.fullName}</strong>
                      <span>رقم الطالب: {record.studentId}</span>
                      <span>الكلية: {record.college}</span>
                      <span>التخصص: {record.major}</span>
                    </div>
                    <div style={styles.recordMeta}>
                      <span style={styles.status}>✅ {record.status}</span>
                      <span style={styles.time}>🕐 {record.scanTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Student Details Tab */}
        {activeTab === 'student' && (
          <div style={styles.studentSection}>
            <h3>👤 تفاصيل الطالب</h3>
            
            {scannedStudent ? (
              <div style={styles.studentCard}>
                <div style={styles.studentHeader}>
                  <h4>{scannedStudent.fullName}</h4>
                  <span style={styles.studentId}>#{scannedStudent.studentId}</span>
                </div>
                
                <div style={styles.studentDetails}>
                  <div style={styles.detailRow}>
                    <span>🏫 الكلية:</span>
                    <span>{scannedStudent.college}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span>📚 التخصص:</span>
                    <span>{scannedStudent.major}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span>🎓 المستوى:</span>
                    <span>{scannedStudent.grade}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span>📧 البريد الإلكتروني:</span>
                    <span>{scannedStudent.email}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span>🕐 وقت المسح:</span>
                    <span>{scannedStudent.scanTime}</span>
                  </div>
                </div>
                
                <div style={styles.studentActions}>
                  <button style={{...styles.btn, backgroundColor: '#28a745'}}>
                    ✅ تأكيد الحضور
                  </button>
                  <button style={{...styles.btn, backgroundColor: '#ffc107', color: '#000'}}>
                    💳 إدارة الاشتراك
                  </button>
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <p>👤 لم يتم مسح أي طالب بعد</p>
                <p>امسح رمز QR لطالب لعرض تفاصيله</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    direction: 'rtl'
  },
  
  loading: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },
  
  header: {
    textAlign: 'center',
    padding: '30px 20px',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.2)'
  },
  
  title: {
    fontSize: '2.5em',
    margin: '0 0 10px 0',
    fontWeight: 'bold'
  },
  
  subtitle: {
    fontSize: '1.2em',
    margin: '0 0 20px 0',
    opacity: 0.9
  },
  
  userInfo: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap'
  },
  
  logoutBtn: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  
  shiftSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '20px',
    padding: '20px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  
  shiftStatus: {
    flex: 1
  },
  
  tabs: {
    display: 'flex',
    margin: '20px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '8px',
    gap: '8px',
    flexWrap: 'wrap'
  },
  
  tab: {
    flex: 1,
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'white',
    minWidth: '120px',
    transition: 'all 0.3s ease'
  },
  
  content: {
    margin: '20px',
    padding: '20px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
    minHeight: '400px'
  },
  
  scannerSection: {
    textAlign: 'center'
  },
  
  videoContainer: {
    position: 'relative',
    maxWidth: '400px',
    margin: '20px auto',
    borderRadius: '10px',
    overflow: 'hidden',
    background: '#000'
  },
  
  video: {
    width: '100%',
    height: '300px',
    objectFit: 'cover'
  },
  
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.5)'
  },
  
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.3)'
  },
  
  scanFrame: {
    width: '200px',
    height: '200px',
    border: '3px solid #00ff00',
    borderRadius: '10px',
    marginBottom: '20px',
    animation: 'pulse 2s infinite'
  },
  
  scanText: {
    margin: '10px 0',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  
  startBtn: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '15px 25px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  
  stopBtn: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  
  btn: {
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'white'
  },
  
  error: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '15px',
    borderRadius: '8px',
    margin: '20px 0',
    textAlign: 'center'
  },
  
  lastScan: {
    background: 'rgba(40,167,69,0.2)',
    padding: '20px',
    borderRadius: '8px',
    margin: '20px 0',
    border: '2px solid #28a745'
  },
  
  attendanceSection: {
    textAlign: 'center'
  },
  
  recordsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '20px'
  },
  
  recordItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.1)',
    padding: '15px',
    borderRadius: '8px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  
  recordInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '5px',
    flex: 1
  },
  
  recordMeta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '5px'
  },
  
  status: {
    backgroundColor: '#28a745',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '14px'
  },
  
  time: {
    fontSize: '14px',
    opacity: 0.8
  },
  
  studentSection: {
    textAlign: 'center'
  },
  
  studentCard: {
    background: 'rgba(255,255,255,0.1)',
    padding: '20px',
    borderRadius: '10px',
    marginTop: '20px',
    textAlign: 'right'
  },
  
  studentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid rgba(255,255,255,0.2)'
  },
  
  studentId: {
    backgroundColor: '#007bff',
    padding: '5px 10px',
    borderRadius: '15px',
    fontSize: '14px'
  },
  
  studentDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px'
  },
  
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  
  studentActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    opacity: 0.7
  }
};

export default SupervisorDashboard;

// Add CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}