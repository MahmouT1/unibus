'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './users.css';

export default function StudentSearchPage() {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const router = useRouter();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, [currentPage, debouncedSearchTerm]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log('Fetching students with search term:', debouncedSearchTerm, 'page:', currentPage);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);

      const response = await fetch(`/api/students/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setStudents(data.data.students);
        setPagination(data.data.pagination);
        console.log('Students loaded:', data.data.students.length);
      } else {
        console.error('API returned error:', data.message);
        setStudents([]);
        setPagination({});
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/students/search', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        const totalStudents = data.data.pagination.totalStudents;
        const studentsWithAttendance = data.data.students.filter(s => s.attendanceCount > 0);
        const activeStudents = studentsWithAttendance.length;
        
        setStats({
          totalStudents,
          activeStudents,
          totalAttendance: data.data.students.reduce((sum, s) => sum + s.attendanceCount, 0)
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    console.log('Search term changed:', value);
    setSearchTerm(value);
    // Only reset page when search term changes, not on every keystroke
    if (value !== debouncedSearchTerm) {
      setCurrentPage(1);
    }
  };

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    setShowModal(true);
    setDetailsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/students/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studentId: student._id })
      });

      const data = await response.json();
      
      if (data.success) {
        setStudentDetails(data.data);
      } else {
        console.error('Error fetching student details:', data.message);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatGrade = (grade) => {
    if (!grade) return 'N/A';
    return grade.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="users-loading">
        <div className="loading-spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <div className="users-management">
      <div className="page-header">
        <h1>Student Search & Inquiry</h1>
        <p>Search and view comprehensive student information and attendance records</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalStudents || 0}</h3>
            <p>Total Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.activeStudents || 0}</h3>
            <p>Active Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalAttendance || 0}</h3>
            <p>Total Attendance</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-content">
            <h3>{students.length}</h3>
            <p>Current Page</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search students by name, email, student ID, college, major, or grade..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {/* Students Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Student ID</th>
              <th>College</th>
              <th>Major</th>
              <th>Grade</th>
              <th>Attendance Days</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((student) => (
                <tr key={student._id} className="user-row">
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {student.profilePhoto ? (
                          <img src={student.profilePhoto} alt="Profile" />
                        ) : (
                          <span>{student.fullName?.charAt(0)?.toUpperCase() || 'S'}</span>
                        )}
                      </div>
                      <div className="user-details">
                        <div className="user-name">
                          {student.fullName || 'No name'}
                        </div>
                        <div className="user-email">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="student-id-badge">
                      {student.studentId || 'N/A'}
                    </span>
                  </td>
                  <td>{student.college || 'N/A'}</td>
                  <td>{student.major || 'N/A'}</td>
                  <td>
                    <span className="grade-badge">
                      {formatGrade(student.grade)}
                    </span>
                  </td>
                  <td>
                    <div className="attendance-count">
                      <span className={`attendance-badge ${student.attendanceCount > 0 ? 'has-attendance' : 'no-attendance'}`}>
                        {student.attendanceCount || 0} days
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleStudentClick(student)}
                        className="btn-edit"
                        title="View Student Details"
                      >
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-records">
                  {loading ? 'Loading students...' : 'No students found. Try adding some test data or check your database connection.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* Student Details Modal */}
      {showModal && selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          studentDetails={studentDetails}
          detailsLoading={detailsLoading}
          onClose={() => {
            setShowModal(false);
            setSelectedStudent(null);
            setStudentDetails(null);
          }}
        />
      )}
    </div>
  );
}

// Student Details Modal Component
function StudentDetailsModal({ student, studentDetails, detailsLoading, onClose }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatGrade = (grade) => {
    if (!grade) return 'N/A';
    return grade.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content student-details-modal">
        <div className="modal-header">
          <h2>Student Details</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        
        {detailsLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading student details...</p>
          </div>
        ) : (
          <div className="student-details-content">
            {/* Student Profile Section */}
            <div className="student-profile-section">
              <div className="student-avatar-large">
                {student.profilePhoto ? (
                  <img src={student.profilePhoto} alt="Profile" />
                ) : (
                  <span>{student.fullName?.charAt(0)?.toUpperCase() || 'S'}</span>
                )}
              </div>
              <div className="student-basic-info">
                <h3>{student.fullName || 'No name'}</h3>
                <p className="student-email">{student.email}</p>
                <p className="student-id">ID: {student.studentId || 'N/A'}</p>
              </div>
            </div>

            {/* Academic Information */}
            <div className="info-section">
              <h4>Academic Information</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>College:</label>
                  <span>{student.college || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Major:</label>
                  <span>{student.major || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Grade:</label>
                  <span>{formatGrade(student.grade)}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{student.phoneNumber || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Address Information */}
            {student.address && (
              <div className="info-section">
                <h4>Address Information</h4>
                <div className="info-grid">
                  <div className="info-item full-width">
                    <label>Full Address:</label>
                    <span>{student.address.fullAddress || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Attendance Statistics */}
            {studentDetails && (
              <div className="info-section">
                <h4>Attendance Statistics</h4>
                <div className="attendance-stats">
                  <div className="stat-item">
                    <div className="stat-number">{studentDetails.attendance.totalAttendance}</div>
                    <div className="stat-label">Total Attendance Days</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{studentDetails.attendance.totalAbsences}</div>
                    <div className="stat-label">Total Absences</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">
                      {studentDetails.attendance.lastAttendance ? 
                        formatDate(studentDetails.attendance.lastAttendance.checkInTime) : 
                        'Never'
                      }
                    </div>
                    <div className="stat-label">Last Attendance</div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Attendance Records */}
            {studentDetails && studentDetails.attendance.records.length > 0 && (
              <div className="info-section">
                <h4>Recent Attendance Records</h4>
                <div className="attendance-records">
                  <table className="attendance-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentDetails.attendance.records.slice(0, 10).map((record, index) => (
                        <tr key={index}>
                          <td>{formatDate(record.checkInTime)}</td>
                          <td>{new Date(record.checkInTime).toLocaleTimeString()}</td>
                          <td>
                            <span className={`status-badge ${record.status.toLowerCase()}`}>
                              {record.status}
                            </span>
                          </td>
                          <td>{record.location || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
