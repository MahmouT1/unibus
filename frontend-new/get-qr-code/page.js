'use client';

import { useState } from 'react';

export default function GetQRCode() {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [studentInfo, setStudentInfo] = useState({
    fullName: 'Ahmed Hassan',
    studentId: '2024001',
    email: 'ahmed.hassan@student.edu',
    college: 'Engineering',
    grade: 'First Year',
    major: 'Computer Science'
  });

  const generateQR = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/students/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
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
      link.download = 'student-qr-code.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('📥 QR code downloaded successfully!');
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '1000px', 
      margin: '0 auto',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h1 style={{ color: '#2d3748', marginBottom: '10px' }}>🎓 Student QR Code Generator</h1>
        <p style={{ color: '#6c757d', marginBottom: '30px' }}>Generate and download your student QR code instantly</p>
        
        <div style={{ marginBottom: '30px' }}>
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
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {loading ? '⏳ Generating QR Code...' : '🚀 Generate My QR Code'}
          </button>
        </div>

        {qrCode && (
          <div style={{ 
            marginTop: '30px', 
            padding: '25px', 
            backgroundColor: '#d4edda', 
            borderRadius: '8px',
            border: '2px solid #28a745'
          }}>
            <h3 style={{ color: '#155724', marginBottom: '20px' }}>✅ QR Code Generated Successfully!</h3>
            
            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
              {/* Student Info */}
              <div style={{ flex: '1' }}>
                <h4 style={{ color: '#155724', marginBottom: '15px' }}>👤 Student Information</h4>
                <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '6px' }}>
                  <p><strong>Name:</strong> {studentInfo.fullName}</p>
                  <p><strong>Student ID:</strong> {studentInfo.studentId}</p>
                  <p><strong>Email:</strong> {studentInfo.email}</p>
                  <p><strong>College:</strong> {studentInfo.college}</p>
                  <p><strong>Grade:</strong> {studentInfo.grade}</p>
                  <p><strong>Major:</strong> {studentInfo.major}</p>
                </div>
              </div>
              
              {/* QR Code */}
              <div style={{ flex: '1', textAlign: 'center' }}>
                <h4 style={{ color: '#155724', marginBottom: '15px' }}>📱 Your QR Code</h4>
                <img 
                  src={qrCode} 
                  alt="Student QR Code" 
                  style={{ 
                    width: '250px', 
                    height: '250px', 
                    border: '3px solid #28a745',
                    borderRadius: '8px',
                    display: 'block',
                    margin: '0 auto 20px'
                  }} 
                />
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
                    fontWeight: '600'
                  }}
                >
                  📥 Download QR Code
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>📋 Registration Form (No Photo Upload)</h3>
        <p style={{ color: '#6c757d', marginBottom: '20px' }}>
          Complete your registration in 4 simple steps - no photo upload required!
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>👤</div>
            <strong>Step 1: Personal</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>Name, Phone, Email</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#f3e5f5', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎓</div>
            <strong>Step 2: Academic</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>College, Grade, Major</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📍</div>
            <strong>Step 3: Address</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>Street, Building, City</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#fff3e0', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
            <strong>Step 4: Review</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>Check & Generate QR</p>
          </div>
        </div>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a 
            href="/student/register" 
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            🚀 Start Registration (No Photo Upload)
          </a>
        </div>
      </div>
    </div>
  );
}
