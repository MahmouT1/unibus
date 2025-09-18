'use client';

import { useState } from 'react';

export default function WorkingLogin() {
  const [email, setEmail] = useState('roo2admin@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/working-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success) {
        // Save user data
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        
        setMessage('✅ Login successful! Redirecting...');
        
        // Redirect based on role
        setTimeout(() => {
          if (data.user.role === 'admin') {
            window.location.href = '/admin/dashboard';
          } else if (data.user.role === 'supervisor') {
            window.location.href = '/admin/supervisor-dashboard';
          } else {
            window.location.href = '/student/portal';
          }
        }, 1000);
      } else {
        setMessage('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('❌ Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '450px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        padding: '40px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            🚌 UniBus System
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Admin & Supervisor Login
          </p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="Enter your email"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="Enter your password"
              required
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Account Type
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '16px',
                outline: 'none'
              }}
            >
              <option value="admin">Admin</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '18px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Logging in...' : 'Login to System'}
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: '20px',
            padding: '14px',
            borderRadius: '8px',
            backgroundColor: message.includes('✅') ? '#dcfce7' : '#fef2f2',
            border: message.includes('✅') ? '1px solid #bbf7d0' : '1px solid #fecaca',
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
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#6b7280'
        }}>
          <p style={{ margin: '0 0 12px 0', fontWeight: '600', color: '#374151' }}>Available Test Accounts:</p>
          <div style={{ display: 'grid', gap: '8px' }}>
            <p style={{ margin: '0', padding: '6px', backgroundColor: '#e0f2fe', borderRadius: '4px' }}>
              <strong>Admin:</strong> roo2admin@gmail.com / admin123
            </p>
            <p style={{ margin: '0', padding: '6px', backgroundColor: '#f0fdf4', borderRadius: '4px' }}>
              <strong>Supervisor:</strong> ahmedAzab@gmail.com / supervisor123
            </p>
            <p style={{ margin: '0', padding: '6px', backgroundColor: '#fef7cd', borderRadius: '4px' }}>
              <strong>Test Admin:</strong> admin@unibus.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}