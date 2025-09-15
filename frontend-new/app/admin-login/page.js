'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin' // Default to admin
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userRole = localStorage.getItem('userRole');
    
    if (token && (userRole === 'admin' || userRole === 'supervisor')) {
      // Redirect to appropriate dashboard
      if (userRole === 'admin') {
        router.push('/admin/dashboard');
      } else if (userRole === 'supervisor') {
        router.push('/admin/supervisor-dashboard');
      }
    }
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Login successful! Redirecting...');
        
        // Store authentication data
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect based on role
        setTimeout(() => {
          if (data.user.role === 'admin') {
            router.push('/admin/dashboard');
          } else if (data.user.role === 'supervisor') {
            router.push('/admin/supervisor-dashboard');
          }
        }, 1000);
        
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
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
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '450px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#667eea',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)'
          }}>
            <span style={{ fontSize: '32px', color: 'white' }}>🔐</span>
          </div>
          <h1 style={{
            margin: '0 0 10px 0',
            fontSize: '28px',
            fontWeight: '700',
            color: '#2d3748',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Admin Portal
          </h1>
          <p style={{
            margin: '0',
            color: '#718096',
            fontSize: '16px'
          }}>
            Secure access for administrators and supervisors
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
          {/* Role Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#4a5568'
            }}>
              Access Level
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <label style={{
                flex: 1,
                padding: '12px 16px',
                border: `2px solid ${formData.role === 'admin' ? '#667eea' : '#e2e8f0'}`,
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'center',
                backgroundColor: formData.role === 'admin' ? '#f7fafc' : 'white',
                transition: 'all 0.3s ease'
              }}>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={formData.role === 'admin'}
                  onChange={handleInputChange}
                  style={{ display: 'none' }}
                />
                <div style={{ fontSize: '14px', fontWeight: '600', color: formData.role === 'admin' ? '#667eea' : '#718096' }}>
                  👑 Administrator
                </div>
              </label>
              <label style={{
                flex: 1,
                padding: '12px 16px',
                border: `2px solid ${formData.role === 'supervisor' ? '#667eea' : '#e2e8f0'}`,
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'center',
                backgroundColor: formData.role === 'supervisor' ? '#f7fafc' : 'white',
                transition: 'all 0.3s ease'
              }}>
                <input
                  type="radio"
                  name="role"
                  value="supervisor"
                  checked={formData.role === 'supervisor'}
                  onChange={handleInputChange}
                  style={{ display: 'none' }}
                />
                <div style={{ fontSize: '14px', fontWeight: '600', color: formData.role === 'supervisor' ? '#667eea' : '#718096' }}>
                  👨‍💼 Supervisor
                </div>
              </label>
            </div>
          </div>

          {/* Email Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#4a5568'
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="admin@university.edu"
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#4a5568'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Enter your password"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#fed7d7',
              border: '1px solid #feb2b2',
              color: '#c53030',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div style={{
              backgroundColor: '#c6f6d5',
              border: '1px solid #9ae6b4',
              color: '#2f855a',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>✅</span>
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: loading ? '#a0aec0' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#5a67d8';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#667eea';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
              }
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Authenticating...
              </div>
            ) : (
              `🔐 Login as ${formData.role === 'admin' ? 'Administrator' : 'Supervisor'}`
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0',
          position: 'relative',
          zIndex: 1
        }}>
          <p style={{
            margin: '0',
            color: '#718096',
            fontSize: '14px'
          }}>
            For student access, please use the{' '}
            <a href="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
              Student Portal
            </a>
          </p>
        </div>

        {/* CSS Animation */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
