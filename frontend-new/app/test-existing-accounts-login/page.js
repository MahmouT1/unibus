'use client';

import React, { useState } from 'react';

export default function TestExistingAccountsLogin() {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testAccount = async (email, password, role) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role
        })
      });

      const data = await response.json();
      
      return {
        success: response.ok,
        status: response.status,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        status: 'ERROR',
        data: { error: error.message }
      };
    } finally {
      setLoading(false);
    }
  };

  const runTests = async () => {
    setLoading(true);
    const results = {};

    // Test admin account
    console.log('Testing admin account...');
    results.admin = await testAccount('roo2admin@gmail.com', 'admin123', 'admin');

    // Test supervisor account
    console.log('Testing supervisor account...');
    results.supervisor = await testAccount('ahmedazab@gmail.com', 'supervisor123', 'supervisor');

    setTestResults(results);
    setLoading(false);
  };

  const getStatusColor = (success) => {
    return success ? '#10b981' : '#ef4444';
  };

  const getStatusText = (success) => {
    return success ? '✅ Success' : '❌ Failed';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
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
          🔐 Test Existing Accounts Login
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
            {loading ? '⏳ Testing...' : '🚀 Test Existing Accounts'}
          </button>
        </div>

        {Object.keys(testResults).length > 0 && (
          <div style={{
            display: 'grid',
            gap: '20px'
          }}>
            {Object.entries(testResults).map(([accountType, result]) => (
              <div key={accountType} style={{
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
                    {accountType} Account
                  </h3>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: getStatusColor(result.success),
                    color: 'white'
                  }}>
                    {getStatusText(result.success)}
                  </span>
                </div>

                <div style={{
                  backgroundColor: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
                    <strong>Status:</strong> {result.status}
                  </p>
                  
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
            📋 Your Existing Accounts
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{
                margin: '0 0 10px 0',
                fontSize: '14px',
                fontWeight: '600',
                color: '#667eea'
              }}>
                👑 Admin Account
              </h4>
              <p style={{ margin: '2px 0', fontSize: '12px' }}>
                <strong>Email:</strong> roo2admin@gmail.com
              </p>
              <p style={{ margin: '2px 0', fontSize: '12px' }}>
                <strong>Password:</strong> admin123
              </p>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{
                margin: '0 0 10px 0',
                fontSize: '14px',
                fontWeight: '600',
                color: '#48bb78'
              }}>
                👨‍💼 Supervisor Account
              </h4>
              <p style={{ margin: '2px 0', fontSize: '12px' }}>
                <strong>Email:</strong> ahmedazab@gmail.com
              </p>
              <p style={{ margin: '2px 0', fontSize: '12px' }}>
                <strong>Password:</strong> supervisor123
              </p>
            </div>
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '30px'
        }}>
          <a href="/admin-login" style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#667eea',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            🔐 Go to Admin Login Page
          </a>
        </div>
      </div>
    </div>
  );
}
