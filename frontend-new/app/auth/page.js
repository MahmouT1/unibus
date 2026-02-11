'use client';

import { useState, useEffect } from 'react';
import { apiCall, getApiUrl } from '../../config/api';

export default function UnifiedAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Clear cache on component mount if requested
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('clear') === '1') {
      localStorage.clear();
      sessionStorage.clear();
      setMessage('✅ Cache cleared! You can now login with your updated role.');
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Clear any existing cached data to prevent conflicts
    localStorage.removeItem('token');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    sessionStorage.clear();

    // Validation for registration
    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setMessage('Passwords do not match');
        setLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        setMessage('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
    }

    try {
      let requestData;
      
      if (isLogin) {
        requestData = {
          email: formData.email,
          password: formData.password,
          role: 'student' // optional - backend returns actual role from DB
        };
        
        const result = await apiCall('/api/proxy/auth/login', {
          method: 'POST',
          body: JSON.stringify(requestData),
        });
        
        const data = result.data;
        
        if (data.success) {
          const loginData = data;
          setMessage('Login successful! Redirecting...');
          
          // Save user data
          localStorage.setItem('token', loginData.token);
          localStorage.setItem('userToken', loginData.token);
          localStorage.setItem('userRole', loginData.user.role);
          localStorage.setItem('user', JSON.stringify(loginData.user));
          
          // Redirect based on role
          setTimeout(() => {
            switch (loginData.user.role) {
              case 'admin':
                window.location.href = '/admin/dashboard';
                break;
              case 'supervisor':
                window.location.href = '/admin/supervisor-dashboard';
                break;
              case 'student':
                window.location.href = '/student/portal';
                break;
              default:
                window.location.href = '/';
            }
          }, 1500);
          
          setLoading(false);
          return;
        } else {
          setMessage(data.message || 'Account not found. Please check your email or register first.');
          setLoading(false);
          return;
        }
      } else {
        // For registration, default to student role
        requestData = {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          role: 'student'
        };
      }

      // For registration only
      if (!isLogin) {
        const result = await apiCall('/api/proxy/auth/register', {
          method: 'POST',
          body: JSON.stringify(requestData),
        });

        const data = result.data;

        if (data.success) {
          setMessage('Registration successful! Redirecting...');
          
          // Save user data
          localStorage.setItem('token', data.token);
          localStorage.setItem('userToken', data.token);
          localStorage.setItem('userRole', data.user.role);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Redirect to student portal for new registrations
          setTimeout(() => {
            window.location.href = '/student/portal';
          }, 1500);
          
        } else {
          setMessage(data.message || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setMessage('Network error. Please try again.');
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
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px 40px 30px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            padding: '10px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
          }}>
            <img 
              src="/uni-bus-logo.png.jpg" 
              alt="UniBus Logo" 
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'contain',
                borderRadius: '50%'
              }}
            />
          </div>
          <h1 style={{
            margin: '0 0 10px 0',
            fontSize: '32px',
            fontWeight: '700'
          }}>
            UniBus Portal
          </h1>
          <p style={{
            margin: '0',
            fontSize: '16px',
            opacity: 0.9
          }}>
            Student Transportation System
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          backgroundColor: '#f8f9fa'
        }}>
          <button
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: '15px',
              border: 'none',
              backgroundColor: isLogin ? 'white' : 'transparent',
              color: isLogin ? '#667eea' : '#6b7280',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              borderBottom: isLogin ? '3px solid #667eea' : '3px solid transparent',
              transition: 'all 0.3s'
            }}
          >
            🔐 Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: '15px',
              border: 'none',
              backgroundColor: !isLogin ? 'white' : 'transparent',
              color: !isLogin ? '#667eea' : '#6b7280',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              borderBottom: !isLogin ? '3px solid #667eea' : '3px solid transparent',
              transition: 'all 0.3s'
            }}
          >
            📝 Register
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '40px' }}>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required={!isLogin}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151'
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
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'border-color 0.3s',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your email"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151'
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
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'border-color 0.3s',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your password"
              />
            </div>

            {!isLogin && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLogin}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: loading ? '#9ca3af' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}
            >
              {loading ? (
                `🔄 ${isLogin ? 'Logging in' : 'Registering'}...`
              ) : (
                `🚀 ${isLogin ? 'Login' : 'Register'}`
              )}
            </button>
          </form>

          {message && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: message.includes('successful') ? '#d1fae5' : '#fee2e2',
              color: message.includes('successful') ? '#065f46' : '#dc2626',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '500',
              textAlign: 'center',
              border: message.includes('successful') ? '1px solid #bbf7d0' : '1px solid #fecaca'
            }}>
              {message}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
