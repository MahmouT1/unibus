import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './StudentAttendance.css';

const StudentAttendance = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('All Years');
  const [filterCollege, setFilterCollege] = useState('All Colleges');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/admin/students?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Transform the data to match the existing component structure
        const transformedRecords = data.students.map(student => ({
          id: student._id,
          name: student.fullName,
          email: student.userId?.email || 'No email',
          idNumber: student.studentId,
          college: student.college,
          academicYear: student.academicYear || '2024-2025',
          daysRegistered: student.attendanceStats?.daysRegistered || 0,
          remainingDays: student.attendanceStats?.remainingDays || 180,
          status: student.status || 'Active',
        }));
        setRecords(transformedRecords);
      } else {
        setError('Failed to fetch student data');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleYearChange = (e) => {
    setFilterYear(e.target.value);
  };

  const handleCollegeChange = (e) => {
    setFilterCollege(e.target.value);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.idNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesYear = filterYear === 'All Years' || record.academicYear === filterYear;
    const matchesCollege = filterCollege === 'All Colleges' || record.college === filterCollege;

    return matchesSearch && matchesYear && matchesCollege;
  });

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#10b981';
      case 'Low Days': return '#f59e0b';
      case 'Critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return '✅';
      case 'Low Days': return '⚠️';
      case 'Critical': return '🚨';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="student-attendance">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading student data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-attendance">
        <div className="error-container">
          <p>Error: {error}</p>
          <button onClick={fetchStudents} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-attendance">
      {/* Simple Header */}
      <div className="attendance-header">
        <h1>Student Attendance</h1>
        <div className="header-actions">
          <button className="btn-export">📊 Export</button>
          <button onClick={fetchStudents} className="btn-add">🔄 Refresh</button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-number">{filteredRecords.length}</span>
          <span className="stat-label">Total Students</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{filteredRecords.filter(r => r.status === 'Active').length}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{filteredRecords.filter(r => r.status === 'Low Days').length}</span>
          <span className="stat-label">Low Days</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{filteredRecords.filter(r => r.status === 'Critical').length}</span>
          <span className="stat-label">Critical</span>
        </div>
      </div>

      {/* Simple Filters */}
      <div className="filters-row">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div className="filter-container">
          <select value={filterYear} onChange={handleYearChange} className="filter-select">
            <option>All Years</option>
            <option>2023-2024</option>
            <option>2024-2025</option>
          </select>
          <select value={filterCollege} onChange={handleCollegeChange} className="filter-select">
            <option>All Colleges</option>
            <option>Engineering</option>
            <option>Medicine</option>
            <option>Business</option>
            <option>Arts</option>
            <option>Science</option>
          </select>
        </div>
      </div>

      {/* Simple Table */}
      <div className="table-section">
        <div className="table-header">
          <h3>Attendance Records ({filteredRecords.length})</h3>
        </div>
        
        <div className="table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable">
                  Student
                  {sortBy === 'name' && <span className="sort-arrow">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                </th>
                <th onClick={() => handleSort('college')} className="sortable">
                  College
                  {sortBy === 'college' && <span className="sort-arrow">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                </th>
                <th onClick={() => handleSort('daysRegistered')} className="sortable">
                  Days
                  {sortBy === 'daysRegistered' && <span className="sort-arrow">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                </th>
                <th onClick={() => handleSort('remainingDays')} className="sortable">
                  Remaining
                  {sortBy === 'remainingDays' && <span className="sort-arrow">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRecords.map((record) => (
                <tr key={record.id}>
                  <td className="student-cell">
                    <div className="student-info">
                      <div className="student-name">{record.name}</div>
                      <div className="student-details">
                        <span className="student-id">{record.idNumber}</span>
                        <span className="student-email">{record.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="college-cell">
                    <span className="college-tag">{record.college}</span>
                  </td>
                  <td className="days-cell">
                    <span className="days-number">{record.daysRegistered}</span>
                  </td>
                  <td className="remaining-cell">
                    <span 
                      className={`remaining-number ${record.remainingDays <= 10 ? 'critical' : record.remainingDays <= 20 ? 'warning' : 'normal'}`}
                    >
                      {record.remainingDays}
                    </span>
                  </td>
                  <td className="status-cell">
                    <span 
                      className="status-tag"
                      style={{ backgroundColor: getStatusColor(record.status) + '20', color: getStatusColor(record.status) }}
                    >
                      {getStatusIcon(record.status)} {record.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button className="action-btn view" title="View">👁️</button>
                      <button className="action-btn edit" title="Edit">✏️</button>
                      <button className="action-btn delete" title="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredRecords.length === 0 && (
            <div className="no-data">
              <p>No students found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
