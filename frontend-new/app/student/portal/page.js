'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../lib/contexts/LanguageContext';
import LanguageSwitcher from '../../../components/LanguageSwitcher';

export default function StudentPortal() {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const fetchStudentData = async () => {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      const studentData = localStorage.getItem('student');
      
      if (!token || !userData) {
        router.push('/login');
        return;
      }
      
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Try to fetch fresh student data from API
      try {
        const response = await fetch(`/api/students/profile-simple?email=${encodeURIComponent(parsedUser.email)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const studentProfile = await response.json();
          console.log('Fetched student profile:', studentProfile);
          if (studentProfile.student) {
            console.log('Student profile photo:', studentProfile.student.profilePhoto);
            setStudent(studentProfile.student);
            // Update localStorage with fresh data
            localStorage.setItem('student', JSON.stringify(studentProfile.student));
          } else {
            console.log('Student profile photo (direct):', studentProfile.profilePhoto);
            setStudent(studentProfile);
            localStorage.setItem('student', JSON.stringify(studentProfile));
          }
        } else {
          console.log('Failed to fetch student profile, using localStorage data');
          if (studentData) {
            setStudent(JSON.parse(studentData));
          }
        }
      } catch (error) {
        console.log('Error fetching student profile:', error);
        if (studentData) {
          setStudent(JSON.parse(studentData));
        }
      }
      
      setLoading(false);
    };

    fetchStudentData();
  }, [router]);

  // Handle window resize for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('student');
    router.push('/');
  };

  const navigateToRegistration = () => {
    router.push('/student/registration');
  };

  const navigateToSupport = () => {
    router.push('/student/support');
  };

  const navigateToSubscription = () => {
    router.push('/student/subscription');
  };

  const navigateToTransportation = () => {
    router.push('/student/transportation');
  };

        const generateQRCode = async () => {
          try {
            // Prepare real student data for QR code
            const realStudentData = {
              id: student?.id || user?.id || `student-${Date.now()}`,
              studentId: student?.studentId || user?.studentId || 'Not assigned',
              fullName: student?.fullName || user?.fullName || user?.email?.split('@')[0] || 'Student',
              email: user?.email || 'Not provided',
              phoneNumber: student?.phoneNumber || user?.phoneNumber || 'Not provided',
              college: student?.college || user?.college || 'Not specified',
              grade: student?.grade || user?.grade || 'Not specified',
              major: student?.major || user?.major || 'Not specified',
              profilePhoto: student?.profilePhoto || user?.profilePhoto || null,
              address: student?.address || user?.address || {
                streetAddress: 'Not provided',
                buildingNumber: '',
                fullAddress: 'Not provided'
              }
            };

            console.log('Sending real student data for QR generation:', realStudentData);

            const response = await fetch('/api/students/generate-qr', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ studentData: realStudentData }),
            });

      const data = await response.json();
      
      if (data.success) {
        // Create a new window/tab to show the QR code
        const qrWindow = window.open('', '_blank', 'width=600,height=700');
        qrWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Student QR Code</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                text-align: center; 
                background: #f8f9fa;
              }
              .container {
                max-width: 500px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              .student-info {
                background: #e3f2fd;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                text-align: left;
              }
              .qr-code {
                margin: 20px 0;
              }
              .download-btn {
                background: #28a745;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
                margin-top: 15px;
              }
              .download-btn:hover {
                background: #218838;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🎓 Student QR Code</h1>
              
                     <div class="student-info">
                       <h3>Student Information</h3>
                       <p><strong>Name:</strong> ${realStudentData.fullName}</p>
                       <p><strong>Email:</strong> ${realStudentData.email}</p>
                       <p><strong>Student ID:</strong> ${realStudentData.studentId}</p>
                       <p><strong>Phone:</strong> ${realStudentData.phoneNumber}</p>
                       <p><strong>College:</strong> ${realStudentData.college}</p>
                       <p><strong>Grade:</strong> ${realStudentData.grade}</p>
                       <p><strong>Major:</strong> ${realStudentData.major}</p>
                       <p><strong>Address:</strong> ${realStudentData.address.streetAddress}, ${realStudentData.address.fullAddress}</p>
                     </div>
              
              <div class="qr-code">
                <img src="${data.qrCodeDataURL || data.qrCode || data.data}" 
                     alt="Student QR Code" 
                     style="width: 300px; height: 300px; border: 2px solid #28a745; border-radius: 8px;" />
              </div>
              
              <button class="download-btn" onclick="downloadQR()">📥 Download QR Code</button>
            </div>
            
            <script>
              function downloadQR() {
                const link = document.createElement('a');
                link.href = '${data.qrCodeDataURL || data.qrCode || data.data}';
                link.download = 'student-qr-code-${Date.now()}.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                alert('QR code downloaded successfully!');
              }
            </script>
          </body>
          </html>
        `);
        qrWindow.document.close();
      } else {
        alert('Failed to generate QR code: ' + data.message);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      width: '100%',
      overflowX: 'hidden'
    }}>
      {/* Top Navigation Bar */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: isMobile ? '12px 16px' : '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        gap: isMobile ? '12px' : '0'
      }}>
        {/* Search Bar */}
        <div style={{ flex: '1', maxWidth: isMobile ? '100%' : '400px', order: isMobile ? '2' : '1' }}>
          <input 
            type="search" 
            placeholder="Search" 
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#f9fafb'
            }}
          />
        </div>

        {/* User Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#1f2937',
              marginBottom: '2px'
            }}>
              {student?.fullName || user?.email || 'Student'}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#6b7280' 
            }}>
              {student?.grade || 'Student'}
            </div>
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#8b5cf6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            {(student?.fullName || user?.email || 'S').charAt(0).toUpperCase()}
          </div>
          <button style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            🔔
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
        {/* Sidebar */}
        <div style={{
          width: isMobile ? '100%' : '280px',
          backgroundColor: 'white',
          borderRight: isMobile ? 'none' : '1px solid #e2e8f0',
          minHeight: isMobile ? 'auto' : 'calc(100vh - 80px)',
          padding: isMobile ? '16px 0' : '24px 0'
        }}>
          {/* Logo Section */}
          <div style={{
            padding: isMobile ? '0 16px 16px' : '0 24px 24px',
            borderBottom: '1px solid #e2e8f0',
            marginBottom: isMobile ? '16px' : '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🎓
              </div>
              <div>
                <h2 style={{ 
                  margin: '0', 
                  fontSize: '20px', 
                  fontWeight: '700',
                  color: '#1f2937'
                }}>
                  {t('studentPortal')}
                </h2>
                <p style={{ 
                  margin: '0', 
                  fontSize: '12px', 
                  color: '#6b7280' 
                }}>
                  Academic Dashboard
                </p>
              </div>
            </div>
            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center' }}>
              <LanguageSwitcher variant="compact" />
            </div>
          </div>

          {/* Navigation Menu */}
          <nav style={{ padding: isMobile ? '0 12px' : '0 16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '8px' : '12px',
              padding: isMobile ? '8px 12px' : '12px 16px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              marginBottom: isMobile ? '4px' : '8px',
              cursor: 'pointer'
            }}>
              <span style={{ fontSize: isMobile ? '16px' : '20px' }}>🏠</span>
              <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '500', color: '#374151' }}>{t('studentPortal')}</span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '8px' : '12px',
              padding: isMobile ? '8px 12px' : '12px 16px',
              borderRadius: '8px',
              marginBottom: isMobile ? '4px' : '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onClick={navigateToSubscription}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span style={{ fontSize: isMobile ? '16px' : '20px' }}>💳</span>
              <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '500', color: '#374151' }}>{t('subscription')}</span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '8px' : '12px',
              padding: isMobile ? '8px 12px' : '12px 16px',
              borderRadius: '8px',
              marginBottom: isMobile ? '4px' : '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onClick={navigateToRegistration}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span style={{ fontSize: isMobile ? '16px' : '20px' }}>📝</span>
              <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '500', color: '#374151' }}>{t('attendance')}</span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '8px' : '12px',
              padding: isMobile ? '8px 12px' : '12px 16px',
              borderRadius: '8px',
              marginBottom: isMobile ? '4px' : '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onClick={navigateToTransportation}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span style={{ fontSize: isMobile ? '16px' : '20px' }}>🗺️</span>
              <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '500', color: '#374151' }}>{t('transportation')}</span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '8px' : '12px',
              padding: isMobile ? '8px 12px' : '12px 16px',
              borderRadius: '8px',
              marginBottom: isMobile ? '4px' : '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span style={{ fontSize: isMobile ? '16px' : '20px' }}>📚</span>
              <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '500', color: '#374151' }}>Drop Semester</span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '8px' : '12px',
              padding: isMobile ? '8px 12px' : '12px 16px',
              borderRadius: '8px',
              marginBottom: isMobile ? '4px' : '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span style={{ fontSize: isMobile ? '16px' : '20px' }}>📢</span>
              <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '500', color: '#374151' }}>Notice</span>
            </div>
          </nav>

          {/* Logout Button */}
          <div style={{ padding: isMobile ? '8px 12px' : '16px', marginTop: 'auto' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: isMobile ? '8px 12px' : '12px 16px',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isMobile ? '6px' : '8px'
              }}
            >
              <span style={{ fontSize: isMobile ? '14px' : '16px' }}>🚪</span>
              {t('logout')}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: '1', padding: isMobile ? '16px' : '24px' }}>
          {/* Welcome Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            borderRadius: isMobile ? '12px' : '16px',
            padding: isMobile ? '16px' : '20px',
            color: 'white',
            marginBottom: isMobile ? '20px' : '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              right: isMobile ? '12px' : '16px',
              top: isMobile ? '12px' : '16px',
              fontSize: isMobile ? '12px' : '14px',
              opacity: '0.8',
              textAlign: 'right',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: isMobile ? '6px' : '8px'
            }}>
              <div style={{ marginBottom: '2px' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>sponsored by : </span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>Uni Bus</span>
              </div>
              {/* Uni Bus Logo */}
              <img
                src="/uni-bus-logo.png.jpg"
                alt="Uni Bus Logo"
                style={{
                  width: isMobile ? '80px' : '120px',
                  height: isMobile ? '40px' : '60px',
                  objectFit: 'contain',
                  borderRadius: isMobile ? '10px' : '15px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  padding: isMobile ? '6px' : '8px',
                  backdropFilter: 'blur(5px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                onError={(e) => {
                  // Fallback if image doesn't load
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ 
                margin: '0 0 4px 0', 
                fontSize: isMobile ? '14px' : '16px', 
                opacity: '0.9' 
              }}>
                {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <h1 style={{ 
                margin: '0 0 4px 0', 
                fontSize: isMobile ? '24px' : '28px', 
                fontWeight: '700' 
              }}>
                {t('welcomeStudent')}, {(student?.fullName || user?.email || 'Student').split(' ')[0]}!
              </h1>
              <p style={{ 
                margin: '0', 
                fontSize: isMobile ? '14px' : '16px', 
                opacity: '0.9' 
              }}>
                Always stay updated in your student portal
              </p>
              
              {/* Profile Photo Section */}
              <div style={{
                marginTop: isMobile ? '12px' : '16px',
                padding: isMobile ? '12px' : '16px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: isMobile ? '6px' : '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                textAlign: 'center'
              }}>
                <h3 style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: isMobile ? '16px' : '18px', 
                  fontWeight: '600',
                  opacity: '0.95'
                }}>
                  Profile Photo
                </h3>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: isMobile ? '80px' : '120px',
                    height: isMobile ? '80px' : '120px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid rgba(255,255,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }}>
                    {student?.profilePhoto ? (
                      <img
                        src={student.profilePhoto}
                        alt="Profile"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{
                      display: student?.profilePhoto ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      fontSize: isMobile ? '24px' : '36px',
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: '600'
                    }}>
                      {student?.fullName?.charAt(0) || user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'S'}
                    </div>
                  </div>
                </div>
                {!student?.profilePhoto && (
                  <p style={{
                    margin: '12px 0 0 0',
                    fontSize: isMobile ? '12px' : '14px',
                    color: 'rgba(255,255,255,0.7)',
                    fontStyle: 'italic'
                  }}>
                    No profile photo uploaded
                  </p>
                )}
              </div>

              {/* Student Account Information */}
              <div style={{
                marginTop: isMobile ? '12px' : '16px',
                padding: isMobile ? '12px' : '16px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: isMobile ? '6px' : '8px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: isMobile ? '16px' : '18px', 
                  fontWeight: '600',
                  opacity: '0.95'
                }}>
                  Student Account Information
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(150px, 1fr))' : 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: isMobile ? '8px' : '12px' 
                }}>
                  <div>
                    <span style={{ fontSize: isMobile ? '12px' : '14px', opacity: '0.8' }}>Full Name:</span>
                    <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '500', marginTop: '2px' }}>
                      {student?.fullName || user?.fullName || user?.email?.split('@')[0] || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: isMobile ? '12px' : '14px', opacity: '0.8' }}>Email:</span>
                    <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '500', marginTop: '2px' }}>
                      {user?.email || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: isMobile ? '12px' : '14px', opacity: '0.8' }}>Student ID:</span>
                    <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '500', marginTop: '2px' }}>
                      {student?.studentId || user?.studentId || 'Not assigned'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: isMobile ? '12px' : '14px', opacity: '0.8' }}>College:</span>
                    <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '500', marginTop: '2px' }}>
                      {student?.college || user?.college || 'Not specified'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: isMobile ? '12px' : '14px', opacity: '0.8' }}>Grade Level:</span>
                    <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '500', marginTop: '2px' }}>
                      {student?.grade || user?.grade || 'Not specified'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: isMobile ? '12px' : '14px', opacity: '0.8' }}>Major:</span>
                    <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '500', marginTop: '2px' }}>
                      {student?.major || user?.major || 'Not specified'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Finance Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#1f2937',
              marginBottom: '20px'
            }}>
              Finance
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(150px, 1fr))' : 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: isMobile ? '16px' : '20px' 
            }}>
              {/* Registration Card */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              onClick={navigateToRegistration}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
              >
                <div style={{ fontSize: isMobile ? '40px' : '48px', marginBottom: '16px' }}>📝</div>
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  {t('attendance')}
                </h4>
              </div>


              {/* Your subscription plan Card */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              onClick={navigateToSubscription}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
              >
                <div style={{ fontSize: isMobile ? '40px' : '48px', marginBottom: '16px' }}>🚀</div>
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  {t('subscription')}
                </h4>
              </div>

              {/* Help Center Card */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              onClick={navigateToSupport}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
              >
                <div style={{ fontSize: isMobile ? '40px' : '48px', marginBottom: '16px' }}>🎧</div>
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  {t('support')}
                </h4>
              </div>
            </div>
          </div>

          {/* Additional Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '20px',
            marginBottom: '32px'
          }}>

            {/* Transportation Card */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onClick={navigateToTransportation}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
            >
              <div>
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '18px', 
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  Dates and locations Transportation
                </h4>
                <p style={{ 
                  margin: '0', 
                  fontSize: '14px', 
                  color: '#6b7280' 
                }}>
                  View schedules and routes
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '32px' }}>📅</div>
                <button style={{
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  View
                </button>
              </div>
            </div>
          </div>

          {/* QR Code Generator Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '32px'
          }}
          onClick={generateQRCode}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
            <h3 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '20px', 
              fontWeight: '600',
              color: '#1f2937'
            }}>
              Generate QR Code
            </h3>
            <p style={{ 
              margin: '0 0 20px 0', 
              fontSize: '14px', 
              color: '#6b7280' 
            }}>
              Generate and download your student QR code with email and information
            </p>
            <button style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              🚀 Generate QR Code
            </button>
          </div>

          {/* Daily Notice Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h4 style={{ 
                margin: '0', 
                fontSize: '18px', 
                fontWeight: '600',
                color: '#1f2937'
              }}>
                Daily notice
              </h4>
              <button style={{
                color: '#8b5cf6',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                See all
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <h5 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  Prelim payment due
                </h5>
                <p style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '14px', 
                  color: '#6b7280' 
                }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
                <button style={{
                  color: '#8b5cf6',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  See more
                </button>
              </div>
              
              <div style={{
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <h5 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  Exam schedule
                </h5>
                <p style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '14px', 
                  color: '#6b7280' 
                }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.
                </p>
                <button style={{
                  color: '#8b5cf6',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  See more
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
