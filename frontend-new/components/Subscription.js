// src/components/Subscription.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './Subscription.css';

const Subscription = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestingSubscription, setRequestingSubscription] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      // Fetch real subscription data from API
      const response = await fetch('/api/subscription/current');
      const data = await response.json();
      
      if (data.success) {
        setSubscription(data.subscription);
      } else {
        setSubscription(null);
        setError(data.message || 'No subscription found');
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      setError('Failed to load subscription data');
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubscription = async () => {
    try {
      setRequestingSubscription(true);
      setError('');

      // Mock subscription request
      const mockSubscription = {
        id: 'sub_123',
        plan: 'Premium',
        status: 'pending',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: 1000,
        features: ['Transportation', 'Support', 'Premium Features']
      };
      
      setSubscription(mockSubscription);
      alert('Subscription request submitted successfully! Please wait for admin approval.');
    } catch (error) {
      console.error('Subscription request error:', error);
      setError('Failed to submit subscription request. Please try again.');
    } finally {
      setRequestingSubscription(false);
    }
  };

  const handleBackToPortal = () => {
    router.push('/student/portal');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilRenewal = () => {
    if (!subscription?.renewalDate) return 0;
    const today = new Date();
    const renewalDate = new Date(subscription.renewalDate);
    const diffTime = renewalDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#10b981';
      case 'expired':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="subscription-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading subscription data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-page">
      {/* Header Section */}
      <div className="subscription-header">
        <button className="back-btn" onClick={handleBackToPortal}>
          <span className="btn-icon">←</span>
          Back to Portal
        </button>
        <div className="header-content">
          <h1>Subscription Plan</h1>
          <p>Manage your subscription and view payment details</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="subscription-content">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {subscription ? (
          <>
            {/* Current Plan Overview */}
            <div className="plan-overview-card">
              <div className="plan-header">
                <div className="plan-info">
                  <span className="plan-icon">💎</span>
                  <div>
                    <h2>{subscription.planType} Plan</h2>
                    <p className="plan-description">Full access to all premium features</p>
                  </div>
                </div>
                <div className="plan-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(subscription.status) }}
                  >
                    {subscription.status}
                  </span>
                </div>
              </div>
              
              <div className="plan-price">
                <span className="price-amount">{subscription.amount}</span>
                <span className="price-currency">{subscription.currency}</span>
                <span className="price-period">per month</span>
              </div>
            </div>

            {/* Key Information Cards */}
            <div className="info-cards-grid">
              {/* Paid Balance Card */}
              <div className="info-card balance-card">
                <div className="card-header">
                  <span className="card-icon">💰</span>
                  <h3>Subscription Fee</h3>
                </div>
                <div className="card-content">
                  <div className="balance-amount">
                    <span className="amount">{subscription.amount}</span>
                    <span className="currency">{subscription.currency}</span>
                  </div>
                  <p className="balance-description">Monthly subscription fee</p>
                </div>
              </div>

              {/* Confirmation Date Card */}
              <div className="info-card confirmation-card">
                <div className="card-header">
                  <span className="card-icon">✅</span>
                  <h3>Confirmation Date</h3>
                </div>
                <div className="card-content">
                  <div className="date-display">
                    <span className="date-value">{formatDate(subscription.confirmationDate)}</span>
                  </div>
                  <p className="date-description">When your subscription was activated</p>
                </div>
              </div>

              {/* Renewal Date Card */}
              <div className="info-card renewal-card">
                <div className="card-header">
                  <span className="card-icon">🔄</span>
                  <h3>Renewal Date</h3>
                </div>
                <div className="card-content">
                  <div className="date-display">
                    <span className="date-value">{formatDate(subscription.renewalDate)}</span>
                    <span className="days-remaining">
                      {getDaysUntilRenewal()} days remaining
                    </span>
                  </div>
                  <p className="date-description">
                    {subscription.autoRenewal ? 'Auto-renewal enabled' : 'Manual renewal required'}
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription Details */}
            <div className="subscription-details-card">
              <div className="details-header">
                <span className="details-icon">📋</span>
                <h3>Subscription Details</h3>
              </div>
              
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Plan Type</span>
                  <span className="detail-value">{subscription.planType}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">
                    <span 
                      className="status-indicator"
                      style={{ backgroundColor: getStatusColor(subscription.status) }}
                    ></span>
                    {subscription.status}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Auto-Renewal</span>
                  <span className="detail-value">
                    {subscription.autoRenewal ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Payment Method</span>
                  <span className="detail-value">{subscription.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Payment History */}
            {subscription.paymentHistory && subscription.paymentHistory.length > 0 && (
              <div className="payment-history-card">
                <div className="details-header">
                  <span className="details-icon">💳</span>
                  <h3>Payment History</h3>
                </div>
                
                <div className="payment-list">
                  {subscription.paymentHistory.map((payment, index) => (
                    <div key={index} className="payment-item">
                      <div className="payment-info">
                        <span className="payment-amount">{payment.amount} {subscription.currency}</span>
                        <span className="payment-method">{payment.method}</span>
                      </div>
                      <div className="payment-details">
                        <span className="payment-date">{formatDate(payment.paymentDate)}</span>
                        <span className={`payment-status ${payment.status}`}>{payment.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          // No subscription - show request form
          <div className="no-subscription">
            <div className="no-subscription-card">
              <div className="no-subscription-icon">📋</div>
              <h2>No Active Subscription</h2>
              <p>You don't have an active subscription yet. Request one to access transportation services.</p>
              
              <div className="subscription-plan-preview">
                <h3>Premium Plan</h3>
                <div className="plan-features">
                  <div className="feature">✅ Transportation Access</div>
                  <div className="feature">✅ QR Code Generation</div>
                  <div className="feature">✅ Attendance Tracking</div>
                  <div className="feature">✅ Priority Support</div>
                </div>
                <div className="plan-price-preview">
                  <span className="price">1000 EGP</span>
                  <span className="period">per month</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Premium Features */}
        <div className="features-card">
          <div className="features-header">
            <span className="features-icon">✨</span>
            <h3>Premium Features Included</h3>
          </div>
          
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span className="feature-text">Priority Support</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💾</span>
              <span className="feature-text">Extended Storage</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span className="feature-text">Analytics Dashboard</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📱</span>
              <span className="feature-text">Advanced QR Features</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎨</span>
              <span className="feature-text">Custom Themes</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📲</span>
              <span className="feature-text">Mobile App Access</span>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="payment-instructions-card">
          <div className="instructions-header">
            <span className="instructions-icon">💳</span>
            <h3>Payment Instructions</h3>
          </div>
          
          <div className="instructions-steps">
            <div className="step-item">
              <span className="step-number">1</span>
              <div className="step-content">
                <h4>Submit Request</h4>
                <p>Click "Request Subscription" to submit your details</p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-number">2</span>
              <div className="step-content">
                <h4>Make Payment</h4>
                <p>Pay the subscription fee in cash or by bank transfer</p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-number">3</span>
              <div className="step-content">
                <h4>Verification</h4>
                <p>Provide your email to the administrator for verification</p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-number">4</span>
              <div className="step-content">
                <h4>Activation</h4>
                <p>Administrator will activate your subscription</p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-number">5</span>
              <div className="step-content">
                <h4>Confirmation</h4>
                <p>Receive confirmation email once activated</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="btn-secondary"
            onClick={() => router.push('/student/support')}
          >
            <span className="btn-icon">🔧</span>
            Contact Support
          </button>
          
          {!subscription && (
            <button 
              className="btn-primary"
              onClick={handleRequestSubscription}
              disabled={requestingSubscription}
            >
              {requestingSubscription ? (
                <>
                  <span className="loading-spinner"></span>
                  Requesting...
                </>
              ) : (
                <>
                  <span className="btn-icon">💎</span>
                  Request Subscription
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subscription;
