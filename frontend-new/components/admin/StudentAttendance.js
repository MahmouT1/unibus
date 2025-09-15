import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import './StudentAttendance.css';

// Helper function to calculate summary statistics
const calculateSummaryStats = (studentsList) => {
  return {
    totalStudents: studentsList.length,
    activeStatus: studentsList.filter(s => s.status === 'Active').length,
    lowDays: studentsList.filter(s => s.status === 'Low Days').length,
    criticalStatus: studentsList.filter(s => s.status === 'Critical').length
  };
};

const StudentAttendance = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('All Colleges');
  const [summaryStats, setSummaryStats] = useState({
    totalStudents: 0,
    activeStatus: 0,
    lowDays: 0,
    criticalStatus: 0
  });

  // Fetch students data
  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchStudents();
  }, []);

  // Filter students based on search and filters
  useEffect(() => {
    let filtered = students;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.userId?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }


    // College filter
    if (selectedCollege !== 'All Colleges') {
      filtered = filtered.filter(student => student.college === selectedCollege);
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, selectedCollege]);

  const fetchStudents = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/attendance/records-simple?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const attendanceRecords = data.attendance || [];
        
        // Convert attendance records to student format for the table
        const studentsList = attendanceRecords.map(record => ({
          _id: record._id,
          fullName: record.studentId.fullName,
          studentId: record.studentId.studentId,
          college: record.studentId.college,
          academicYear: '2024-2025', // Default academic year
          email: record.studentId.email,
          phone: record.studentId.phone,
          grade: record.studentId.grade,
          major: record.studentId.major,
          attendanceStats: {
            daysRegistered: 1, // Based on attendance records
            remainingDays: 179,
            attendanceRate: 100
          },
          status: record.status,
          lastAttendance: record.checkInTime,
          verified: record.verified
        }));
        
        setStudents(studentsList);
        setSummaryStats(calculateSummaryStats(studentsList));
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete attendance record function
  const deleteAttendanceRecord = async (recordId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete the attendance record for ${studentName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/attendance/delete?id=${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Attendance record deleted:', result);
        
        // Show success message
        alert(`✅ Attendance record for ${studentName} has been deleted successfully!`);
        
        // Refresh the students list
        fetchStudents();
      } else {
        const error = await response.json();
        console.error('Failed to delete attendance record:', error);
        alert(`❌ Failed to delete attendance record: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      alert('❌ Error deleting attendance record. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'active';
      case 'Low Days': return 'low-days';
      case 'Critical': return 'critical';
      default: return 'active';
    }
  };

  const getRemainingDaysColor = (remainingDays) => {
    if (remainingDays <= 5) return 'critical';
    if (remainingDays <= 20) return 'low-days';
    return 'active';
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getUniqueColleges = () => {
    const colleges = [...new Set(students.map(s => s.college))];
    return colleges.filter(Boolean);
  };


  if (loading) {
    return (
      <div className="student-attendance">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading student attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-attendance">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="admin-profile">
            <div className="admin-avatar">
              <span>👤</span>
            </div>
            <div className="admin-info">
              <span className="admin-role">Admin User</span>
              <span className="admin-name">Administrator</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item active">
            <span className="nav-icon">📊</span>
            <span className="nav-label">Dashboard</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">📈</span>
            <span className="nav-label">Reports</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Settings</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">🌐</span>
            <span className="nav-label">Language</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">❓</span>
            <span className="nav-label">Help & Support</span>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Header */}
        <div className="top-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => router.push('/admin/supervisor-dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
          <div className="header-center">
            <span className="app-name">X Travel</span>
            <span className="current-page">Attendance</span>
          </div>
          <div className="header-right">
            <div className="notification-icon">
              <span>🔔</span>
              <span className="notification-badge">3</span>
            </div>
            <div className="user-profile">
              <span className="profile-icon">👤</span>
              <span className="user-role">Admin</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content">
          {/* Title Section */}
          <div className="title-section">
            <h1>Student Attendance</h1>
            <p>Track and manage student attendance records</p>
          </div>

          {/* Search and Filter Section */}
          <div className="search-filter-section">
            <div className="search-group">
              <label htmlFor="search">Search Student</label>
              <input
                type="text"
                id="search"
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>


            <div className="filter-group">
              <label htmlFor="college">College</label>
              <select
                id="college"
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                className="filter-select"
              >
                <option value="All Colleges">All Colleges</option>
                {getUniqueColleges().map(college => (
                  <option key={college} value={college}>{college}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Attendance Table */}
          <div className="table-section">
            <div className="table-header">
              <span className="table-icon">📄</span>
              <h3>Student Attendance Records</h3>
            </div>

            <div className="table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>STUDENT NAME</th>
                    <th>EMAIL</th>
                    <th>ID NUMBER</th>
                    <th>COLLEGE</th>
                    <th>ACADEMIC YEAR</th>
                    <th>DAYS REGISTERED</th>
                    <th>REMAINING DAYS</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr key={index} className="student-row">
                      <td className="student-name-cell">
                        <div className="student-info">
                          <div className="student-avatar">
                            {student.profilePhoto ? (
                              <img 
                                src={student.profilePhoto.startsWith('http') ? 
                                  student.profilePhoto : 
                                  student.profilePhoto || '/profile.png.png'} 
                                alt={student.fullName}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="avatar-fallback" style={{ display: student.profilePhoto ? 'none' : 'flex' }}>
                              {getInitials(student.fullName)}
                            </div>
                          </div>
                          <span className="student-name">{student.fullName}</span>
                        </div>
                      </td>
                      <td className="email-cell">{student.userId?.email || 'N/A'}</td>
                      <td className="id-cell">{student.studentId}</td>
                      <td className="college-cell">{student.college}</td>
                      <td className="year-cell">{student.academicYear}</td>
                      <td className="days-cell">
                        <span className="days-link">
                          {student.attendanceStats?.daysRegistered || 0} days
                        </span>
                      </td>
                      <td className="remaining-cell">
                        <span className={`remaining-link ${getRemainingDaysColor(student.attendanceStats?.remainingDays || 0)}`}>
                          {student.attendanceStats?.remainingDays || 0} days
                        </span>
                      </td>
                      <td className="status-cell">
                        <span className={`status-pill ${getStatusColor(student.status)}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="delete-btn"
                          onClick={() => deleteAttendanceRecord(student._id, student.fullName)}
                          title="Delete attendance record"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="summary-section">
            <div className="summary-card total">
              <div className="card-icon">👥</div>
              <div className="card-content">
                <div className="card-number">{summaryStats.totalStudents}</div>
                <div className="card-label">Total Students</div>
              </div>
            </div>

            <div className="summary-card active">
              <div className="card-icon">✅</div>
              <div className="card-content">
                <div className="card-number">{summaryStats.activeStatus}</div>
                <div className="card-label">Active Status</div>
              </div>
            </div>

            <div className="summary-card low-days">
              <div className="card-icon">⚠️</div>
              <div className="card-content">
                <div className="card-number">{summaryStats.lowDays}</div>
                <div className="card-label">Low Days</div>
              </div>
            </div>

            <div className="summary-card critical">
              <div className="card-icon">🚨</div>
              <div className="card-content">
                <div className="card-number">{summaryStats.criticalStatus}</div>
                <div className="card-label">Critical Status</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;