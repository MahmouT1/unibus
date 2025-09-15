'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './signup.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isClient, setIsClient] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
    setErrors({});

    try {
      const response = await fetch('/api/auth/register-secure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      const result = await response.json();

      if (result.success) {
        // Store user data in localStorage
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        if (result.student) {
          localStorage.setItem('student', JSON.stringify(result.student));
        }

        // Account created successfully, redirect to student portal
        router.push('/student/portal');
      } else {
        setErrors({ general: result.message || 'Registration failed' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/login');
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
    <div className="auth-page">
      {/* Background Pattern */}
      <div className="auth-background">
        <div className="pattern-overlay"></div>
      </div>

      {/* Main Content */}
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-branding">
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
                <span>Real-time Locations</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⏰</span>
                <span>Schedule Management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="auth-form-section">
          <div className="form-container">
            <div className="form-header">
              <h2>Create Account</h2>
              <p>Join our student transportation portal</p>
            </div>

            {errors.general && (
              <div className="error-message">
                {errors.general}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                      disabled={loading}
                      className={errors.fullName ? 'error' : ''}
                      suppressHydrationWarning
                    />
                </div>
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
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
                <label htmlFor="password">Password *</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a password"
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

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      required
                      disabled={loading}
                      className={errors.confirmPassword ? 'error' : ''}
                      suppressHydrationWarning
                    />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🚀</span>
                    Create Account
                  </>
                )}
              </button>

              <div className="auth-switch">
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="switch-link"
                    onClick={handleLogin}
                    disabled={loading}
                  >
                    Sign in here
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
};

export default SignUp;