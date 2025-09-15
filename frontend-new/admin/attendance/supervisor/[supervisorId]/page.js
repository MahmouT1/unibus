'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SupervisorAttendancePage({ params }) {
  const [user, setUser] = useState(null);
  const [supervisorShift, setSupervisorShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const shiftId = searchParams.get('shiftId');
  const supervisorId = use(params).supervisorId;

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Only allow admin access to this page
      if (parsedUser.role !== 'admin') {
        router.push('/login');
        return;
      }
    } else {
      router.push('/login');
    }
    
    // Check if required parameters are present
    if (!supervisorId || !shiftId) {
      setLoading(false);
      return;
    }
    
    if (shiftId) {
      loadSupervisorShift();
    }
  }, [router, shiftId, supervisorId]);

  const loadSupervisorShift = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/shifts?supervisorId=${supervisorId}&shiftId=${shiftId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success && data.shifts.length > 0) {
        setSupervisorShift(data.shifts[0]);
      }
    } catch (error) {
      console.error('Error loading supervisor shift:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getShiftDuration = (shiftStart, shiftEnd) => {
    const start = new Date(shiftStart);
    const end = shiftEnd ? new Date(shiftEnd) : new Date();
    return Math.floor((end - start) / (1000 * 60));
  };

  // Check for missing required parameters
  if (!supervisorId || !shiftId) {
    console.log('Missing parameters:', { supervisorId, shiftId });
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#dc2626', marginBottom: '10px' }}>Missing Required Parameters</h2>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>
          Shift ID and Supervisor ID are required to view this page.
        </p>
        <div style={{ 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '8px', 
          padding: '15px', 
          marginBottom: '20px',
          fontSize: '14px',
          color: '#991b1b'
        }}>
          <p><strong>Debug Info:</strong></p>
          <p>Supervisor ID: {supervisorId || 'Missing'}</p>
          <p>Shift ID: {shiftId || 'Missing'}</p>
          <p style={{ marginTop: '10px', fontSize: '12px' }}>
            This page should be accessed from the main attendance page by clicking on an active supervisor button.
          </p>
        </div>
        <button 
          onClick={() => router.push('/admin/attendance')}
          style={{
            padding: '12px 24px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          ← Return to Attendance Page
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading supervisor shift data...</div>
      </div>
    );
  }

  if (!supervisorShift) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h2>Shift Not Found</h2>
        <p>The requested supervisor shift could not be found.</p>
        <button 
          onClick={() => router.push('/admin/attendance')}
          style={{
            padding: '10px 20px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Back to Attendance
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <div>
          <h1 style={{ 
            color: '#333', 
            margin: '0 0 10px 0',
            fontSize: '28px'
          }}>
            Supervisor Attendance Records
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            {supervisorShift.supervisorName} - {formatDate(supervisorShift.shiftStart)}
          </p>
        </div>
        <button 
          onClick={() => router.push('/admin/attendance')}
          style={{
            padding: '10px 20px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Back to Attendance
        </button>
      </div>

      {/* Shift Information */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '30px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>Shift Information</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div>
            <h3 style={{ margin: '0 0 5px 0', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
              SUPERVISOR
            </h3>
            <p style={{ margin: 0, color: '#1f2937', fontSize: '16px' }}>
              {supervisorShift.supervisorName}
            </p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 5px 0', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
              EMAIL
            </h3>
            <p style={{ margin: 0, color: '#1f2937', fontSize: '16px' }}>
              {supervisorShift.supervisorEmail}
            </p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 5px 0', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
              STATUS
            </h3>
            <span style={{
              background: supervisorShift.status === 'open' ? '#d1fae5' : '#e5e7eb',
              color: supervisorShift.status === 'open' ? '#065f46' : '#374151',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              {supervisorShift.status}
            </span>
          </div>
          <div>
            <h3 style={{ margin: '0 0 5px 0', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
              STARTED
            </h3>
            <p style={{ margin: 0, color: '#1f2937', fontSize: '16px' }}>
              {formatTime(supervisorShift.shiftStart)}
            </p>
          </div>
          {supervisorShift.shiftEnd && (
            <div>
              <h3 style={{ margin: '0 0 5px 0', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
                ENDED
              </h3>
              <p style={{ margin: 0, color: '#1f2937', fontSize: '16px' }}>
                {formatTime(supervisorShift.shiftEnd)}
              </p>
            </div>
          )}
          <div>
            <h3 style={{ margin: '0 0 5px 0', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
              DURATION
            </h3>
            <p style={{ margin: 0, color: '#1f2937', fontSize: '16px' }}>
              {getShiftDuration(supervisorShift.shiftStart, supervisorShift.shiftEnd)} minutes
            </p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 5px 0', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
              TOTAL SCANS
            </h3>
            <p style={{ margin: 0, color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>
              {supervisorShift.totalScans}
            </p>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>
          Student Attendance Records ({supervisorShift.attendanceRecords?.length || 0})
        </h2>
        
        {supervisorShift.attendanceRecords && supervisorShift.attendanceRecords.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: 'white',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <thead>
                <tr style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}>
                  <th style={{
                    padding: '15px',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Student Name
                  </th>
                  <th style={{
                    padding: '15px',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Student ID
                  </th>
                  <th style={{
                    padding: '15px',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    College
                  </th>
                  <th style={{
                    padding: '15px',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Scan Time
                  </th>
                  <th style={{
                    padding: '15px',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Location
                  </th>
                  <th style={{
                    padding: '15px',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {supervisorShift.attendanceRecords.map((record, index) => (
                  <tr key={`${supervisorShift.id}-record-${index}`} style={{
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <td style={{
                      padding: '15px',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {record.studentName}
                    </td>
                    <td style={{
                      padding: '15px',
                      color: '#6b7280'
                    }}>
                      {record.studentId}
                    </td>
                    <td style={{
                      padding: '15px',
                      color: '#6b7280'
                    }}>
                      {record.college}
                    </td>
                    <td style={{
                      padding: '15px',
                      color: '#6b7280'
                    }}>
                      {formatTime(record.scanTime)}
                    </td>
                    <td style={{
                      padding: '15px',
                      color: '#6b7280'
                    }}>
                      {record.location || 'N/A'}
                    </td>
                    <td style={{
                      padding: '15px',
                      color: '#6b7280'
                    }}>
                      {record.notes || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#9ca3af'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📋</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', margin: '0 0 10px 0' }}>
              No Attendance Records
            </h3>
            <p style={{ margin: 0 }}>
              No students have been scanned in this shift yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
