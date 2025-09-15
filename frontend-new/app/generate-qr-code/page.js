'use client';

import React, { useState, useEffect } from 'react';

export default function GenerateQRCodePage() {
  const [studentData, setStudentData] = useState({
    id: '',
    studentId: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    college: '',
    grade: '',
    major: '',
    address: '',
    profilePhoto: ''
  });
  const [qrCodeData, setQrCodeData] = useState('');
  const [generated, setGenerated] = useState(false);

  // Sample student data for testing
  const sampleStudents = [
    {
      id: 'student_001',
      studentId: 'STU001',
      fullName: 'John Doe',
      email: 'john.doe@university.edu',
      phoneNumber: '+1234567890',
      college: 'Engineering College',
      grade: 'Senior',
      major: 'Computer Science',
      address: '123 University St, City, State',
      profilePhoto: '/uploads/profiles/john-doe.png'
    },
    {
      id: 'student_002',
      studentId: 'STU002',
      fullName: 'Jane Smith',
      email: 'jane.smith@university.edu',
      phoneNumber: '+1234567891',
      college: 'Business School',
      grade: 'Junior',
      major: 'Business Administration',
      address: '456 College Ave, City, State',
      profilePhoto: '/uploads/profiles/jane-smith.png'
    },
    {
      id: 'student_003',
      studentId: 'STU003',
      fullName: 'Mike Johnson',
      email: 'mike.johnson@university.edu',
      phoneNumber: '+1234567892',
      college: 'Arts College',
      grade: 'Sophomore',
      major: 'Fine Arts',
      address: '789 Campus Rd, City, State',
      profilePhoto: '/uploads/profiles/mike-johnson.png'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const loadSampleStudent = (student) => {
    setStudentData(student);
    setGenerated(false);
  };

  const generateQRCode = () => {
    const qrData = JSON.stringify(studentData, null, 2);
    setQrCodeData(qrData);
    setGenerated(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrCodeData).then(() => {
      alert('QR Code data copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    });
  };

  const downloadQRCode = () => {
    // Create a simple text file with the QR data
    const blob = new Blob([qrCodeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-qr-${studentData.studentId || 'code'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>🎯 Generate Student QR Code</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>📋 Student Information</h2>
        <p>Fill in the student information to generate a QR code that can be scanned by supervisors.</p>
      </div>

      {/* Sample Students */}
      <div style={{ marginBottom: '30px' }}>
        <h3>📚 Sample Students (Click to Load)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
          {sampleStudents.map((student, index) => (
            <div key={index} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backgroundColor: '#f8f9fa'
            }}
            onClick={() => loadSampleStudent(student)}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#e9ecef';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#f8f9fa';
              e.target.style.transform = 'translateY(0)';
            }}
            >
              <h4 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{student.fullName}</h4>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>ID:</strong> {student.studentId}</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>College:</strong> {student.college}</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Major:</strong> {student.major}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Student Form */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>✏️ Student Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Student ID:</label>
            <input
              type="text"
              name="studentId"
              value={studentData.studentId}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="e.g., STU001"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Full Name:</label>
            <input
              type="text"
              name="fullName"
              value={studentData.fullName}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="e.g., John Doe"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
            <input
              type="email"
              name="email"
              value={studentData.email}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="e.g., john.doe@university.edu"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Phone Number:</label>
            <input
              type="tel"
              name="phoneNumber"
              value={studentData.phoneNumber}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="e.g., +1234567890"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>College:</label>
            <input
              type="text"
              name="college"
              value={studentData.college}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="e.g., Engineering College"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Grade:</label>
            <select
              name="grade"
              value={studentData.grade}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">Select Grade</option>
              <option value="Freshman">Freshman</option>
              <option value="Sophomore">Sophomore</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
              <option value="Graduate">Graduate</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Major:</label>
            <input
              type="text"
              name="major"
              value={studentData.major}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="e.g., Computer Science"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Address:</label>
            <input
              type="text"
              name="address"
              value={studentData.address}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="e.g., 123 University St, City, State"
            />
          </div>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={generateQRCode}
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#218838';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#28a745';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🎯 Generate QR Code
          </button>
        </div>
      </div>

      {/* Generated QR Code */}
      {generated && (
        <div style={{
          backgroundColor: '#e7f3ff',
          border: '1px solid #b3d9ff',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3>✅ QR Code Generated Successfully!</h3>
          <p>This JSON data can be used to create a QR code that supervisors can scan.</p>
          
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '15px',
            margin: '15px 0',
            fontFamily: 'monospace',
            fontSize: '12px',
            overflow: 'auto',
            maxHeight: '300px'
          }}>
            <pre>{qrCodeData}</pre>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={copyToClipboard}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📋 Copy to Clipboard
            </button>
            
            <button
              onClick={downloadQRCode}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              💾 Download JSON
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <h3>📖 Instructions</h3>
        <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li><strong>Fill in student information</strong> or click on a sample student</li>
          <li><strong>Click "Generate QR Code"</strong> to create the JSON data</li>
          <li><strong>Copy the JSON data</strong> to your clipboard</li>
          <li><strong>Use a QR code generator</strong> (online or app) to create a QR code from the JSON data</li>
          <li><strong>Test the QR code</strong> using the supervisor scanner</li>
        </ol>
        
        <div style={{ marginTop: '15px' }}>
          <h4>🔗 Recommended QR Code Generators:</h4>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li><a href="https://www.qr-code-generator.com/" target="_blank" rel="noopener noreferrer">QR Code Generator</a></li>
            <li><a href="https://qr-code-generator.com/" target="_blank" rel="noopener noreferrer">QR Code Generator (Alternative)</a></li>
            <li>Any QR code app on your phone</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
