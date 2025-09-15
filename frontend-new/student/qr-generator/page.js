'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentQRGenerator() {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get user and student data from localStorage
    const userData = localStorage.getItem('user');
    const studentData = localStorage.getItem('student');
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
    if (studentData) {
      setStudent(JSON.parse(studentData));
    }
  }, []);

  const generateQR = async () => {
    setLoading(true);
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
      console.log('QR API Response:', data);
      
      if (data.success) {
        setQrCode(data.qrCodeDataURL || data.qrCode || data.data);
        alert('✅ QR code generated successfully!');
      } else {
        alert('❌ Failed to generate QR code: ' + data.message);
      }
    } catch (error) {
      console.error('Error generating QR:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (qrCode) {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `student-qr-code-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('📥 QR code downloaded successfully!');
    }
  };

  const goBack = () => {
    router.push('/student/portal');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '30px',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>🎓 Student QR Code Generator</h1>
          <p style={{ margin: '0', opacity: '0.9', fontSize: '16px' }}>
            Generate your personalized student QR code with email and information
          </p>
        </div>

        {/* Main Content */}
        <div style={{ padding: '40px' }}>
          {/* Student Information */}
          <div style={{
            background: '#f8f9fa',
            padding: '25px',
            borderRadius: '10px',
            marginBottom: '30px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ color: '#333', marginBottom: '20px', textAlign: 'center' }}>👤 Your Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              <div>
                <strong>Name:</strong> {student?.fullName || user?.fullName || user?.email?.split('@')[0] || 'Student'}
              </div>
              <div>
                <strong>Email:</strong> {user?.email || 'N/A'}
              </div>
              <div>
                <strong>Student ID:</strong> {student?.studentId || user?.studentId || 'N/A'}
              </div>
              <div>
                <strong>Phone:</strong> {student?.phoneNumber || user?.phoneNumber || 'N/A'}
              </div>
              <div>
                <strong>College:</strong> {student?.college || user?.college || 'N/A'}
              </div>
              <div>
                <strong>Grade:</strong> {student?.grade || user?.grade || 'N/A'}
              </div>
              <div>
                <strong>Major:</strong> {student?.major || user?.major || 'N/A'}
              </div>
              <div>
                <strong>Address:</strong> {student?.address?.streetAddress || user?.address?.streetAddress || 'N/A'}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <button 
              onClick={generateQR} 
              disabled={loading}
              style={{
                padding: '15px 30px',
                backgroundColor: loading ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '18px',
                fontWeight: '600',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              {loading ? '⏳ Generating QR Code...' : '🚀 Generate My QR Code'}
            </button>
          </div>

          {/* QR Code Display */}
          {qrCode && (
            <div style={{ 
              textAlign: 'center',
              padding: '30px',
              backgroundColor: '#d4edda',
              borderRadius: '10px',
              border: '2px solid #28a745'
            }}>
              <h3 style={{ color: '#155724', marginBottom: '20px' }}>✅ QR Code Generated Successfully!</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <img 
                  src={qrCode} 
                  alt="Student QR Code" 
                  style={{ 
                    width: '300px', 
                    height: '300px', 
                    border: '3px solid #28a745',
                    borderRadius: '10px',
                    display: 'block',
                    margin: '0 auto'
                  }} 
                />
              </div>
              
              <button 
                onClick={downloadQR}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  marginRight: '10px'
                }}
              >
                📥 Download QR Code
              </button>
            </div>
          )}

          {/* Back Button */}
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button 
              onClick={goBack}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ← Back to Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
