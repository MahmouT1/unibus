'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './users.css';

const formatScanTime = (dt) => {
  if (!dt) return '—';
  const d = new Date(dt);
  return d.toLocaleString(undefined, {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const StudentSearchPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalStudents: 0,
    limit: 20
  });
  const [attendanceModal, setAttendanceModal] = useState({
    open: false,
    student: null,
    records: [],
    loading: false
  });

  const router = useRouter();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm })
      });
      const response = await fetch(`/api/students/search?${params}`);
      const data = await response.json();
      if (data.success && data.data) {
        setStudents(data.data.students || []);
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination?.totalPages || 1,
          totalStudents: data.data.pagination?.totalStudents || 0
        }));
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error('Fetch students error:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [pagination.current, searchTerm]);

  const handleSearch = (e) => {
    e?.preventDefault();
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const getAttendanceBadgeClass = (days) => {
    if (!days || days === 0) return 'attendance-badge no-attendance';
    if (days <= 5) return 'attendance-badge low-attendance';
    if (days <= 15) return 'attendance-badge medium-attendance';
    if (days <= 30) return 'attendance-badge high-attendance';
    return 'attendance-badge very-high-attendance';
  };

  const totalAttendance = students.reduce((sum, s) => sum + (s.attendanceCount || 0), 0);
  const activeStudents = students.filter(s => (s.attendanceCount || 0) > 0).length;

  const openAttendanceModal = async (student) => {
    setAttendanceModal({ open: true, student, records: [], loading: true });
    try {
      const res = await fetch('/api/students/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: student._id, email: student.email })
      });
      const data = await res.json();
      if (data.success && data.data) {
        const recs = data.data.attendance?.records || [];
        setAttendanceModal({ open: true, student, records: recs, loading: false });
      } else {
        setAttendanceModal(prev => ({ ...prev, records: [], loading: false }));
      }
    } catch (err) {
      setAttendanceModal(prev => ({ ...prev, records: [], loading: false }));
    }
  };

  const closeAttendanceModal = () => {
    setAttendanceModal({ open: false, student: null, records: [], loading: false });
  };

  return (
    <div className="users-management">
      <div className="page-header">
        <h1>Student Search</h1>
        <p>Search and view students with attendance days</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{pagination.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{activeStudents}</h3>
            <p>Active Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{totalAttendance}</h3>
            <p>Total Attendance</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>{pagination.current}</h3>
            <p>Current Page</p>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-box" style={{ flex: 1 }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search students by name, email, student ID, college, major, or grade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
          />
          <span className="search-icon">🔍</span>
        </form>
        <button onClick={() => fetchStudents()} className="refresh-btn" style={{
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          cursor: 'pointer'
        }}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="users-loading">
          <div className="loading-spinner"></div>
          <p>Loading students...</p>
        </div>
      ) : (
        <div className="users-table">
          <table>
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
              {students.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    No students found
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '1rem'
                        }}>
                          {(student.fullName || '?')[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{student.fullName || 'Unknown'}</div>
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>{student.email || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge" style={{ background: '#e1e5e9', color: '#333' }}>{student.studentId || 'N/A'}</span></td>
                    <td>{student.college || 'N/A'}</td>
                    <td>{student.major || 'N/A'}</td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(102, 126, 234, 0.2)', color: '#667eea' }}>
                        {student.grade || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={getAttendanceBadgeClass(student.attendanceCount)}>
                        {student.attendanceCount ?? 0} days
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="edit-btn"
                          onClick={() => openAttendanceModal(student)}
                          title="سجل الحضور"
                        >
                          👁
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => {
                            if (confirm(`Delete ${student.fullName}?`)) {
                              // Optional: call delete API
                            }
                          }}
                          title="Delete"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {pagination.total > 1 && (
        <div className="pagination" style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            disabled={pagination.current <= 1}
            onClick={() => setPagination(p => ({ ...p, current: p.current - 1 }))}
          >
            Previous
          </button>
          <span>Page {pagination.current} of {pagination.total}</span>
          <button
            disabled={pagination.current >= pagination.total}
            onClick={() => setPagination(p => ({ ...p, current: p.current + 1 }))}
          >
            Next
          </button>
        </div>
      )}

      {/* سجل حضور الطالب */}
      {attendanceModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20
          }}
          onClick={closeAttendanceModal}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 12,
              maxWidth: 900,
              width: '100%',
              maxHeight: '85vh',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                سجل حضور: {attendanceModal.student?.fullName || 'Unknown'}
              </h3>
              <button
                onClick={closeAttendanceModal}
                style={{
                  background: '#eee',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                إغلاق
              </button>
            </div>
            <div style={{ overflow: 'auto', maxHeight: 'calc(85vh - 80px)' }}>
              {attendanceModal.loading ? (
                <div style={{ padding: 60, textAlign: 'center', color: '#666' }}>
                  جاري التحميل...
                </div>
              ) : attendanceModal.records.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center', color: '#666' }}>
                  لا توجد سجلات حضور لهذا الطالب
                </div>
              ) : (
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Student</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Email</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>College</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Scan Time</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceModal.records.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px 16px' }}>{r.studentName || '—'}</td>
                        <td style={{ padding: '12px 16px' }}>{r.studentEmail || '—'}</td>
                        <td style={{ padding: '12px 16px' }}>{r.college || '—'}</td>
                        <td style={{ padding: '12px 16px' }}>{formatScanTime(r.scanTime || r.checkInTime)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: 20,
                            background: 'rgba(34, 197, 94, 0.2)',
                            color: '#16a34a',
                            fontWeight: 500,
                            fontSize: '0.875rem'
                          }}>
                            {r.status || 'Present'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSearchPage;
