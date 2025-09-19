'use client';

import { useState } from 'react';

export default function UniversalLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    console.log('🔄 Starting login process for:', email);

    try {
      const response = await fetch('/api/auth/universal-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 API Response status:', response.status);
      
      const data = await response.json();
      console.log('📋 API Response data:', data);

      if (data.success) {
        console.log('✅ Login successful for role:', data.user.role);
        
        // Save authentication data
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('isAuthenticated', 'true');
        
        // Role-specific storage
        if (data.user.role === 'admin') {
          localStorage.setItem('adminUser', JSON.stringify(data.user));
          localStorage.setItem('adminToken', data.token);
        } else if (data.user.role === 'supervisor') {
          localStorage.setItem('supervisorUser', JSON.stringify(data.user));
          localStorage.setItem('supervisorToken', data.token);
        }
        
        setMessage(`✅ Welcome ${data.user.fullName}! Redirecting...`);
        
        // Redirect based on role
        setTimeout(() => {
          console.log('🎯 Redirecting to:', data.redirectUrl);
          window.location.href = data.redirectUrl;
        }, 1500);
        
      } else {
        console.log('❌ Login failed:', data.message);
        setMessage('❌ ' + data.message);
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      setMessage('❌ Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '450px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
        padding: '40px',
        margin: '20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#667eea',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '32px'
          }}>
            🚌
          </div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            marginBottom: '8px'
          }}>
            UniBus System
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Student Transportation Portal
          </p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email address"
              required
            />
          </div>

          <div style={{ marginBottom: '35px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '18px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '18px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxSizing: 'border-box'
            }}
          >
            {loading ? '🔄 Signing In...' : '🚀 Sign In'}
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: '25px',
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: message.includes('✅') ? '#dcfce7' : '#fef2f2',
            border: message.includes('✅') ? '2px solid #bbf7d0' : '2px solid #fecaca',
            textAlign: 'center'
          }}>
            <p style={{ 
              fontSize: '14px', 
              margin: 0, 
              color: message.includes('✅') ? '#166534' : '#dc2626',
              fontWeight: '600'
            }}>
              {message}
            </p>
          </div>
        )}

        <div style={{
          marginTop: '35px',
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          fontSize: '13px',
          color: '#6b7280'
        }}>
          <p style={{ margin: '0 0 15px 0', fontWeight: '600', color: '#374151', textAlign: 'center' }}>
            Test Accounts Available:
          </p>
          <div style={{ display: 'grid', gap: '8px' }}>
            <p style={{ margin: '0', padding: '8px', backgroundColor: '#e0f2fe', borderRadius: '6px', textAlign: 'center' }}>
              <strong>👨‍💼 Admin:</strong> admin@unibus.local / 123456
            </p>
            <p style={{ margin: '0', padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '6px', textAlign: 'center' }}>
              <strong>👨‍🏫 Supervisor:</strong> supervisor@unibus.local / 123456
            </p>
            <p style={{ margin: '0', padding: '8px', backgroundColor: '#fef7cd', borderRadius: '6px', textAlign: 'center' }}>
              <strong>🎓 Student:</strong> student@unibus.local / 123456
            </p>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>
            Automatic role-based redirection
          </p>
        </div>
      </div>
    </div>
  );
}