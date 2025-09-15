import React, { useState } from 'react';

const SubscriptionPaymentModal = ({ 
  isOpen, 
  onClose, 
  studentData, 
  onPaymentComplete 
}) => {
  const [formData, setFormData] = useState({
    email: studentData?.email || '',
    paymentMethod: 'Credit Card',
    amount: '', // Empty by default for manual entry
    confirmationDate: '',
    renewalDate: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Payment method options

  const paymentMethods = [
    'Credit Card',
    'Bank Transfer',
    'Cash',
    'Mobile Payment'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.amount || !formData.confirmationDate || !formData.renewalDate) {
        throw new Error('Please fill in all required fields: amount, confirmation date, and renewal date');
      }

      // Validate amount
      const paymentAmount = parseFloat(formData.amount);
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        throw new Error('Please enter a valid amount greater than 0');
      }

      // Create payment data
      const paymentData = {
        studentId: studentData.id,
        studentEmail: formData.email,
        paymentMethod: formData.paymentMethod,
        amount: paymentAmount,
        confirmationDate: formData.confirmationDate,
        renewalDate: formData.renewalDate,
        paymentDate: new Date().toISOString(),
        installmentType: paymentAmount >= 6000 ? 'full' : 'partial'
      };

      // Call API to process payment
      const response = await fetch('/api/subscription/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        throw new Error('Payment processing failed');
      }

      const result = await response.json();
      
      // Call parent callback
      onPaymentComplete(result);
      
      // Close modal
      onClose();
      
      // Show success message
      alert('Payment completed successfully!');
      
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: studentData?.email || '',
      paymentMethod: 'Credit Card',
      amount: '',
      confirmationDate: '',
      renewalDate: ''
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '32px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Subscription Payment
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Student Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                backgroundColor: '#f9fafb',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.backgroundColor = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = '#f9fafb';
              }}
              required
            />
          </div>

          {/* Payment Method */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                backgroundColor: '#f9fafb',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.backgroundColor = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = '#f9fafb';
              }}
            >
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Amount (EGP)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter amount (e.g., 2000)"
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                backgroundColor: '#f9fafb',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.backgroundColor = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = '#f9fafb';
              }}
              required
            />
            <div style={{
              marginTop: '8px',
              fontSize: '12px',
              color: '#6b7280',
              fontStyle: 'italic'
            }}>
              💡 Suggested amounts: 2000 EGP (installment) or 6000 EGP (full term)
            </div>
          </div>

          {/* Confirmation Date */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Confirmation Date
            </label>
            <input
              type="date"
              name="confirmationDate"
              value={formData.confirmationDate}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                backgroundColor: '#f9fafb',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.backgroundColor = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = '#f9fafb';
              }}
              required
            />
          </div>

          {/* Renewal Date */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Renewal Date
            </label>
            <input
              type="date"
              name="renewalDate"
              value={formData.renewalDate}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                backgroundColor: '#f9fafb',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.backgroundColor = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = '#f9fafb';
              }}
              required
            />
          </div>

          {/* Error Display */}
          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#374151',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: loading 
                  ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }
              }}
            >
              {loading ? '⏳ Processing...' : 'Complete Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionPaymentModal;
