// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login({
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        // Get user data from localStorage to determine redirect
        const user = JSON.parse(localStorage.getItem('user'));

        // Redirect based on user role
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.role === 'supervisor') {
          navigate('/admin/supervisor-dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    alert('Forgot password functionality coming soon!');
  };

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
                src={process.env.PUBLIC_URL + "/uni-bus-logo.png.jpg"}
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

        {/* Right Side - Login Form */}
        <div className="auth-form-section">
          <div className="form-container">
            <div className="form-header">
              <h2>Welcome Back!</h2>
              <p>Sign in to access your student portal</p>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
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
                  />
                </div>
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
              </div>

              <div className="form-options">
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <button
                  type="button"
                  className="forgot-link"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Signing In...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🔓</span>
                    Sign In
                  </>
                )}
              </button>

              <div className="divider">
                <span>or continue with</span>
              </div>

              <div className="social-buttons">
                <button type="button" className="social-btn google" disabled={loading}>
                  <span className="social-icon">🔍</span>
                  Google
                </button>
                <button type="button" className="social-btn microsoft" disabled={loading}>
                  <span className="social-icon">🪟</span>
                  Microsoft
                </button>
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
                    Sign up here
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

export default Login;