// src/components/NewStudentRegistration.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { studentAPI } from '../services/api';
import './StudentRegistration.css';

const NewStudentRegistration = () => {
  const router = useRouter();
  
  // Get user and student data from localStorage (Next.js compatible)
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    college: '',
    grade: '',
    major: '',
    streetAddress: '',
    buildingNumber: '',
    fullAddress: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4; // Only 4 steps now
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Add state for QR code
  const [qrCodeData, setQrCodeData] = useState(null);
  const [showQrCode, setShowQrCode] = useState(false);

  // Load user and student data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const studentData = localStorage.getItem('student');
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
    if (studentData) {
      setStudent(JSON.parse(studentData));
    }
  }, []);

  // Update formData when student data loads
  useEffect(() => {
    if (student) {
      setFormData({
        fullName: (student.fullName || '').toString(),
        phoneNumber: (student.phoneNumber || '').toString(),
        email: (user?.email || '').toString(),
        college: (student.college || '').toString(),
        grade: (student.grade || '').toString(),
        major: (student.major || '').toString(),
        streetAddress: (student.address?.streetAddress || '').toString(),
        buildingNumber: (student.address?.buildingNumber || '').toString(),
        fullAddress: (student.address?.fullAddress || '').toString()
      });
    }
  }, [student, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1: // Personal Information
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        break;
      case 2: // Academic Information
        if (!formData.college.trim()) newErrors.college = 'College is required';
        if (!formData.grade.trim()) newErrors.grade = 'Grade level is required';
        if (!formData.major.trim()) newErrors.major = 'Major is required';
        break;
      case 3: // Address Information
        if (!formData.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
        if (!formData.fullAddress.trim()) newErrors.fullAddress = 'Full address is required';
        break;
      case 4: // Review - no validation needed
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    try {
      // Update student profile with email
      const updateData = {
        ...formData,
        email: user?.email
      };
      const updateResponse = await studentAPI.updateProfile(updateData);
      console.log('Profile update response:', updateResponse);
      
      if (updateResponse.success) {
        // Update localStorage
        const updatedStudent = { ...student, ...formData };
        localStorage.setItem('student', JSON.stringify(updatedStudent));
        setStudent(updatedStudent);
        
        // Generate QR code
        const qrResponse = await studentAPI.generateQRCode();
        console.log('QR generation response:', qrResponse);
        
        if (qrResponse.success) {
          const qrData = qrResponse.qrCodeDataURL || qrResponse.qrCode || qrResponse.qrCodeUrl || qrResponse.data;
          console.log('QR data:', qrData);
          setQrCodeData(qrData);
          setShowQrCode(true);
        } else {
          setErrors({ general: 'Failed to generate QR code: ' + qrResponse.message });
        }
      } else {
        setErrors({ general: 'Failed to update profile: ' + updateResponse.message });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Registration failed: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  // Test QR generation directly
  const testQRGeneration = async () => {
    console.log('Testing QR generation directly...');
    setLoading(true);
    try {
      const qrResponse = await studentAPI.generateQRCode();
      console.log('Direct QR Response:', qrResponse);
      
      if (qrResponse.success) {
        const qrData = qrResponse.qrCodeDataURL || qrResponse.qrCode || qrResponse.qrCodeUrl || qrResponse.data;
        console.log('Direct QR data:', qrData);
        setQrCodeData(qrData);
        setShowQrCode(true);
        alert('QR code generated successfully!');
      } else {
        alert('QR generation failed: ' + qrResponse.message);
      }
    } catch (error) {
      console.error('Direct QR generation error:', error);
      alert('QR generation error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = async () => {
    console.log('QR Code Data:', qrCodeData);
    console.log('Type:', typeof qrCodeData);
    
    try {
      if (typeof qrCodeData === 'string') {
        let dataUrl;
        
        if (qrCodeData.startsWith('data:image')) {
          // Already a data URL
          dataUrl = qrCodeData;
        } else if (qrCodeData.startsWith('http')) {
          // It's a URL, fetch the image and convert to blob
          const response = await fetch(qrCodeData);
          const blob = await response.blob();
          dataUrl = URL.createObjectURL(blob);
        } else {
          // Base64 string without prefix
          dataUrl = `data:image/png;base64,${qrCodeData}`;
        }
        
        // Create download link
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `student-qr-code-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('QR code downloaded successfully');
      } else {
        console.error('Invalid QR code data type:', typeof qrCodeData);
        alert('Invalid QR code data');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed: ' + error.message);
    }
  };

  const handleBackToPortal = () => {
    router.push('/');
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div
          key={index}
          className={`step ${index + 1 <= currentStep ? 'active' : ''} ${index + 1 === currentStep ? 'current' : ''}`}
        >
          <span className="step-number">{index + 1}</span>
          <span className="step-label">
            {index === 0 && 'Personal'}
            {index === 1 && 'Academic'}
            {index === 2 && 'Address'}
            {index === 3 && 'Review'}
          </span>
        </div>
      ))}
    </div>
  );

  // Add QR Code display component
  const renderQRCodeDisplay = () => {
    console.log('Rendering QR code display, qrCodeData:', qrCodeData ? 'exists' : 'null');
    
    return (
      <div className="qr-code-display">
        <div className="success-message">
          <h2>🎉 Registration Complete!</h2>
          <p>Your profile has been updated and QR code generated successfully!</p>
        </div>
        
        <div className="qr-code-container">
          {/* Student Information Card */}
          <div className="student-info-card">
            <div className="student-details">
              <h3 className="student-name">{formData.fullName}</h3>
              <div className="student-info-grid">
                <div className="info-item">
                  <span className="info-label">College:</span>
                  <span className="info-value">{formData.college}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Grade:</span>
                  <span className="info-value">{formData.grade.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Major:</span>
                  <span className="info-value">{formData.major}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{formData.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{formData.phoneNumber}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Address:</span>
                  <span className="info-value">{formData.streetAddress}, {formData.fullAddress}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* QR Code */}
          <div className="qr-code-section">
            <h3>Your Student QR Code</h3>
            {qrCodeData ? (
              <div className="qr-code-wrapper">
                <img 
                  src={qrCodeData} 
                  alt="Student QR Code" 
                  className="qr-code-image"
                  style={{ width: '300px', height: '300px', display: 'block', margin: '0 auto', border: '2px solid #e2e8f0' }}
                />
                <button 
                  onClick={handleDownloadQR}
                  className="download-btn"
                  style={{
                    marginTop: '15px',
                    padding: '12px 24px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  📥 Download QR Code
                </button>
              </div>
            ) : (
              <div className="qr-loading">
                <p>Generating QR code...</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="action-buttons">
          <button 
            onClick={handleBackToPortal}
            className="back-to-portal-btn"
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              marginRight: '10px'
            }}
          >
            ← Back to Portal
          </button>
        </div>
      </div>
    );
  };

  const renderPersonalInfo = () => (
    <div className="form-section">
      <div className="section-header">
        <span className="section-icon">👤</span>
        <h2>Personal Information</h2>
        <p>Please provide your basic personal details</p>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="fullName">Full Name *</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
            className="form-input"
          />
          {errors.fullName && <span className="error-text">{errors.fullName}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number *</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="(123) 456-7890"
            required
            className="form-input"
          />
          {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
        </div>
        <div className="form-group full-width">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your.email@example.com"
            required
            className="form-input"
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>
      </div>
    </div>
  );

  const renderAcademicInfo = () => (
    <div className="form-section">
      <div className="section-header">
        <span className="section-icon">🎓</span>
        <h2>Academic Information</h2>
        <p>Tell us about your academic background</p>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="college">College *</label>
          <input
            type="text"
            id="college"
            name="college"
            value={formData.college}
            onChange={handleInputChange}
            placeholder="Enter your college name"
            required
            className="form-input"
          />
          {errors.college && <span className="error-text">{errors.college}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="grade">Grade Level *</label>
          <select
            id="grade"
            name="grade"
            value={formData.grade}
            onChange={handleInputChange}
            required
            className="form-input"
          >
            <option value="">Select Grade Level</option>
            <option value="first-year">First year</option>
            <option value="preparatory">Preparatory</option>
            <option value="second-year">Second year</option>
            <option value="third-year">Third year</option>
            <option value="fourth-year">Fourth year</option>
            <option value="fifth-year">Fifth year</option>
          </select>
          {errors.grade && <span className="error-text">{errors.grade}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="major">Major/Field of Study *</label>
          <input
            type="text"
            id="major"
            name="major"
            value={formData.major}
            onChange={handleInputChange}
            placeholder="Enter your major"
            required
            className="form-input"
          />
          {errors.major && <span className="error-text">{errors.major}</span>}
        </div>
      </div>
    </div>
  );

  const renderAddressInfo = () => (
    <div className="form-section">
      <div className="section-header">
        <span className="section-icon">📍</span>
        <h2>Address Information</h2>
        <p>Please provide your current address details</p>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="streetAddress">Street Address *</label>
          <input
            type="text"
            id="streetAddress"
            name="streetAddress"
            value={formData.streetAddress}
            onChange={handleInputChange}
            placeholder="Enter your street address"
            required
            className="form-input"
          />
          {errors.streetAddress && <span className="error-text">{errors.streetAddress}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="buildingNumber">Building/Apt Number</label>
          <input
            type="text"
            id="buildingNumber"
            name="buildingNumber"
            value={formData.buildingNumber}
            onChange={handleInputChange}
            placeholder="Apt, Suite, etc."
            className="form-input"
          />
        </div>
        <div className="form-group full-width">
          <label htmlFor="fullAddress">Full Address *</label>
          <textarea
            id="fullAddress"
            name="fullAddress"
            value={formData.fullAddress}
            onChange={handleInputChange}
            placeholder="City, State, ZIP Code, Country"
            className="form-textarea"
            rows="3"
            required
          />
          {errors.fullAddress && <span className="error-text">{errors.fullAddress}</span>}
        </div>
      </div>
    </div>
  );

  const renderReviewInfo = () => (
    <div className="form-section">
      <div className="section-header">
        <span className="section-icon">📋</span>
        <h2>Review Your Information</h2>
        <p>Please review your information before generating your QR code</p>
      </div>

      <div className="review-section">
        <div className="review-grid">
          <div className="review-group">
            <h3>Personal Information</h3>
            <div className="review-item">
              <span className="review-label">Full Name:</span>
              <span className="review-value">{formData.fullName}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Email:</span>
              <span className="review-value">{formData.email}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Phone:</span>
              <span className="review-value">{formData.phoneNumber}</span>
            </div>
          </div>

          <div className="review-group">
            <h3>Academic Information</h3>
            <div className="review-item">
              <span className="review-label">College:</span>
              <span className="review-value">{formData.college}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Grade:</span>
              <span className="review-value">{formData.grade.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Major:</span>
              <span className="review-value">{formData.major}</span>
            </div>
          </div>

          <div className="review-group">
            <h3>Address Information</h3>
            <div className="review-item">
              <span className="review-label">Street Address:</span>
              <span className="review-value">{formData.streetAddress}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Building:</span>
              <span className="review-value">{formData.buildingNumber}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Full Address:</span>
              <span className="review-value">{formData.fullAddress}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFormContent = () => {
    console.log('renderFormContent called - showQrCode:', showQrCode, 'qrCodeData:', qrCodeData ? 'exists' : 'null');
    
    // Show QR code if it's been generated
    if (showQrCode) {
      console.log('Rendering QR code display');
      return renderQRCodeDisplay();
    }
    
    switch (currentStep) {
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderAcademicInfo();
      case 3:
        return renderAddressInfo();
      case 4:
        return renderReviewInfo();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <div className="student-registration">
      {/* Header Section */}
      <div className="registration-header">
        <button 
          className="back-btn" 
          onClick={handleBackToPortal}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <span className="btn-icon">←</span> Back to Portal
        </button>
        
        <div className="header-content">
          <h1>Student Registration</h1>
          <p>Complete your registration to get your student QR code</p>
        </div>
        
        <button 
          onClick={testQRGeneration}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          {loading ? 'Testing...' : 'Test QR Generation'}
        </button>
      </div>

      {/* Main Content */}
      <div className="registration-content">
        <div className="registration-card">
          {/* Step Indicator - hide when showing QR code */}
          {!showQrCode && renderStepIndicator()}
          
          {errors.general && (
            <div className="error-message">
              {errors.general}
            </div>
          )}
          
          {/* Form Content */}
          {!showQrCode ? (
            <form onSubmit={handleSubmit} className="registration-form" key="registration-form">
              {renderFormContent()}
              
              {/* Navigation Buttons */}
              <div className="form-navigation">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="nav-btn prev-btn"
                    disabled={loading}
                  >
                    <span className="btn-icon">←</span> Previous
                  </button>
                )}
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="nav-btn next-btn"
                    disabled={loading}
                  >
                    Next <span className="btn-icon">→</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="btn-icon">⏳</span> Generating QR Code...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">🎯</span> Generate Student QR Code
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          ) : (
            renderQRCodeDisplay()
          )}
        </div>
      </div>
    </div>
  );
};

export default NewStudentRegistration;
