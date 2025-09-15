'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './login.css';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isClient, setIsClient] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setErrors({});

    try {
      const response = await fetch('/api/auth/login-secure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.student) {
          localStorage.setItem('student', JSON.stringify(data.student));
        }
        
        // Redirect based on user role
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (data.user.role === 'supervisor') {
          router.push('/admin/supervisor-dashboard');
        } else {
          router.push('/student/portal');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  // Prevent hydration mismatch by only rendering form after client mount
  if (!isClient) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#666', fontSize: '16px' }}>Loading...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="login-page">
      {/* Background Pattern */}
      <div className="login-background">
        <div className="pattern-overlay"></div>
      </div>

      {/* Main Content */}
      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="brand-content">
            <div className="brand-logo">
              <img
                src="/uni-bus-logo.png.jpg"
                alt="Uni Bus Logo"
                className="uni-bus-logo"
              />
            </div>
            <h1 className="brand-title">Uni Bus</h1>
            <p className="brand-subtitle">Student Transportation Portal</p>
            <div className="brand-features">
              <div className="feature-item">
                <span className="feature-icon">🚌</span>
                <span>Smart Transportation</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📍</span>
                <span>Real-time Tracking</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⏰</span>
                <span>Schedule Management</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎓</span>
                <span>Student Portal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-section">
          <div className="form-container">
            <div className="form-header">
              <h2>Welcome Back</h2>
              <p>Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    required
                    disabled={loading}
                    className={errors.email ? 'error' : ''}
                    suppressHydrationWarning
                  />
                </div>
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      required
                      disabled={loading}
                      className={errors.password ? 'error' : ''}
                      suppressHydrationWarning
                    />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <div className="form-options">
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    disabled={loading}
                  />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <a href="#" className="forgot-password">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Signing In...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🚀</span>
                    Sign In
                  </>
                )}
              </button>

              <div className="login-divider">
                <span>or</span>
              </div>

              <div className="auth-switch">
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="switch-link"
                    onClick={handleSignUp}
                    disabled={loading}
                  >
                    Create one here
                  </button>
                </p>
              </div>
            </form>

            <div className="form-footer">
              <p>© 2024 Uni Bus. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}