import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './SupportCenter.css';

const SupportCenter = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    category: '',
    priority: 'medium',
    subject: '',
    description: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Support ticket submitted:', formData);
    alert('Support ticket submitted successfully! We will get back to you soon.');
  };

  const handleBackToPortal = () => {
    router.push('/student/portal');
  };

  return (
    <div className="support-center">
      {/* Header Section */}
      <div className="support-header">
        <button className="back-btn" onClick={handleBackToPortal}>
          <span className="btn-icon">←</span>
          Back to Portal
        </button>
        <div className="header-content">
          <h1>Support Center</h1>
          <p>We're here to help! Submit a ticket and our team will get back to you</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="support-content">
        {/* Support Form */}
        <div className="support-form-section">
          <div className="form-card">
            <div className="form-header">
              <span className="form-icon">🎧</span>
              <h2>Submit Support Ticket</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="support-form">
              <div className="form-group">
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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Help Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  >
                    <option value="">Select Category</option>
                    <option value="emergency">Emergency Support</option>
                    <option value="general">General Support</option>
                    <option value="academic">Academic Support</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing Support</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="priority">Priority Level</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="low">Low - Minor issue</option>
                    <option value="medium">Medium - Standard issue</option>
                    <option value="high">High - Urgent issue</option>
                    <option value="critical">Critical - Emergency</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Brief description of your issue"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Describe Your Issue *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Please provide detailed information about your issue, including any error messages, steps you've taken, and what you expected to happen..."
                  minLength={20}
                  required
                  className="form-textarea"
                />
                <small className="form-hint">Minimum 20 characters required</small>
              </div>

              <div className="form-group">
                <label htmlFor="files">Attach Files (Optional)</label>
                <input
                  type="file"
                  id="files"
                  name="files"
                  multiple
                  className="form-file"
                />
                <small className="form-hint">Maximum 5 files, 10MB each</small>
              </div>

              <button type="submit" className="submit-btn">
                <span className="btn-icon">📨</span>
                Send Support Ticket
              </button>
            </form>
          </div>
        </div>

        {/* Support Information */}
        <div className="support-info-section">
          {/* Contact Information */}
          <div className="info-card">
            <div className="card-header">
              <span className="card-icon">📞</span>
              <h3>Contact Numbers</h3>
            </div>
            <div className="contact-list">
              <div className="contact-item emergency">
                <span className="contact-icon">SOS</span>
                <div className="contact-details">
                  <span className="contact-label">Emergency Support</span>
                  <a href="tel:+1555911HELP" className="contact-number">+1 (555) 911-HELP</a>
                </div>
              </div>
              <div className="contact-item general">
                <span className="contact-icon">💬</span>
                <div className="contact-details">
                  <span className="contact-label">General Support</span>
                  <a href="tel:+15551234567" className="contact-number">+1 (555) 123-4567</a>
                </div>
              </div>
              <div className="contact-item academic">
                <span className="contact-icon">🎓</span>
                <div className="contact-details">
                  <span className="contact-label">Academic Support</span>
                  <a href="tel:+15557890123" className="contact-number">+1 (555) 789-0123</a>
                </div>
              </div>
            </div>
          </div>

          {/* Response Times */}
          <div className="info-card">
            <div className="card-header">
              <span className="card-icon">⏱️</span>
              <h3>Response Times</h3>
            </div>
            <div className="response-list">
              <div className="response-item critical">
                <span className="response-level">Critical</span>
                <span className="response-time">1-2 hours</span>
              </div>
              <div className="response-item high">
                <span className="response-level">High</span>
                <span className="response-time">4-8 hours</span>
              </div>
              <div className="response-item medium">
                <span className="response-level">Medium</span>
                <span className="response-time">1-2 days</span>
              </div>
              <div className="response-item low">
                <span className="response-level">Low</span>
                <span className="response-time">3-5 days</span>
              </div>
            </div>
          </div>

          {/* Quick Help */}
          <div className="info-card">
            <div className="card-header">
              <span className="card-icon">📚</span>
              <h3>Quick Help</h3>
            </div>
            <div className="help-list">
              <div className="help-item">
                <span className="help-icon">📖</span>
                <div className="help-content">
                  <span className="help-title">View FAQ</span>
                  <span className="help-desc">Common questions and answers</span>
                </div>
              </div>
              <div className="help-item">
                <span className="help-icon">📚</span>
                <div className="help-content">
                  <span className="help-title">User Guides</span>
                  <span className="help-desc">Step-by-step tutorials</span>
                </div>
              </div>
              <div className="help-item">
                <span className="help-icon">🎥</span>
                <div className="help-content">
                  <span className="help-title">Video Tutorials</span>
                  <span className="help-desc">Visual learning resources</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportCenter;
