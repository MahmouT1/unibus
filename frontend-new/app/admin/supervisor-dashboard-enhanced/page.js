'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WorkingQRScannerFixed from '../../../components/WorkingQRScannerFixed';
import '../../../components/admin/EnhancedSupervisorDashboard.css';

const EnhancedSupervisorDashboardContent = ({ user, onLogout }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('qr-scanner');
  const [scannedStudents, setScannedStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    fetchSystemStatus();
    fetchTodayAttendance();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchSystemStatus();
      fetchTodayAttendance();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/attendance/system-status');
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data.status);
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/attendance/today');
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data.attendance || []);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = (attendanceData) => {
    console.log('Scan successful:', attendanceData);
    
    // Add to scanned students list
    setScannedStudents(prev => [attendanceData, ...prev.slice(0, 9)]); // Keep last 10
    
    // Refresh attendance records
    fetchTodayAttendance();
    
    // Show success message
    setError('');
  };

  const handleScanError = (error) => {
    console.error('Scan error:', error);
    setError(error.message || 'Scan failed');
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
      router.push('/admin-login');
    }
  };

  const getSupervisorStats = () => {
    if (!attendanceRecords.length) return { total: 0, firstSlot: 0, secondSlot: 0 };
    
    const supervisorRecords = attendanceRecords.filter(
      record => record.supervisorId === user?.id || record.supervisorName === user?.email
    );
    
    return {
      total: supervisorRecords.length,
      firstSlot: supervisorRecords.filter(r => r.appointmentSlot === 'first').length,
      secondSlot: supervisorRecords.filter(r => r.appointmentSlot === 'second').length
    };
  };

  const stats = getSupervisorStats();

  return (
    <div className="supervisor-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Supervisor Dashboard - Enhanced</h1>
          <p>Concurrent QR Scanning System</p>
        </div>
        <div className="header-actions">
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* System Status Banner */}
      {systemStatus && (
        <div className={`status-banner ${systemStatus.isHealthy ? 'healthy' : 'busy'}`}>
          <div className="status-content">
            <span className="status-indicator">
              {systemStatus.isHealthy ? '🟢' : '🔴'}
            </span>
            <span className="status-text">
              System: {systemStatus.isHealthy ? 'Healthy' : 'Busy'} | 
              Today: {systemStatus.totalTodayAttendance} scans | 
              Active Supervisors: {systemStatus.activeSupervisors}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'qr-scanner' ? 'active' : ''}`}
          onClick={() => setActiveTab('qr-scanner')}
        >
          📱 QR Scanner
        </button>
        <button 
          className={`nav-tab ${activeTab === 'my-stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-stats')}
        >
          📊 My Statistics
        </button>
        <button 
          className={`nav-tab ${activeTab === 'recent-scans' ? 'active' : ''}`}
          onClick={() => setActiveTab('recent-scans')}
        >
          📋 Recent Scans
        </button>
        <button 
          className={`nav-tab ${activeTab === 'system-monitor' ? 'active' : ''}`}
          onClick={() => setActiveTab('system-monitor')}
        >
          🔧 System Monitor
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'qr-scanner' && (
          <div className="scanner-section">
            <h2>QR Code Scanner</h2>
            <p>Scan student QR codes. The system handles multiple supervisors automatically.</p>
            
            <WorkingQRScannerFixed
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
              supervisorId={user?.id || 'supervisor-001'}
              supervisorName={user?.email || 'Supervisor'}
            />
          </div>
        )}

        {activeTab === 'my-stats' && (
          <div className="stats-section">
            <h2>My Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{stats.total}</div>
                <div className="stat-label">Total Scans Today</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.firstSlot}</div>
                <div className="stat-label">First Slot</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.secondSlot}</div>
                <div className="stat-label">Second Slot</div>
              </div>
            </div>
            
            <div className="recent-activity">
              <h3>Recent Activity</h3>
              {attendanceRecords
                .filter(record => record.supervisorId === user?.id || record.supervisorName === user?.email)
                .slice(0, 10)
                .map((record, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-time">
                      {new Date(record.checkInTime).toLocaleTimeString()}
                    </div>
                    <div className="activity-student">
                      {record.studentName}
                    </div>
                    <div className="activity-slot">
                      {record.appointmentSlot}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'recent-scans' && (
          <div className="recent-scans-section">
            <h2>Recent Scans</h2>
            <div className="scans-list">
              {scannedStudents.map((student, index) => (
                <div key={index} className="scan-item">
                  <div className="scan-info">
                    <div className="scan-student">{student.studentName}</div>
                    <div className="scan-time">
                      {new Date(student.checkInTime).toLocaleString()}
                    </div>
                  </div>
                  <div className="scan-status">
                    <span className="status-badge success">✓ Scanned</span>
                  </div>
                </div>
              ))}
              {scannedStudents.length === 0 && (
                <div className="no-scans">No recent scans</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'system-monitor' && (
          <div className="system-monitor-section">
            <h2>System Monitor</h2>
            {systemStatus ? (
              <div className="monitor-grid">
                <div className="monitor-card">
                  <h3>System Health</h3>
                  <div className={`health-status ${systemStatus.isHealthy ? 'healthy' : 'busy'}`}>
                    {systemStatus.isHealthy ? '🟢 Healthy' : '🔴 Busy'}
                  </div>
                </div>
                
                <div className="monitor-card">
                  <h3>Today's Statistics</h3>
                  <div className="stat-item">
                    <span>Total Scans:</span>
                    <span>{systemStatus.totalTodayAttendance}</span>
                  </div>
                  <div className="stat-item">
                    <span>First Slot:</span>
                    <span>{systemStatus.firstSlotAttendance}</span>
                  </div>
                  <div className="stat-item">
                    <span>Second Slot:</span>
                    <span>{systemStatus.secondSlotAttendance}</span>
                  </div>
                </div>
                
                <div className="monitor-card">
                  <h3>Active Supervisors</h3>
                  <div className="supervisor-count">
                    {systemStatus.activeSupervisors}
                  </div>
                </div>
                
                <div className="monitor-card">
                  <h3>Recent Activity</h3>
                  <div className="recent-scans-count">
                    {systemStatus.recentScans} scans in last 10 minutes
                  </div>
                </div>
              </div>
            ) : (
              <div className="loading">Loading system status...</div>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default function EnhancedSupervisorDashboard() {
  return (
    <EnhancedSupervisorDashboardContent />
  );
}
