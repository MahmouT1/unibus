'use client';

import React, { useState, useEffect } from 'react';
import ConcurrentQRScanner from '../../components/ConcurrentQRScanner';

export default function TestConcurrentScanning() {
  const [testResults, setTestResults] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 5000);
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

  const runLoadTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const mockStudents = [
      {
        id: 'test001',
        studentId: 'TEST001',
        fullName: 'Test Student 1',
        email: 'test1@university.edu',
        phoneNumber: '+201234567890',
        college: 'Engineering',
        grade: 'Senior',
        major: 'Computer Science',
        address: 'Cairo, Egypt'
      },
      {
        id: 'test002',
        studentId: 'TEST002',
        fullName: 'Test Student 2',
        email: 'test2@university.edu',
        phoneNumber: '+201234567891',
        college: 'Medicine',
        grade: 'Junior',
        major: 'General Medicine',
        address: 'Alexandria, Egypt'
      }
    ];

    const mockSupervisors = [
      { id: 'supervisor001', name: 'Test Supervisor 1' },
      { id: 'supervisor002', name: 'Test Supervisor 2' }
    ];

    const results = [];
    
    // Simulate concurrent scans
    for (let i = 0; i < 5; i++) {
      const student = mockStudents[i % mockStudents.length];
      const supervisor = mockSupervisors[i % mockSupervisors.length];
      const slot = i % 2 === 0 ? 'first' : 'second';
      
      try {
        const startTime = Date.now();
        const response = await fetch('/api/attendance/register-concurrent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId: student.id,
            supervisorId: supervisor.id,
            supervisorName: supervisor.name,
            qrData: student,
            appointmentSlot: slot,
            stationInfo: {
              name: 'Test Station',
              location: 'Test Location',
              coordinates: '30.0444,31.2357'
            }
          })
        });
        
        const endTime = Date.now();
        const result = await response.json();
        
        results.push({
          id: i + 1,
          student: student.fullName,
          supervisor: supervisor.name,
          slot: slot,
          success: response.ok && result.success,
          duration: endTime - startTime,
          message: result.message,
          isDuplicate: result.isDuplicate || false
        });
        
        setTestResults([...results]);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        results.push({
          id: i + 1,
          student: student.fullName,
          supervisor: supervisor.name,
          slot: slot,
          success: false,
          duration: 0,
          message: error.message,
          isDuplicate: false
        });
        
        setTestResults([...results]);
      }
    }
    
    setIsRunning(false);
  };

  const clearTestData = async () => {
    try {
      // Clear test attendance records
      const response = await fetch('/api/attendance/clear-test-data', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setTestResults([]);
        alert('Test data cleared successfully');
      }
    } catch (error) {
      console.error('Error clearing test data:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '28px',
            color: '#1f2937'
          }}>
            Concurrent QR Scanning System Test
          </h1>
          <p style={{
            margin: '0',
            color: '#6b7280',
            fontSize: '16px'
          }}>
            Test the system's ability to handle multiple supervisors scanning simultaneously
          </p>
        </div>

        {/* System Status */}
        {systemStatus && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '20px',
              color: '#1f2937'
            }}>
              System Status
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <div style={{
                backgroundColor: systemStatus.isHealthy ? '#f0f9ff' : '#fef2f2',
                border: `1px solid ${systemStatus.isHealthy ? '#0ea5e9' : '#f87171'}`,
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: systemStatus.isHealthy ? '#0369a1' : '#dc2626'
                }}>
                  {systemStatus.isHealthy ? '🟢 Healthy' : '🔴 Busy'}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  System Status
                </div>
              </div>
              
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#3b82f6'
                }}>
                  {systemStatus.totalTodayAttendance}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Total Scans Today
                </div>
              </div>
              
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#10b981'
                }}>
                  {systemStatus.activeSupervisors}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Active Supervisors
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Controls */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            margin: '0 0 16px 0',
            fontSize: '20px',
            color: '#1f2937'
          }}>
            Load Testing
          </h2>
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <button
              onClick={runLoadTest}
              disabled={isRunning}
              style={{
                padding: '12px 24px',
                backgroundColor: isRunning ? '#6b7280' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isRunning ? 'not-allowed' : 'pointer'
              }}
            >
              {isRunning ? 'Running Test...' : 'Run Load Test'}
            </button>
            
            <button
              onClick={clearTestData}
              style={{
                padding: '12px 24px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Clear Test Data
            </button>
          </div>
          <p style={{
            margin: '0',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            The load test simulates 5 concurrent scans from different supervisors to test system performance.
          </p>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '20px',
              color: '#1f2937'
            }}>
              Test Results
            </h2>
            <div style={{
              display: 'grid',
              gap: '12px'
            }}>
              {testResults.map((result) => (
                <div
                  key={result.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: result.success ? '#f0f9ff' : '#fef2f2',
                    border: `1px solid ${result.success ? '#0ea5e9' : '#f87171'}`,
                    borderRadius: '8px'
                  }}
                >
                  <div>
                    <div style={{
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {result.student} - {result.supervisor}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      Slot: {result.slot} | Duration: {result.duration}ms
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'right'
                  }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: result.success ? '#10b981' : '#ef4444'
                    }}>
                      {result.success ? '✅' : '❌'}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      {result.isDuplicate ? 'Duplicate' : result.success ? 'Success' : 'Failed'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR Scanner Test */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            margin: '0 0 16px 0',
            fontSize: '20px',
            color: '#1f2937'
          }}>
            QR Scanner Test
          </h2>
          <p style={{
            margin: '0 0 20px 0',
            color: '#6b7280',
            fontSize: '16px'
          }}>
            Test the concurrent QR scanner component with real camera scanning.
          </p>
          
          <ConcurrentQRScanner
            onScanSuccess={(data) => {
              console.log('Scan successful:', data);
              alert(`Scan successful: ${data.studentName}`);
            }}
            onScanError={(error) => {
              console.error('Scan error:', error);
              alert(`Scan error: ${error.message}`);
            }}
            supervisorId="test-supervisor"
            supervisorName="Test Supervisor"
            appointmentSlot="first"
            stationInfo={{
              name: 'Test Station',
              location: 'Test Location',
              coordinates: '30.0444,31.2357'
            }}
          />
        </div>
      </div>
    </div>
  );
}
