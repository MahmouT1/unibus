'use client';

import { useState } from 'react';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@unibus.local');
  const [password, setPassword] = useState('123456');
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    console.log('🔄 Attempting login:', { email, role });

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📋 Response data:', data);

      if (data.success) {
        console.log('✅ Login successful, saving data...');
        
        // Save user data
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        localStorage.setItem('adminToken', data.token);
        
        setMessage('✅ تم تسجيل الدخول بنجاح! جاري التوجيه...');
        
        // Redirect based on role
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
      console.error('💥 Login error:', error);
      setMessage('❌ خطأ في الاتصال: ' + error.message);
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
            Admin & Supervisor Login
          </p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
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
                padding: '14px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
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
                padding: '14px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
              required
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>
              Account Type
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '16px',
                outline: 'none',
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
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '18px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxSizing: 'border-box'
            }}
          >
            {loading ? '🔄 Logging in...' : '🚀 Sign In'}
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: '20px',
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
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          fontSize: '13px',
          color: '#6b7280'
        }}>
          <p style={{ margin: '0 0 12px 0', fontWeight: '600', color: '#374151' }}>Test Accounts:</p>
          <div style={{ display: 'grid', gap: '8px' }}>
            <p style={{ margin: '0', padding: '8px', backgroundColor: '#e0f2fe', borderRadius: '6px' }}>
              <strong>Admin:</strong> admin@unibus.local / 123456
            </p>
            <p style={{ margin: '0', padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '6px' }}>
              <strong>Supervisor:</strong> supervisor@unibus.local / 123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}