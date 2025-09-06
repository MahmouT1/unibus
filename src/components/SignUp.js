// src/components/SignUp.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    phoneNumber: '',
    college: '',
    grade: '',
    major: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const { register } = useAuth();

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

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (!formData.college) {
      newErrors.college = 'College selection is required';
    }

    if (!formData.grade) {
      newErrors.grade = 'Grade level is required';
    }

    if (!formData.major.trim()) {
      newErrors.major = 'Major is required';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
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

    try {
      const registrationData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        studentId: formData.studentId.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        college: formData.college,
        grade: formData.grade,
        major: formData.major.trim()
      };

      const result = await register(registrationData);

      if (result.success) {
        navigate('/');
      } else {
        if (result.message.includes('email')) {
          setErrors({ email: 'Email already registered' });
        } else if (result.message.includes('Student ID')) {
          setErrors({ studentId: 'Student ID already registered' });
        } else {
          setErrors({ general: result.message });
        }
      }
    } catch (error) {
      setErrors({ general: 'Registration failed. Please try again.' });
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigate('/login');
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
                <span className="feature-icon">🎓</span>
                <span>Student Registration</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🚌</span>
                <span>Transportation Access</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📱</span>
                <span>Mobile Friendly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
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
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
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
                    />
                  </div>
                  {errors.fullName && <span className="field-error">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="studentId">Student ID</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🆔</span>
                    <input
                      type="text"
                      id="studentId"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      placeholder="Enter your student ID"
                      required
                      disabled={loading}
                    />
                  </div>
                  {errors.studentId && <span className="field-error">{errors.studentId}</span>}
                </div>
              </div>

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
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📞</span>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      required
                      disabled={loading}
                    />
                  </div>
                  {errors.phoneNumber && <span className="field-error">{errors.phoneNumber}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="college">College/University</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🏫</span>
                    <select
                      id="college"
                      name="college"
                      value={formData.college}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    >
                      <option value="">Select your college</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Medicine">Medicine</option>
                      <option value="Arts">Arts & Humanities</option>
                      <option value="Science">Science</option>
                      <option value="Business">Business</option>
                      <option value="Law">Law</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {errors.college && <span className="field-error">{errors.college}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="grade">Grade Level</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📚</span>
                    <select
                      id="grade"
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    >
                      <option value="">Select grade level</option>
                      <option value="freshman">Freshman</option>
                      <option value="sophomore">Sophomore</option>
                      <option value="junior">Junior</option>
                      <option value="senior">Senior</option>
                      <option value="graduate">Graduate</option>
                    </select>
                  </div>
                  {errors.grade && <span className="field-error">{errors.grade}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="major">Major/Field of Study</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🎯</span>
                    <input
                      type="text"
                      id="major"
                      name="major"
                      value={formData.major}
                      onChange={handleInputChange}
                      placeholder="Enter your major"
                      required
                      disabled={loading}
                    />
                  </div>
                  {errors.major && <span className="field-error">{errors.major}</span>}
                </div>
              </div>

              <div className="form-row">
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
                      placeholder="Create a password"
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
                  {errors.password && <span className="field-error">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
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
              </div>

              <div className="form-options">
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                  <span className="checkmark"></span>
                  I agree to the{' '}
                  <button type="button" className="terms-link">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" className="terms-link">
                    Privacy Policy
                  </button>
                </label>
                {errors.agreeToTerms && <span className="field-error">{errors.agreeToTerms}</span>}
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
