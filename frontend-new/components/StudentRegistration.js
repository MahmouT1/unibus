// src/components/StudentRegistration.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { studentAPI } from '../services/api';
import './StudentRegistration.css';

const StudentRegistration = () => {
  const router = useRouter();
  
  // Get user and student data from localStorage (Next.js compatible)
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: (student?.fullName || '').toString(),
    phoneNumber: (student?.phoneNumber || '').toString(),
    email: (user?.email || '').toString(),
    college: (student?.college || '').toString(),
    grade: (student?.grade || '').toString(),
    major: (student?.major || '').toString(),
    streetAddress: (student?.address?.streetAddress || '').toString(),
    buildingNumber: (student?.address?.buildingNumber || '').toString(),
    fullAddress: (student?.address?.fullAddress || '').toString()
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
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
      setFormData(prev => ({
        ...prev,
        fullName: (student.fullName || '').toString(),
        phoneNumber: (student.phoneNumber || '').toString(),
        college: (student.college || '').toString(),
        grade: (student.grade || '').toString(),
        major: (student.major || '').toString(),
        streetAddress: (student.address?.streetAddress || '').toString(),
        buildingNumber: (student.address?.buildingNumber || '').toString(),
        fullAddress: (student.address?.fullAddress || '').toString()
      }));
    }
  }, [student]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const stringValue = value === null || value === undefined ? '' : String(value);
    setFormData(prev => ({
      ...prev,
      [name]: stringValue
    }));
    
    // Clear field error
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
        if (!formData.fullName.trim()) {
          newErrors.fullName = 'Full name is required';
        }
        if (!formData.phoneNumber.trim()) {
          newErrors.phoneNumber = 'Phone number is required';
        }
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        }
        break;
      
      case 2: // Academic Information
        if (!formData.college.trim()) {
          newErrors.college = 'College is required';
        }
        if (!formData.grade) {
          newErrors.grade = 'Grade level is required';
        }
        if (!formData.major.trim()) {
          newErrors.major = 'Major is required';
        }
        break;
      
      case 3: // Address Information
        if (!formData.streetAddress.trim()) {
          newErrors.streetAddress = 'Street address is required';
        }
        break;
      
      
      default:
        // No validation needed for other steps
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        college: formData.college.trim(),
        grade: formData.grade,
        major: formData.major.trim(),
        address: {
          streetAddress: formData.streetAddress.trim(),
          buildingNumber: formData.buildingNumber.trim(),
          fullAddress: formData.fullAddress.trim()
        },
        email: user?.email
      };

      const response = await studentAPI.updateProfile(updateData);
      
      if (response.success) {
        // Update student data in localStorage
        if (response.student) {
          localStorage.setItem('student', JSON.stringify(response.student));
          setStudent(response.student);
        }
        
        // Generate QR code after successful profile update
        try {
          console.log('Starting QR code generation...');
          const qrResponse = await studentAPI.generateQRCode();
          console.log('QR Response:', qrResponse); // Debug log
          console.log('QR Response success:', qrResponse.success);
          console.log('QR Response data:', qrResponse.qrCodeDataURL || qrResponse.qrCode || qrResponse.qrCodeUrl || qrResponse.data);
          
          if (qrResponse.success) {
            const qrData = qrResponse.qrCodeDataURL || qrResponse.qrCode || qrResponse.qrCodeUrl || qrResponse.data;
            console.log('Setting QR data:', qrData);
            console.log('QR data type:', typeof qrData);
            console.log('QR data length:', qrData ? qrData.length : 'null');
            
            setQrCodeData(qrData);
            setShowQrCode(true);
            console.log('QR code state set - showQrCode should be true now');
            // Don't navigate away immediately - let user see the QR code
          } else {
            throw new Error(qrResponse.message || 'Failed to generate QR code');
          }
        } catch (qrError) {
          console.error('QR code generation failed:', qrError);
          alert('Profile updated successfully! QR code generation failed - please try again later.');
          router.push('/');
        }
      } else {
        setErrors({ general: response.message || 'Failed to update profile' });
      }
    } catch (error) {
      setErrors({ general: error.response?.data?.message || error.message || 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPortal = () => {
    router.push('/');
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
        
        // Clean up object URL if we created one
        if (qrCodeData.startsWith('http')) {
          URL.revokeObjectURL(dataUrl);
        }
        
      } else {
        alert('Invalid QR code format');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please right-click the QR image and "Save image as..."');
    }
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
    console.log('renderQRCodeDisplay called - qrCodeData:', qrCodeData ? 'exists' : 'null');
    console.log('qrCodeData type:', typeof qrCodeData);
    console.log('qrCodeData length:', qrCodeData ? qrCodeData.length : 'null');
    
    return (
    <div className="qr-code-section">
      <div className="section-header">
        <span className="section-icon">📱</span>
        <h2>Your Student QR Code</h2>
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
                <span className="info-label">Phone:</span>
                <span className="info-value">{formData.phoneNumber}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="qr-code-display">
          {qrCodeData ? (
            <>
              {/* Debug information */}
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                Debug: QR Code Data Type: {typeof qrCodeData}, Length: {qrCodeData.length}, Starts with: {qrCodeData.substring(0, 50)}...
              </div>
              
              {/* If qrCodeData is a URL to an image */}
              {typeof qrCodeData === 'string' && qrCodeData.startsWith('http') ? (
                <img src={qrCodeData} alt="Student QR Code" className="qr-code-image" />
              ) : 
              /* If qrCodeData is a base64 string */
              typeof qrCodeData === 'string' && qrCodeData.startsWith('data:image') ? (
                <img src={qrCodeData} alt="Student QR Code" className="qr-code-image" />
              ) : 
              /* If qrCodeData is base64 without prefix */
              typeof qrCodeData === 'string' ? (
                <img src={`data:image/png;base64,${qrCodeData}`} alt="Student QR Code" className="qr-code-image" />
              ) : (
                <div className="qr-code-placeholder">
                  <p>QR Code generated but cannot display format</p>
                  <pre>{JSON.stringify(qrCodeData, null, 2)}</pre>
                </div>
              )}
            </>
          ) : (
            <div className="qr-code-placeholder">
              <p>QR Code data not available</p>
            </div>
          )}
        </div>
        
        <div className="qr-code-actions">
          <button 
            type="button" 
            className="download-btn"
            onClick={handleDownloadQR}
          >
            📥 Download QR Code
          </button>
          
          <button 
            type="button" 
            className="continue-btn"
            onClick={handleBackToPortal}
          >
            Continue to Portal
          </button>
        </div>
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
            value={formData.fullName || ''}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
            className="form-input"
            disabled={loading}
          />
          {errors.fullName && <span className="field-error">{errors.fullName}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number *</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber || ''}
            onChange={handleInputChange}
            placeholder="(123) 456-7890"
            required
            className="form-input"
            disabled={loading}
          />
          {errors.phoneNumber && <span className="field-error">{errors.phoneNumber}</span>}
        </div>
        
        <div className="form-group full-width">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={handleInputChange}
            placeholder="your.email@example.com"
            required
            className="form-input"
            disabled={true} // Email cannot be changed after registration
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
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
            value={formData.college || ''}
            onChange={handleInputChange}
            placeholder="Enter your college name"
            required
            className="form-input"
            disabled={loading}
          />
          {errors.college && <span className="field-error">{errors.college}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="grade">Grade Level *</label>
          <select
            id="grade"
            name="grade"
            value={formData.grade || ''}
            onChange={handleInputChange}
            required
            className="form-input"
            disabled={loading}
          >
            <option value="">Select Grade Level</option>
            <option value="first-year">First Year</option>
            <option value="preparatory">Preparatory</option>
            <option value="second-year">Second Year</option>
            <option value="third-year">Third Year</option>
            <option value="fourth-year">Fourth Year</option>
            <option value="fifth-year">Fifth Year</option>
          </select>
          {errors.grade && <span className="field-error">{errors.grade}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="major">Major/Field of Study *</label>
          <input
            type="text"
            id="major"
            name="major"
            value={formData.major || ''}
            onChange={handleInputChange}
            placeholder="Enter your major"
            required
            className="form-input"
            disabled={loading}
          />
          {errors.major && <span className="field-error">{errors.major}</span>}
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
            value={formData.streetAddress || ''}
            onChange={handleInputChange}
            placeholder="Enter your street address"
            required
            className="form-input"
            disabled={loading}
          />
          {errors.streetAddress && <span className="field-error">{errors.streetAddress}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="buildingNumber">Building/Apt Number</label>
          <input
            type="text"
            id="buildingNumber"
            name="buildingNumber"
            value={formData.buildingNumber || ''}
            onChange={handleInputChange}
            placeholder="Apt, Suite, etc."
            className="form-input"
            disabled={loading}
          />
        </div>
        
        <div className="form-group full-width">
          <label htmlFor="fullAddress">Full Address</label>
          <textarea
            id="fullAddress"
            name="fullAddress"
            value={formData.fullAddress || ''}
            onChange={handleInputChange}
            placeholder="City, State, ZIP Code, Country"
            className="form-textarea"
            rows="3"
            disabled={loading}
          />
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
        <button className="back-btn" onClick={handleBackToPortal}>
          <span className="btn-icon">←</span>
          Back to Portal
        </button>
        <div className="header-content">
          <h1>Update Profile</h1>
          <p>Complete your registration to get your student QR code</p>
        </div>
        <button 
          className="test-qr-btn" 
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
                    <span className="btn-icon">←</span>
                    Previous
                  </button>
                )}
                
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="nav-btn next-btn"
                    disabled={loading}
                  >
                    Next
                    <span className="btn-icon">→</span>
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="loading-spinner"></span>
                        Updating Profile...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">🎯</span>
                        Update Profile & Generate QR Code
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          ) : (
            renderFormContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentRegistration;
