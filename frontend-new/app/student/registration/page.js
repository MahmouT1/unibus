'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentRegistration() {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    college: '',
    grade: '',
    major: '',
    streetAddress: '',
    buildingNumber: '',
    fullAddress: '',
    profilePhoto: null
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const totalSteps = 5;
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth');
      return;
    }
    
    const user = JSON.parse(userData);
    setFormData(prev => ({
      ...prev,
      email: user.email
    }));
  }, [router]);

  // Handle window resize for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        profilePhoto: file
      }));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First upload photo if exists
      let photoUrl = null;
      if (formData.profilePhoto) {
        console.log('Uploading photo:', formData.profilePhoto.name);
        const photoFormData = new FormData();
        photoFormData.append('profilePhoto', formData.profilePhoto);
        
        const photoResponse = await fetch('/api/students/profile/photo', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: photoFormData
        });
        
        const photoData = await photoResponse.json();
        console.log('Photo upload response:', photoData);
        if (photoData.success) {
          photoUrl = photoData.photoUrl;
          console.log('Photo uploaded successfully:', photoUrl);
        } else {
          console.error('Photo upload failed:', photoData.message);
        }
      }

      // Update student profile
      const userEmail = JSON.parse(localStorage.getItem('user') || '{}').email;
      const updateData = {
        ...formData,
        profilePhoto: photoUrl,
        email: userEmail
      };
      // Don't delete profilePhoto - we need to send the URL to the API

      console.log('Updating student profile with data:', updateData);

      const response = await fetch('/api/students/profile-simple', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      console.log('Profile update response:', data);

      if (data.success) {
        setSuccess(true);
        console.log('Profile updated successfully, student data:', data.student);
        // Generate QR code
        try {
          await fetch('/api/students/generate-qr', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
        } catch (qrError) {
          console.log('QR generation failed:', qrError);
        }
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      marginBottom: '30px' 
    }}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} style={{
          display: 'flex',
          alignItems: 'center',
          margin: '0 10px'
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: index + 1 <= currentStep ? '#007bff' : '#e9ecef',
            color: index + 1 <= currentStep ? 'white' : '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            {index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div style={{
              width: '50px',
              height: '2px',
              background: index + 1 < currentStep ? '#007bff' : '#e9ecef',
              margin: '0 10px'
            }} />
          )}
        </div>
      ))}
    </div>
  );

  const renderPersonalInfo = () => (
    <div>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Personal Information</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Phone Number *
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="(123) 456-7890"
          />
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
          Email Address *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
          placeholder="your.email@example.com"
        />
      </div>
    </div>
  );

  const renderAcademicInfo = () => (
    <div>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Academic Information</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            College *
          </label>
          <input
            type="text"
            name="college"
            value={formData.college}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="Enter your college name"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Grade Level *
          </label>
          <select
            name="grade"
            value={formData.grade}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          >
            <option value="">Select Grade Level</option>
            <option value="first-year">First Year</option>
            <option value="preparatory">Preparatory</option>
            <option value="second-year">Second Year</option>
            <option value="third-year">Third Year</option>
            <option value="fourth-year">Fourth Year</option>
            <option value="fifth-year">Fifth Year</option>
          </select>
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
          Major/Field of Study *
        </label>
        <input
          type="text"
          name="major"
          value={formData.major}
          onChange={handleInputChange}
          required
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
          placeholder="Enter your major"
        />
      </div>
    </div>
  );

  const renderAddressInfo = () => (
    <div>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Address Information</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Street Address *
          </label>
          <input
            type="text"
            name="streetAddress"
            value={formData.streetAddress}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="Enter your street address"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Building/Apt Number
          </label>
          <input
            type="text"
            name="buildingNumber"
            value={formData.buildingNumber}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="Apt, Suite, etc."
          />
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
          Full Address
        </label>
        <textarea
          name="fullAddress"
          value={formData.fullAddress}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px',
            boxSizing: 'border-box',
            minHeight: '100px',
            resize: 'vertical'
          }}
          placeholder="City, State, ZIP Code, Country"
          rows="3"
        />
      </div>
    </div>
  );

  const renderProfilePhoto = () => (
    <div>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Profile Photo</h2>
      <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
        <div style={{ flex: '1' }}>
          <div style={{
            width: '200px',
            height: '200px',
            border: '2px dashed #ddd',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8f9fa',
            marginBottom: '20px'
          }}>
            {formData.profilePhoto ? (
              <img
                src={URL.createObjectURL(formData.profilePhoto)}
                alt="Profile preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>👤</div>
                <p>No photo selected</p>
              </div>
            )}
          </div>
        </div>
        <div style={{ flex: '1' }}>
          <label style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#007bff',
            color: 'white',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '10px'
          }}>
            Choose Photo
            <input
              type="file"
              accept="image/png, image/jpeg, image/gif"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
          <p style={{ color: '#666', fontSize: '14px' }}>
            PNG, JPG, GIF up to 10MB
          </p>
        </div>
      </div>
    </div>
  );

  const renderFormContent = () => {
    switch (currentStep) {
      case 1: return renderPersonalInfo();
      case 2: return renderAcademicInfo();
      case 3: return renderAddressInfo();
      case 4: return renderProfilePhoto();
      case 5: return (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>Review & Submit</h2>
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>Registration Summary</h3>
            <p><strong>Name:</strong> {formData.fullName}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Phone:</strong> {formData.phoneNumber}</p>
            <p><strong>College:</strong> {formData.college}</p>
            <p><strong>Grade:</strong> {formData.grade}</p>
            <p><strong>Major:</strong> {formData.major}</p>
            <p><strong>Address:</strong> {formData.streetAddress}</p>
            {formData.profilePhoto && <p><strong>Photo:</strong> Selected ✓</p>}
          </div>
        </div>
      );
      default: return renderPersonalInfo();
    }
  };

  if (success) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
          <h1 style={{ color: '#28a745', marginBottom: '20px' }}>
            Registration Successful!
          </h1>
          <p style={{ color: '#666', marginBottom: '30px', fontSize: '16px' }}>
            Your data has been registered successfully. Your QR code has been generated and is ready for use.
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              onClick={() => router.push('/student/portal')}
              style={{
                padding: '12px 24px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Back to Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: isMobile ? '16px' : '20px',
      width: '100%',
      overflowX: 'hidden'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: isMobile ? '8px' : '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: isMobile ? '16px' : '20px',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Return to Portal Button */}
          <button
            onClick={() => router.push('/student/portal')}
            style={{
              position: 'absolute',
              left: isMobile ? '12px' : '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: isMobile ? '8px 12px' : '10px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'translateY(-50%) scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <span style={{ fontSize: isMobile ? '14px' : '16px' }}>←</span>
            <span>{isMobile ? 'Portal' : 'Back to Portal'}</span>
          </button>

          <h1 style={{ margin: '0', fontSize: isMobile ? '24px' : '28px' }}>Student Registration</h1>
          <p style={{ margin: '5px 0 0 0', opacity: '0.9' }}>
            Complete your registration to get your student QR code
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '40px' }}>
          {renderStepIndicator()}
          
          {error && (
            <div style={{
              background: '#fee',
              color: '#c33',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {renderFormContent()}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: '40px' 
            }}>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  style={{
                    padding: '12px 24px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  Previous
                </button>
              )}
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  style={{
                    padding: '12px 24px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginLeft: 'auto'
                  }}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    background: loading ? '#ccc' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginLeft: 'auto'
                  }}
                >
                  {loading ? 'Submitting...' : 'Complete Registration'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
