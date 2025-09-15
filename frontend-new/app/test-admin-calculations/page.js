'use client';

import React, { useState, useEffect } from 'react';

export default function TestAdminCalculations() {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Dashboard Stats API
      console.log('Testing Dashboard Stats API...');
      const dashboardResponse = await fetch('/api/admin/dashboard/stats');
      const dashboardData = await dashboardResponse.json();
      
      results.dashboard = {
        success: dashboardResponse.ok,
        status: dashboardResponse.status,
        data: dashboardData,
        issues: []
      };

      if (!dashboardResponse.ok) {
        results.dashboard.issues.push(`API returned ${dashboardResponse.status}`);
      }

      if (dashboardData.success && dashboardData.stats) {
        const stats = dashboardData.stats;
        if (typeof stats.totalStudents !== 'number') {
          results.dashboard.issues.push('totalStudents is not a number');
        }
        if (typeof stats.activeSubscriptions !== 'number') {
          results.dashboard.issues.push('activeSubscriptions is not a number');
        }
        if (typeof stats.todayAttendanceRate !== 'number') {
          results.dashboard.issues.push('todayAttendanceRate is not a number');
        }
        if (typeof stats.pendingSubscriptions !== 'number') {
          results.dashboard.issues.push('pendingSubscriptions is not a number');
        }
        if (typeof stats.openTickets !== 'number') {
          results.dashboard.issues.push('openTickets is not a number');
        }
        if (typeof stats.monthlyRevenue !== 'number') {
          results.dashboard.issues.push('monthlyRevenue is not a number');
        }
      } else {
        results.dashboard.issues.push('Invalid response structure');
      }

      // Test 2: Subscriptions API
      console.log('Testing Subscriptions API...');
      const subscriptionsResponse = await fetch('/api/subscription/payment?admin=true');
      const subscriptionsData = await subscriptionsResponse.json();
      
      results.subscriptions = {
        success: subscriptionsResponse.ok,
        status: subscriptionsResponse.status,
        data: subscriptionsData,
        issues: []
      };

      if (!subscriptionsResponse.ok) {
        results.subscriptions.issues.push(`API returned ${subscriptionsResponse.status}`);
      }

      if (subscriptionsData.success && subscriptionsData.subscriptions) {
        const subs = subscriptionsData.subscriptions;
        if (!Array.isArray(subs)) {
          results.subscriptions.issues.push('subscriptions is not an array');
        } else {
          // Test subscription status calculations
          subs.forEach((sub, index) => {
            if (sub.renewalDate) {
              const renewalDate = new Date(sub.renewalDate);
              if (isNaN(renewalDate.getTime())) {
                results.subscriptions.issues.push(`Invalid renewalDate at index ${index}`);
              }
            }
            if (sub.totalPaid !== undefined && typeof sub.totalPaid !== 'number') {
              results.subscriptions.issues.push(`Invalid totalPaid at index ${index}`);
            }
          });
        }
      } else {
        results.subscriptions.issues.push('Invalid response structure');
      }

      // Test 3: Students API
      console.log('Testing Students API...');
      const studentsResponse = await fetch('/api/students/profile-simple?admin=true');
      const studentsData = await studentsResponse.json();
      
      results.students = {
        success: studentsResponse.ok,
        status: studentsResponse.status,
        data: studentsData,
        issues: []
      };

      if (!studentsResponse.ok) {
        results.students.issues.push(`API returned ${studentsResponse.status}`);
      }

      if (studentsData.success && studentsData.students) {
        const students = studentsData.students;
        if (typeof students !== 'object') {
          results.students.issues.push('students is not an object');
        }
      } else {
        results.students.issues.push('Invalid response structure');
      }

      // Test 4: Attendance API
      console.log('Testing Attendance API...');
      const attendanceResponse = await fetch('/api/attendance/all-records?page=1&limit=10');
      const attendanceData = await attendanceResponse.json();
      
      results.attendance = {
        success: attendanceResponse.ok,
        status: attendanceResponse.status,
        data: attendanceData,
        issues: []
      };

      if (!attendanceResponse.ok) {
        results.attendance.issues.push(`API returned ${attendanceResponse.status}`);
      }

      if (attendanceData.success && attendanceData.records) {
        const records = attendanceData.records;
        if (!Array.isArray(records)) {
          results.attendance.issues.push('records is not an array');
        } else {
          // Test attendance calculations
          records.forEach((record, index) => {
            if (record.scanTime) {
              const scanTime = new Date(record.scanTime);
              if (isNaN(scanTime.getTime())) {
                results.attendance.issues.push(`Invalid scanTime at index ${index}`);
              }
            }
            if (!record.studentEmail) {
              results.attendance.issues.push(`Missing studentEmail at index ${index}`);
            }
            if (!record.shiftId) {
              results.attendance.issues.push(`Missing shiftId at index ${index}`);
            }
          });
        }
      } else {
        results.attendance.issues.push('Invalid response structure');
      }

    } catch (error) {
      console.error('Test error:', error);
      results.error = {
        message: error.message,
        stack: error.stack
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  const getStatusColor = (success, issues) => {
    if (!success) return '#ef4444';
    if (issues && issues.length > 0) return '#f59e0b';
    return '#10b981';
  };

  const getStatusText = (success, issues) => {
    if (!success) return '❌ Failed';
    if (issues && issues.length > 0) return '⚠️ Issues Found';
    return '✅ Passed';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        marginTop: '50px'
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '30px',
          color: '#2d3748',
          fontSize: '28px'
        }}>
          🧮 Admin Calculations Test
        </h1>

        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <button
            onClick={runTests}
            disabled={loading}
            style={{
              padding: '15px 30px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? '⏳ Running Tests...' : '🚀 Run Admin Tests'}
          </button>
        </div>

        {Object.keys(testResults).length > 0 && (
          <div style={{
            display: 'grid',
            gap: '20px'
          }}>
            {Object.entries(testResults).map(([testName, result]) => (
              <div key={testName} style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                backgroundColor: '#f8f9fa'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '15px'
                }}>
                  <h3 style={{
                    margin: '0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#2d3748',
                    textTransform: 'capitalize'
                  }}>
                    {testName.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: getStatusColor(result.success, result.issues),
                    color: 'white'
                  }}>
                    {getStatusText(result.success, result.issues)}
                  </span>
                </div>

                <div style={{
                  backgroundColor: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
                    <strong>Status:</strong> {result.status || 'N/A'}
                  </p>
                  
                  {result.issues && result.issues.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>
                        Issues Found:
                      </p>
                      <ul style={{ margin: '0', paddingLeft: '20px' }}>
                        {result.issues.map((issue, index) => (
                          <li key={index} style={{ fontSize: '12px', color: '#ef4444' }}>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <details style={{ marginTop: '10px' }}>
                    <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                      View Response Data
                    </summary>
                    <pre style={{
                      margin: '10px 0 0 0',
                      padding: '10px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '4px',
                      fontSize: '12px',
                      overflow: 'auto',
                      maxHeight: '200px'
                    }}>
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#e7f3ff',
          borderRadius: '10px',
          border: '1px solid #b3d9ff'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#2d3748'
          }}>
            📋 Test Coverage
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px'
          }}>
            <div style={{ fontSize: '14px' }}>
              ✅ Dashboard Statistics API
            </div>
            <div style={{ fontSize: '14px' }}>
              ✅ Subscription Calculations
            </div>
            <div style={{ fontSize: '14px' }}>
              ✅ Student Data Processing
            </div>
            <div style={{ fontSize: '14px' }}>
              ✅ Attendance Calculations
            </div>
            <div style={{ fontSize: '14px' }}>
              ✅ Data Type Validation
            </div>
            <div style={{ fontSize: '14px' }}>
              ✅ Error Handling
            </div>
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '30px'
        }}>
          <a href="/admin/dashboard" style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#667eea',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            marginRight: '10px'
          }}>
            🏠 Go to Admin Dashboard
          </a>
          <a href="/admin-access-guide" style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#48bb78',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            📖 Admin Access Guide
          </a>
        </div>
      </div>
    </div>
  );
}
