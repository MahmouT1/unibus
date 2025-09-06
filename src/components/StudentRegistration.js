// src/components/StudentRegistration.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { studentAPI } from '../services/api';
import './StudentRegistration.css';

const StudentRegistration = () => {
  const navigate = useNavigate();
  const { user, student, updateStudent } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: student?.fullName || '',
    phoneNumber: student?.phoneNumber || '',
    email: user?.email || '',
    college: student?.college || '',
    grade: student?.grade || '',
    major: student?.major || '',
    streetAddress: student?.address?.streetAddress || '',
    buildingNumber: student?.address?.buildingNumber || '',
    fullAddress: student?.address?.fullAddress || '',
    profilePhoto: null
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Add state for QR code
  const [qrCodeData, setQrCodeData] = useState(null);
  const [showQrCode, setShowQrCode] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setErrors({ profilePhoto: 'Please select an image file' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setErrors({ profilePhoto: 'File size must be less than 10MB' });
      return;
    }

    setFormData(prev => ({
      ...prev,
      profilePhoto: file
    }));

    // Upload immediately
    try {
      setUploadingPhoto(true);
      const response = await studentAPI.uploadProfilePhoto(file);
      
      if (response.success) {
        // Update student data with new photo URL
        const updatedStudent = { ...student };
        updatedStudent.profilePhoto = response.photoUrl;
        updateStudent(updatedStudent);
      }
    } catch (error) {
      setErrors({ profilePhoto: 'Failed to upload photo. Please try again.' });
      console.error('Photo upload error:', error);
    } finally {
      setUploadingPhoto(false);
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
        }
      };

      const response = await studentAPI.updateProfile(updateData);
      
      if (response.success) {
        updateStudent(response.student);
        
        // Generate QR code after successful profile update
        try {
          const qrResponse = await studentAPI.generateQRCode();
          console.log('QR Response:', qrResponse); // Debug log
          
          if (qrResponse.success) {
            setQrCodeData(qrResponse.qrCode || qrResponse.qrCodeUrl || qrResponse.data);
            setShowQrCode(true);
            // Don't navigate away immediately - let user see the QR code
          } else {
            throw new Error(qrResponse.message || 'Failed to generate QR code');
          }
        } catch (qrError) {
          console.error('QR code generation failed:', qrError);
          alert('Profile updated successfully! QR code generation failed - please try again later.');
          navigate('/');
        }
      } else {
        setErrors({ general: response.message || 'Failed to update profile' });
      }
    } catch (error) {
      setErrors({ general: 'Failed to update profile. Please try again.' });
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPortal = () => {
    navigate('/');
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
        } else {
          // Base64 string without prefix
          dataUrl = `data:image/png;base64,${qrCodeData}`;
        }
        
        // Create download link for base64 data
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `student-qr-code-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
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
            {index === 3 && 'Photo'}
          </span>
        </div>
      ))}
    </div>
  );

  // Add QR Code display component
  const renderQRCodeDisplay = () => (
    <div className="qr-code-section">
      <div className="section-header">
        <span className="section-icon">📱</span>
        <h2>Your Student QR Code</h2>
        <p>Your profile has been updated and QR code generated successfully!</p>
      </div>
      
      <div className="qr-code-container">
        <div className="qr-code-display">
          {qrCodeData ? (
            <>
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
            value={formData.phoneNumber}
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
            value={formData.email}
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
            value={formData.college}
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
            value={formData.grade}
            onChange={handleInputChange}
            required
            className="form-input"
            disabled={loading}
          >
            <option value="">Select Grade Level</option>
            <option value="freshman">Freshman</option>
            <option value="sophomore">Sophomore</option>
            <option value="junior">Junior</option>
            <option value="senior">Senior</option>
            <option value="graduate">Graduate</option>
          </select>
          {errors.grade && <span className="field-error">{errors.grade}</span>}
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
            value={formData.streetAddress}
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
            value={formData.buildingNumber}
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
            value={formData.fullAddress}
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

  const renderProfilePhoto = () => (
    <div className="form-section">
      <div className="section-header">
        <span className="section-icon">📷</span>
        <h2>Profile Photo</h2>
        <p>Upload a clear photo for your student profile</p>
      </div>
      
      <div className="photo-upload-section">
        <div className="photo-preview">
          {student?.profilePhoto ? (
            <img
              src={`http://localhost:5000${student.profilePhoto}`}
              alt="Profile preview"
              className="photo-preview-img"
            />
          ) : formData.profilePhoto ? (
            <img
              src={URL.createObjectURL(formData.profilePhoto)}
              alt="Profile preview"
              className="photo-preview-img"
            />
          ) : (
            <div className="photo-placeholder">
              <span className="placeholder-icon">👤</span>
              <p>No photo selected</p>
            </div>
          )}
        </div>
        
        <div className="photo-upload-controls">
          <label htmlFor="profilePhoto" className={`upload-btn ${uploadingPhoto ? 'uploading' : ''}`}>
            <span className="upload-icon">📤</span>
            {uploadingPhoto ? 'Uploading...' : 'Choose Photo'}
          </label>
          <input
            type="file"
            id="profilePhoto"
            name="profilePhoto"
            accept="image/png, image/jpeg, image/gif"
            onChange={handleFileChange}
            className="file-input"
            disabled={uploadingPhoto}
          />
          <p className="upload-hint">PNG, JPG, GIF up to 10MB</p>
          {errors.profilePhoto && <span className="field-error">{errors.profilePhoto}</span>}
        </div>
      </div>
    </div>
  );

  const renderFormContent = () => {
    // Show QR code if it's been generated
    if (showQrCode) {
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
        return renderProfilePhoto();
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
            <form onSubmit={handleSubmit} className="registration-form">
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
