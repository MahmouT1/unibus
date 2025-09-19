'use client';

import { useState } from 'react';

export default function SimpleAdminLogin() {
  const [email, setEmail] = useState('roo2admin@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    console.log('🔄 Starting login process...');
    console.log('📋 Form data:', { email, password, role });

    try {
      console.log('📡 Sending fetch request to /api/auth/admin-login');
      
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      console.log('📡 Response received:', response.status, response.statusText);
      console.log('📡 Response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        console.log('❌ Response not OK:', response.status);
        setMessage(`❌ HTTP Error: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();
      console.log('📋 Response data:', data);

      if (data.success) {
        console.log('✅ Login successful!');
        setMessage('✅ Login successful! Redirecting...');
        
        // Save to localStorage
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('💾 Data saved to localStorage');
        
        // Redirect
        setTimeout(() => {
          if (data.user.role === 'admin') {
            console.log('🎯 Redirecting to admin dashboard');
            window.location.href = '/admin/dashboard';
          } else if (data.user.role === 'supervisor') {
            console.log('👨‍💼 Redirecting to supervisor dashboard');
            window.location.href = '/admin/supervisor-dashboard';
          }
        }, 1000);
        
      } else {
        console.log('❌ Login failed:', data.message);
        setMessage('❌ ' + data.message);
      }
      
    } catch (error) {
      console.error('💥 Catch block error:', error);
      setMessage('💥 Network Error: ' + error.message);
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
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '450px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        margin: '20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🚌 UniBus System
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Simple Admin & Supervisor Login
          </p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
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
              padding: '15px',
              backgroundColor: loading ? '#9ca3af' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s'
            }}
          >
            {loading ? '🔄 Logging in...' : '🚀 Login'}
          </button>
        </form>
        
        {message && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
            color: message.includes('✅') ? '#065f46' : '#dc2626',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {message}
          </div>
        )}
        
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '10px' }}>
            Test Accounts:
          </p>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            <div>Admin: roo2admin@gmail.com / admin123</div>
            <div>Supervisor: ahmedazab@gmail.com / supervisor123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
