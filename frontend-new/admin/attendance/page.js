'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../lib/contexts/LanguageContext';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import '../../../src/components/admin/StudentAttendance.css';

// Helper function to calculate summary statistics
const calculateSummaryStats = (studentsList) => {
  return {
    totalStudents: studentsList.length,
    activeStudents: studentsList.filter(s => s.status === 'Active').length,
    inactiveStudents: studentsList.filter(s => s.status === 'Inactive').length,
    criticalStatus: studentsList.filter(s => s.status === 'Critical').length
  };
};

function AdminAttendancePageContent() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Attendance records states
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Filter states
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSupervisor, setSelectedSupervisor] = useState('All Supervisors');
  const [supervisors, setSupervisors] = useState([]);
  
  // Active shifts for live monitoring
  const [activeShifts, setActiveShifts] = useState([]);
  
  // Shift-based pagination states
  const [supervisorShifts, setSupervisorShifts] = useState([]);
  const [shiftPages, setShiftPages] = useState([]); // Each shift becomes a page
  const [currentShiftPage, setCurrentShiftPage] = useState(1);
  
  // Summary stats
  const [summaryStats, setSummaryStats] = useState({
    totalRecords: 0,
    totalStudents: 0,
    totalShifts: 0,
    todayRecords: 0,
    activeSupervisors: 0
  });

  // Initialize user and load data
  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  // Load attendance records when user, date, or supervisor changes
  useEffect(() => {
    if (user) {
      loadAttendanceRecords();
      loadSupervisors();
      loadActiveShifts();
    }
  }, [user, selectedDate, selectedSupervisor, pagination.currentPage]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      loadAttendanceRecords();
      loadActiveShifts();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user, selectedDate, selectedSupervisor]);

  const loadAttendanceRecords = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      }

      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString()
      });

      if (selectedDate) {
        params.append('date', selectedDate);
      }

      if (selectedSupervisor && selectedSupervisor !== 'All Supervisors') {
        params.append('supervisorId', selectedSupervisor);
      }

      const response = await fetch(`/api/attendance/all-records?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAttendanceRecords(data.records);
          setPagination(data.pagination);
          
          // Calculate summary stats
          const uniqueStudents = new Set(data.records.map(record => record.studentEmail));
          const uniqueShifts = new Set(data.records.map(record => record.shiftId));
          
          setSummaryStats({
            totalRecords: data.pagination.totalRecords,
            totalStudents: uniqueStudents.size,
            totalShifts: uniqueShifts.size,
            todayRecords: data.records.filter(record => 
              new Date(record.scanTime).toDateString() === new Date().toDateString()
            ).length,
            activeSupervisors: activeShifts.length
          });
        }
      }
    } catch (error) {
      console.error('Error loading attendance records:', error);
    } finally {
      setLoading(false);
      if (isRefresh) {
        setIsRefreshing(false);
      }
    }
  };

  const loadSupervisors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/shifts?date=${selectedDate}&status=closed`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Create a Map to ensure unique supervisors by ID
          const supervisorMap = new Map();
          data.shifts.forEach(shift => {
            if (shift.supervisorId && shift.supervisorName) {
              supervisorMap.set(shift.supervisorId, {
                id: shift.supervisorId,
                name: shift.supervisorName
              });
            }
          });
          const uniqueSupervisors = Array.from(supervisorMap.values());
          setSupervisors(uniqueSupervisors);
        }
      }
    } catch (error) {
      console.error('Error loading supervisors:', error);
    }
  };

  const loadSupervisorShifts = async (supervisorId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/shifts?date=${selectedDate}&supervisorId=${supervisorId}&status=closed`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Sort shifts by start time (most recent first)
          const sortedShifts = data.shifts.sort((a, b) => new Date(b.shiftStart) - new Date(a.shiftStart));
          setSupervisorShifts(sortedShifts);
          
          // Create pages for each shift
          const pages = [];
          for (let i = 0; i < sortedShifts.length; i++) {
            const shift = sortedShifts[i];
            const shiftRecords = await loadShiftRecordsForPage(shift.id);
            pages.push({
              shiftId: shift.id,
              shiftData: shift,
              records: shiftRecords,
              pageNumber: i + 1
            });
          }
          
          setShiftPages(pages);
          setCurrentShiftPage(1);
        }
      }
    } catch (error) {
      console.error('Error loading supervisor shifts:', error);
    }
  };

  const loadShiftRecordsForPage = async (shiftId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/attendance/all-records?shiftId=${shiftId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.records;
        }
      }
      return [];
    } catch (error) {
      console.error('Error loading shift records:', error);
      return [];
    }
  };

  const loadActiveShifts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/shifts?date=${selectedDate}&status=open`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setActiveShifts(data.shifts);
          console.log('Active shifts loaded:', data.shifts.length);
        }
      }
    } catch (error) {
      console.error('Error loading active shifts:', error);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'All Dates';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatGrade = (grade) => {
    if (!grade) return 'N/A';
    const gradeMap = {
      'first-year': 'First Year',
      'second-year': 'Second Year',
      'third-year': 'Third Year',
      'fourth-year': 'Fourth Year'
    };
    return gradeMap[grade] || grade;
  };

  // Pagination functions
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleRefresh = () => {
    loadAttendanceRecords(true);
    loadSupervisors();
    loadActiveShifts();
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const handleSupervisorChange = (newSupervisor) => {
    setSelectedSupervisor(newSupervisor);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const handleSupervisorClick = async (supervisorId, supervisorName) => {
    setSelectedSupervisor(supervisorId);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
    
    // Load shifts for this supervisor and create pages
    await loadSupervisorShifts(supervisorId);
  };

  const handleClearSupervisorFilter = () => {
    setSelectedSupervisor('All Supervisors');
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
    
    // Reset shift-based states
    setSupervisorShifts([]);
    setShiftPages([]);
    setCurrentShiftPage(1);
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
      padding: '20px', 
      maxWidth: '1600px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ 
          color: '#333', 
          margin: '0',
          fontSize: '28px'
        }}>
          {t('attendanceRecordsManagement')}
        </h1>
        
        {/* Language Switcher and Auto-refresh indicator */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px'
        }}>
          <LanguageSwitcher variant="admin" />
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            color: '#666',
            fontSize: '14px'
          }}>
            {isRefreshing && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px',
                color: '#10b981'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #10b981',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span>Refreshing...</span>
              </div>
            )}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '5px',
              color: '#10b981'
            }}>
              🔄 Auto-refresh every 30s
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '60px', opacity: '0.1' }}>📊</div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '700' }}>{summaryStats.totalRecords}</h3>
            <p style={{ margin: '0', fontSize: '16px', opacity: '0.9' }}>{t('totalRecords')}</p>
          </div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '60px', opacity: '0.1' }}>👥</div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '700' }}>{summaryStats.totalStudents}</h3>
            <p style={{ margin: '0', fontSize: '16px', opacity: '0.9' }}>{t('uniqueStudents')}</p>
          </div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '60px', opacity: '0.1' }}>👨‍💼</div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '700' }}>{summaryStats.totalShifts}</h3>
            <p style={{ margin: '0', fontSize: '16px', opacity: '0.9' }}>{t('completedShifts')}</p>
          </div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 8px 32px rgba(67, 233, 123, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '60px', opacity: '0.1' }}>📅</div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '700' }}>{summaryStats.todayRecords}</h3>
            <p style={{ margin: '0', fontSize: '16px', opacity: '0.9' }}>{t('todayRecords')}</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '30px',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ 
          margin: '0 0 20px 0', 
          color: '#1f2937', 
          fontSize: '20px',
          fontWeight: '600'
        }}>
          Filters & Controls
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: '#374151'
            }}>
              {t('selectDate')}
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: '#374151'
            }}>
              {t('filterBySupervisor')}
            </label>
            <select
              value={selectedSupervisor}
              onChange={(e) => handleSupervisorChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white'
              }}
            >
              <option value="All Supervisors">{t('allSupervisors')}</option>
              {supervisors.map(supervisor => (
                <option key={supervisor.id} value={supervisor.id}>{supervisor.name}</option>
              ))}
            </select>
          </div>
          <div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: isRefreshing ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              🔄 {t('refreshData')}
            </button>
          </div>
          {selectedSupervisor !== 'All Supervisors' && (
            <div>
              <button
                onClick={handleClearSupervisorFilter}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                ✕ Clear Supervisor Filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live Supervisor Monitoring */}
      {activeShifts.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '30px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              animation: 'pulse 2s infinite'
            }}></div>
            <h2 style={{ 
              margin: '0', 
              color: '#1f2937', 
              fontSize: '24px',
              fontWeight: '700'
            }}>
              {t('liveSupervisorMonitoring')}
            </h2>
            <span style={{
              background: '#d1fae5',
              color: '#065f46',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {activeShifts.length} {t('active')}
            </span>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '20px' 
          }}>
            {activeShifts.map((shift, index) => (
              <div
                key={shift.id || `active-shift-${index}`}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '16px',
                  padding: '20px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(16, 185, 129, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.3)';
                }}
                onClick={() => router.push(`/admin/attendance/supervisor/${shift.supervisorId}?shiftId=${shift.id}`)}
              >
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '60px', opacity: '0.1' }}>👨‍💼</div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '16px' 
                  }}>
                    <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600' }}>
                      {shift.supervisorName}
                    </h3>
                    <span style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {t('live')}
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ marginBottom: '8px', fontSize: '14px', opacity: '0.9' }}>
                      <strong>{t('started')}:</strong> {formatTime(shift.shiftStart)}
                    </div>
                    <div style={{ marginBottom: '8px', fontSize: '14px', opacity: '0.9' }}>
                      <strong>{t('duration')}:</strong> {Math.floor((new Date() - new Date(shift.shiftStart)) / (1000 * 60))} minutes
                    </div>
                    <div style={{ marginBottom: '8px', fontSize: '14px', opacity: '0.9' }}>
                      <strong>{t('scans')}:</strong> {shift.totalScans || 0}
                    </div>
                  </div>
                  
                  <div style={{ 
                    borderTop: '1px solid rgba(255, 255, 255, 0.2)', 
                    paddingTop: '12px' 
                  }}>
                    <div style={{ fontSize: '14px', opacity: '0.9', marginBottom: '8px' }}>
                      {t('recentActivity')}:
                    </div>
                    {shift.attendanceRecords && shift.attendanceRecords.length > 0 ? (
                      <div style={{ maxHeight: '80px', overflowY: 'auto' }}>
                        {shift.attendanceRecords.slice(-3).map((record, recordIndex) => (
                          <div key={`${shift.id}-record-${recordIndex}`} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '4px 0',
                            fontSize: '12px',
                            opacity: '0.8'
                          }}>
                            <span>{record.studentName}</span>
                            <span>{formatTime(record.scanTime)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', opacity: '0.7', fontStyle: 'italic' }}>
                        {t('noScansYet')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance Records Table */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '2px solid #f1f5f9'
        }}>
          <div>
            <h2 style={{ 
              margin: '0 0 8px 0', 
              color: '#1f2937', 
              fontSize: '24px',
              fontWeight: '700'
            }}>
              📋 {t('attendanceRecords')}
              {selectedSupervisor !== 'All Supervisors' && shiftPages.length > 0 && (
                <span style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#667eea',
                  marginLeft: '12px'
                }}>
                  - Page {currentShiftPage} of {shiftPages.length}
                </span>
              )}
            </h2>
            <p style={{ 
              margin: '0', 
              color: '#6b7280', 
              fontSize: '14px' 
            }}>
              {selectedSupervisor !== 'All Supervisors' && shiftPages.length > 0 ? (
                <>
                  {(() => {
                    const currentPage = shiftPages.find(page => page.pageNumber === currentShiftPage);
                    return currentPage ? (
                      <>
                        {new Date(currentPage.shiftData.shiftStart).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })} • 
                        {formatTime(currentPage.shiftData.shiftStart)} - 
                        {currentPage.shiftData.shiftEnd ? formatTime(currentPage.shiftData.shiftEnd) : 'Active'} • 
                        {currentPage.records.length} records
                      </>
                    ) : null;
                  })()}
                </>
              ) : (
                <>
                  {formatDate(selectedDate)} • {pagination.totalRecords} {t('totalRecords')}
                </>
              )}
            </p>
          </div>
          <div style={{
            background: '#f8fafc',
            padding: '8px 16px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <span style={{ 
              color: '#475569', 
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {t('page')} {pagination.currentPage} {t('of')} {pagination.totalPages}
            </span>
          </div>
        </div>

        {/* Table */}
        <div style={{ 
          overflowX: 'auto',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
            background: 'white'
          }}>
            <thead>
              <tr style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}>
                <th style={{ 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontWeight: '600',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>#</th>
                <th style={{ 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontWeight: '600',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>{t('studentName')}</th>
                <th style={{ 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontWeight: '600',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>{t('studentId')}</th>
                <th style={{ 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontWeight: '600',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>{t('college')}</th>
                <th style={{ 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontWeight: '600',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>{t('major')}</th>
                <th style={{ 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontWeight: '600',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>{t('grade')}</th>
                <th style={{ 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontWeight: '600',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>{t('scanTime')}</th>
                <th style={{ 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontWeight: '600',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  position: 'relative'
                }}>
                  {t('supervisor')}
                  {selectedSupervisor !== 'All Supervisors' && (
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: '#3b82f6',
                      color: 'white',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: '600'
                    }}>
                      !
                    </span>
                  )}
                </th>
                <th style={{ 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontWeight: '600',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>{t('shiftInfo')}</th>
                <th style={{ 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontWeight: '600',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>{t('status')}</th>
                <th style={{ 
                  padding: '16px 12px', 
                  textAlign: 'center', 
                  fontWeight: '600',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                // Show shift-based records if supervisor is selected, otherwise show all records
                let recordsToShow = attendanceRecords;
                
                if (selectedSupervisor !== 'All Supervisors' && shiftPages.length > 0) {
                  // Get records from current shift page
                  const currentPage = shiftPages.find(page => page.pageNumber === currentShiftPage);
                  recordsToShow = currentPage ? currentPage.records : [];
                }
                
                return recordsToShow.length > 0 ? (
                  recordsToShow.map((record, index) => (
                  <tr key={record._id} style={{ 
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background-color 0.2s ease'
                  }}>
                    <td style={{ padding: '16px 12px', color: '#6b7280', fontWeight: '500' }}>
                      {(pagination.currentPage - 1) * pagination.limit + index + 1}
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '16px'
                        }}>
                          {record.studentName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>
                            {record.studentName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {record.studentEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px', color: '#374151' }}>
                      {record.studentId}
                    </td>
                    <td style={{ padding: '16px 12px', color: '#374151' }}>
                      {record.college}
                    </td>
                    <td style={{ padding: '16px 12px', color: '#374151' }}>
                      {record.major}
                    </td>
                    <td style={{ padding: '16px 12px', color: '#374151' }}>
                      {formatGrade(record.grade)}
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <div>
                        <div style={{ fontWeight: '500', color: '#1f2937' }}>
                          {formatTime(record.scanTime)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {new Date(record.scanTime).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <button
                        onClick={() => handleSupervisorClick(record.supervisorId, record.supervisorName)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          transition: 'all 0.2s ease',
                          width: '100%',
                          textAlign: 'left'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        title={`Click to filter by ${record.supervisorName}`}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: selectedSupervisor === record.supervisorId 
                            ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '600',
                          transition: 'all 0.2s ease'
                        }}>
                          {record.supervisorName?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <span style={{ 
                          color: selectedSupervisor === record.supervisorId ? '#3b82f6' : '#374151', 
                          fontWeight: selectedSupervisor === record.supervisorId ? '600' : '500',
                          transition: 'all 0.2s ease'
                        }}>
                          {record.supervisorName}
                        </span>
                        {selectedSupervisor === record.supervisorId && (
                          <span style={{
                            fontSize: '12px',
                            color: '#3b82f6',
                            fontWeight: '600'
                          }}>
                            (Active Filter)
                          </span>
                        )}
                      </button>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>
                          {t('shiftStart')}: {formatTime(record.shiftStart)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {t('duration')}: {record.shiftDuration} min
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: '#d1fae5',
                        color: '#065f46'
                      }}>
                        {t('present')}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                      <button
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to delete the attendance record for ${record.studentName}?`)) {
                            try {
                              const token = localStorage.getItem('token');
                              const response = await fetch(`/api/attendance/delete/${record._id}`, {
                                method: 'DELETE',
                                headers: {
                                  'Authorization': `Bearer ${token}`,
                                  'Content-Type': 'application/json'
                                }
                              });

                              const result = await response.json();

                              if (result.success) {
                                alert(`Attendance record for ${record.studentName} deleted successfully!`);
                                // Refresh the data
                                loadAttendanceRecords(true);
                              } else {
                                alert(`Failed to delete attendance record: ${result.message}`);
                              }
                            } catch (error) {
                              console.error('Delete error:', error);
                              alert('An error occurred while deleting the attendance record');
                            }
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '8px',
                          borderRadius: '8px',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#fef2f2';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.transform = 'scale(1)';
                        }}
                        title={`Delete attendance record for ${record.studentName}`}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
                ) : (
                  <tr>
                    <td colSpan="11" style={{ 
                      padding: '40px 20px', 
                      textAlign: 'center', 
                      color: '#6b7280',
                      fontSize: '16px'
                    }}>
                      {selectedSupervisor !== 'All Supervisors' 
                        ? 'No records found for this shift.' 
                        : t('noAttendanceRecords')
                      }
                    </td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {selectedSupervisor !== 'All Supervisors' && shiftPages.length > 1 ? (
          // Shift-based pagination
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '10px',
            marginTop: '20px',
            padding: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <button
              onClick={() => setCurrentShiftPage(prev => Math.max(1, prev - 1))}
              disabled={currentShiftPage === 1}
              style={{
                padding: '12px 20px',
                background: currentShiftPage === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: currentShiftPage === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: currentShiftPage === 1 ? 0.5 : 1
              }}
            >
              ← Previous Shift
            </button>
            
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              alignItems: 'center' 
            }}>
              {shiftPages.map((page, index) => (
                <button
                  key={page.shiftId}
                  onClick={() => setCurrentShiftPage(page.pageNumber)}
                  style={{
                    padding: '8px 12px',
                    background: currentShiftPage === page.pageNumber ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    minWidth: '40px'
                  }}
                >
                  {page.pageNumber}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentShiftPage(prev => Math.min(shiftPages.length, prev + 1))}
              disabled={currentShiftPage === shiftPages.length}
              style={{
                padding: '12px 20px',
                background: currentShiftPage === shiftPages.length ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: currentShiftPage === shiftPages.length ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: currentShiftPage === shiftPages.length ? 0.5 : 1
              }}
            >
              Next Shift →
            </button>
          </div>
        ) : pagination.totalPages > 1 && selectedSupervisor === 'All Supervisors' && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '10px',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                background: pagination.hasPrevPage ? 'white' : '#f9fafb',
                color: pagination.hasPrevPage ? '#374151' : '#9ca3af',
                cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              ← {t('previous')}
            </button>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    background: pageNum === pagination.currentPage ? '#3b82f6' : 'white',
                    color: pageNum === pagination.currentPage ? 'white' : '#374151',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                background: pagination.hasNextPage ? 'white' : '#f9fafb',
                color: pagination.hasNextPage ? '#374151' : '#9ca3af',
                cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {t('next')} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminAttendancePage() {
  return <AdminAttendancePageContent />;
}