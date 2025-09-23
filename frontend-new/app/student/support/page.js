'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SupportPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    category: '',
    priority: 'medium',
    subject: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setFormData(prev => ({ ...prev, email: parsedUser.email }));
    setLoading(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          email: user.email,
          category: '',
          priority: 'medium',
          subject: '',
          description: ''
        });
      } else {
        setError(result.message || 'Failed to submit support ticket');
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      setError('Failed to submit support ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToPortal = () => {
    router.push('/student/portal');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      padding: isMobile ? '16px' : '20px',
      width: '100%',
      overflowX: 'hidden'
    }}>
      {/* Header Section */}
      <div style={{ 
        marginBottom: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '16px' : '20px',
        flexWrap: isMobile ? 'wrap' : 'nowrap'
      }}>
        <button 
          onClick={handleBackToPortal}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Back to Portal
        </button>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#1f2937' }}>
            Support Center
          </h1>
          <p style={{ margin: '0', color: '#6b7280' }}>
            We're here to help! Submit a ticket and our team will get back to you
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
        gap: isMobile ? '20px' : '30px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Support Form */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: isMobile ? '24px' : '30px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#1f2937' }}>
              🎧 Submit Support Ticket
            </h2>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Success Message */}
            {submitSuccess && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ fontSize: '24px' }}>✅</div>
                <div>
                  <div style={{ fontWeight: '600', color: '#059669', marginBottom: '4px' }}>
                    Ticket Submitted Successfully!
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Your support ticket has been created. We'll get back to you soon.
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ fontSize: '24px' }}>❌</div>
                <div>
                  <div style={{ fontWeight: '600', color: '#dc2626', marginBottom: '4px' }}>
                    Submission Failed
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {error}
                  </div>
                </div>
              </div>
            )}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Help Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Select Category</option>
                  <option value="emergency">Emergency Support</option>
                  <option value="general">General Support</option>
                  <option value="academic">Academic Support</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing Support</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Priority Level
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="low">Low - Minor issue</option>
                  <option value="medium">Medium - Standard issue</option>
                  <option value="high">High - Urgent issue</option>
                  <option value="critical">Critical - Emergency</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Brief description of your issue"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                Describe Your Issue *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Please provide detailed information about your issue..."
                minLength={20}
                required
                rows={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
              />
            </div>

            <button 
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '12px 24px',
                backgroundColor: submitting ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {submitting ? (
                <>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid rgba(255,255,255,0.3)', 
                    borderTop: '2px solid white', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite' 
                  }}></div>
                  Submitting...
                </>
              ) : (
                '📨 Send Support Ticket'
              )}
            </button>
          </form>
        </div>

        {/* Support Information */}
        <div>
          {/* Contact Information */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1f2937' }}>
              📞 Contact Numbers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ 
                  backgroundColor: '#ef4444', 
                  color: 'white', 
                  padding: '8px', 
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  SOS
                </span>
                <div>
                  <div style={{ fontWeight: '500', color: '#1f2937' }}>Emergency Support</div>
                  <a href="tel:+1555911HELP" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                    +1 (555) 911-HELP
                  </a>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ 
                  backgroundColor: '#3b82f6', 
                  color: 'white', 
                  padding: '8px', 
                  borderRadius: '6px',
                  fontSize: '16px'
                }}>
                  💬
                </span>
                <div>
                  <div style={{ fontWeight: '500', color: '#1f2937' }}>General Support</div>
                  <a href="tel:+15551234567" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                    +1 (555) 123-4567
                  </a>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ 
                  backgroundColor: '#10b981', 
                  color: 'white', 
                  padding: '8px', 
                  borderRadius: '6px',
                  fontSize: '16px'
                }}>
                  🎓
                </span>
                <div>
                  <div style={{ fontWeight: '500', color: '#1f2937' }}>Academic Support</div>
                  <a href="tel:+15557890123" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                    +1 (555) 789-0123
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Response Times */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1f2937' }}>
              ⏱️ Response Times
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '500', color: '#ef4444' }}>Critical</span>
                <span style={{ color: '#6b7280' }}>1-2 hours</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '500', color: '#f59e0b' }}>High</span>
                <span style={{ color: '#6b7280' }}>4-8 hours</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '500', color: '#3b82f6' }}>Medium</span>
                <span style={{ color: '#6b7280' }}>1-2 days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '500', color: '#10b981' }}>Low</span>
                <span style={{ color: '#6b7280' }}>3-5 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
