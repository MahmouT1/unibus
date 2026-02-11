'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const StudentProfile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [qrCode, setQrCode] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const studentDataStr = localStorage.getItem('student');
    if (!userData) {
      router.push('/auth');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role === 'admin') { window.location.href = '/admin/dashboard'; return; }
    if (parsedUser.role === 'supervisor') { window.location.href = '/admin/supervisor-dashboard'; return; }
    if (!studentDataStr) {
      router.push('/auth');
      return;
    }
    const studentData = JSON.parse(studentDataStr);
    setStudent(studentData);
    setFormData(studentData);
    
    // Fetch additional student data
    fetchStudentProfile(studentData.email);
    fetchQRCode(studentData.studentId);
    fetchAttendanceStats(studentData.id);
  }, [router]);

  const fetchStudentProfile = async (email) => {
    try {
      const response = await fetch(`/api/students/data?email=${email}`);
      const data = await response.json();
      
      if (data.success && data.students.length > 0) {
        const fullStudentData = data.students[0];
        setStudent(fullStudentData);
        setFormData(fullStudentData);
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQRCode = async (studentId) => {
    try {
      const response = await fetch(`/api/students/generate-qr?studentId=${studentId}`);
      const data = await response.json();
      
      if (data.success) {
        setQrCode(data.qrCode);
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
    }
  };

  const fetchAttendanceStats = async (studentId) => {
    try {
      const response = await fetch(`/api/attendance/stats?studentId=${studentId}`);
      const data = await response.json();
      
      if (data.success) {
        setAttendanceStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    }
  };

  const generateQRCode = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId: student.studentId })
      });

      const data = await response.json();
      
      if (data.success) {
        setQrCode(data.qrCode);
        alert('QR Code generated successfully!');
      } else {
        alert('Failed to generate QR code: ' + data.message);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students/data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: student._id,
          ...formData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setStudent(data.student);
        setEditing(false);
        alert('Profile updated successfully!');
        
        // Update localStorage
        localStorage.setItem('student', JSON.stringify(data.student));
      } else {
        alert('Failed to update profile: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(student);
    setEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('student');
    localStorage.removeItem('token');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    sessionStorage.clear();
    window.location.href = '/auth';
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="profile-container">
        <div className="error">
          <p>Failed to load student profile</p>
          <button onClick={() => window.location.href = '/auth'}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Student Profile</h1>
        <div className="header-actions">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="profile-content">
        {/* Basic Information */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Basic Information</h2>
            {!editing ? (
              <button onClick={handleEdit} className="edit-btn">
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button onClick={handleSave} className="save-btn">
                  Save
                </button>
                <button onClick={handleCancel} className="cancel-btn">
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="profile-form">
            <div className="form-group">
              <label>Full Name</label>
              {editing ? (
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName || ''}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{student.fullName}</p>
              )}
            </div>

            <div className="form-group">
              <label>Student ID</label>
              <p>{student.studentId}</p>
            </div>

            <div className="form-group">
              <label>Email</label>
              <p>{student.email}</p>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              {editing ? (
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{student.phoneNumber}</p>
              )}
            </div>

            <div className="form-group">
              <label>College</label>
              {editing ? (
                <input
                  type="text"
                  name="college"
                  value={formData.college || ''}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{student.college}</p>
              )}
            </div>

            <div className="form-group">
              <label>Major</label>
              {editing ? (
                <input
                  type="text"
                  name="major"
                  value={formData.major || ''}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{student.major}</p>
              )}
            </div>

            <div className="form-group">
              <label>Grade</label>
              {editing ? (
                <select
                  name="grade"
                  value={formData.grade || ''}
                  onChange={handleInputChange}
                >
                  <option value="first-year">First Year</option>
                  <option value="second-year">Second Year</option>
                  <option value="third-year">Third Year</option>
                  <option value="fourth-year">Fourth Year</option>
                  <option value="fifth-year">Fifth Year</option>
                </select>
              ) : (
                <p>{student.grade?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
              )}
            </div>

            <div className="form-group">
              <label>Address</label>
              {editing ? (
                <textarea
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                  rows="3"
                />
              ) : (
                <p>{student.address || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Your QR Code</h2>
            <button onClick={generateQRCode} className="generate-qr-btn">
              {qrCode ? 'Regenerate QR Code' : 'Generate QR Code'}
            </button>
          </div>

          <div className="qr-code-section">
            {qrCode ? (
              <div className="qr-code-display">
                <img src={qrCode} alt="Student QR Code" />
                <p>Show this QR code to supervisors for attendance</p>
                <a href={qrCode} download={`${student.studentId}_qr_code.png`}>
                  Download QR Code
                </a>
              </div>
            ) : (
              <div className="no-qr-code">
                <p>No QR code generated yet</p>
                <p>Click "Generate QR Code" to create your attendance QR code</p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Statistics */}
        {attendanceStats && (
          <div className="profile-section">
            <h2>Attendance Statistics</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <h3>{attendanceStats.totalDays || 0}</h3>
                <p>Total Days</p>
              </div>
              <div className="stat-item">
                <h3>{attendanceStats.presentDays || 0}</h3>
                <p>Present Days</p>
              </div>
              <div className="stat-item">
                <h3>{attendanceStats.absentDays || 0}</h3>
                <p>Absent Days</p>
              </div>
              <div className="stat-item">
                <h3>{attendanceStats.attendanceRate || 0}%</h3>
                <p>Attendance Rate</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
        }

        .profile-header h1 {
          color: #333;
          margin: 0;
        }

        .logout-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 500;
        }

        .logout-btn:hover {
          background: #c82333;
        }

        .profile-section {
          background: white;
          border-radius: 10px;
          padding: 25px;
          margin-bottom: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h2 {
          color: #333;
          margin: 0;
        }

        .edit-btn, .generate-qr-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
        }

        .edit-btn:hover, .generate-qr-btn:hover {
          background: #0056b3;
        }

        .edit-actions {
          display: flex;
          gap: 10px;
        }

        .save-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 5px;
          cursor: pointer;
        }

        .cancel-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 5px;
          cursor: pointer;
        }

        .profile-form {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 600;
          color: #555;
          margin-bottom: 5px;
        }

        .form-group p {
          margin: 0;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 5px;
          color: #333;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
        }

        .qr-code-section {
          text-align: center;
        }

        .qr-code-display img {
          max-width: 200px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          margin-bottom: 15px;
        }

        .qr-code-display p {
          color: #666;
          margin-bottom: 10px;
        }

        .qr-code-display a {
          background: #007bff;
          color: white;
          padding: 10px 20px;
          border-radius: 5px;
          text-decoration: none;
          display: inline-block;
        }

        .no-qr-code {
          padding: 40px;
          color: #666;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
        }

        .stat-item {
          text-align: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
        }

        .stat-item h3 {
          margin: 0 0 10px 0;
          font-size: 2em;
          color: #007bff;
        }

        .stat-item p {
          margin: 0;
          color: #666;
          font-weight: 500;
        }

        .loading, .error {
          text-align: center;
          padding: 40px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .profile-container {
            padding: 10px;
          }

          .profile-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .profile-form {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default StudentProfile;
