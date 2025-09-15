'use client';

import React, { useState } from 'react';

export default function TestAdminLogin() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAdminLogin = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@university.edu',
          password: 'admin123',
          role: 'admin'
        })
      });

      const data = await response.json();
      setResult({
        status: response.status,
        success: response.ok,
        data: data
      });
    } catch (error) {
      setResult({
        status: 'ERROR',
        success: false,
        data: { error: error.message }
      });
    } finally {
      setLoading(false);
    }
  };

  const testSupervisorLogin = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'supervisor1@university.edu',
          password: 'supervisor123',
          role: 'supervisor'
        })
      });

      const data = await response.json();
      setResult({
        status: response.status,
        success: response.ok,
        data: data
      });
    } catch (error) {
      setResult({
        status: 'ERROR',
        success: false,
        data: { error: error.message }
      });
    } finally {
      setLoading(false);
    }
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
          🔐 Admin Login API Test
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <button
            onClick={testAdminLogin}
            disabled={loading}
            style={{
              padding: '15px 20px',
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
            {loading ? '⏳ Testing...' : '👑 Test Admin Login'}
          </button>

          <button
            onClick={testSupervisorLogin}
            disabled={loading}
            style={{
              padding: '15px 20px',
              backgroundColor: '#48bb78',
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
            {loading ? '⏳ Testing...' : '👨‍💼 Test Supervisor Login'}
          </button>
        </div>

        {result && (
          <div style={{
            backgroundColor: result.success ? '#f0fff4' : '#fff5f5',
            border: `1px solid ${result.success ? '#9ae6b4' : '#feb2b2'}`,
            borderRadius: '10px',
            padding: '20px',
            marginTop: '20px'
          }}>
            <h3 style={{
              margin: '0 0 15px 0',
              color: result.success ? '#22543d' : '#742a2a',
              fontSize: '18px'
            }}>
              {result.success ? '✅ Success' : '❌ Error'}
            </h3>
            
            <div style={{
              backgroundColor: 'white',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontFamily: 'monospace',
              fontSize: '14px',
              overflow: 'auto'
            }}>
              <p><strong>Status:</strong> {result.status}</p>
              <p><strong>Response:</strong></p>
              <pre style={{ margin: '0', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '10px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            color: '#2d3748',
            fontSize: '18px'
          }}>
            📋 Test Credentials
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
                color: '#667eea',
                fontSize: '14px'
              }}>
                👑 Admin Account
              </h4>
              <p style={{ margin: '2px 0', fontSize: '12px' }}>
                <strong>Email:</strong> admin@university.edu
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
                color: '#48bb78',
                fontSize: '14px'
              }}>
                👨‍💼 Supervisor Account
              </h4>
              <p style={{ margin: '2px 0', fontSize: '12px' }}>
                <strong>Email:</strong> supervisor1@university.edu
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
