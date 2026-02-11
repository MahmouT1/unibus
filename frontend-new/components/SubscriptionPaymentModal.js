'use client';

import React, { useState } from 'react';

const SubscriptionPaymentModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  studentData = {} 
}) => {
  const [formData, setFormData] = useState({
    email: studentData.email || '',
    paymentMethod: 'credit_card',
    amount: '50.00',
    subscriptionType: 'monthly',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    bankAccount: '',
    routingNumber: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const subscriptionTypes = {
    monthly: { price: '50.00', duration: '1 Month' },
    semester: { price: '180.00', duration: '6 Months' },
    yearly: { price: '360.00', duration: '12 Months' }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update amount when subscription type changes
    if (name === 'subscriptionType') {
      setFormData(prev => ({
        ...prev,
        amount: subscriptionTypes[value].price
      }));
    }
    
    // Clear errors
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    
    if (formData.paymentMethod === 'credit_card') {
      if (!formData.cardNumber) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Invalid card number format';
      }
      
      if (!formData.expiryDate) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Invalid expiry date format (MM/YY)';
      }
      
      if (!formData.cvv) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = 'Invalid CVV format';
      }
      
      if (!formData.cardholderName) {
        newErrors.cardholderName = 'Cardholder name is required';
      }
    } else if (formData.paymentMethod === 'bank_transfer') {
      if (!formData.bankAccount) {
        newErrors.bankAccount = 'Bank account number is required';
      }
      
      if (!formData.routingNumber) {
        newErrors.routingNumber = 'Routing number is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const paymentData = {
        ...formData,
        studentData,
        timestamp: new Date().toISOString(),
        subscriptionDetails: subscriptionTypes[formData.subscriptionType]
      };
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onSubmit) {
        await onSubmit(paymentData);
      }
      
      onClose();
    } catch (error) {
      console.error('Payment processing error:', error);
      setErrors({ general: 'Payment processing failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            💳 Subscription Payment
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Student Info */}
        {studentData.fullName && (
          <div style={{
            background: '#f3f4f6',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#374151' }}>
              Student Information
            </h3>
            <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
              <strong>{studentData.fullName}</strong><br />
              {studentData.email}<br />
              {studentData.college} - {studentData.grade}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Subscription Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '500',
              color: '#374151',
              fontSize: '14px'
            }}>
              Subscription Type *
            </label>
            <select
              name="subscriptionType"
              value={formData.subscriptionType}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              {Object.entries(subscriptionTypes).map(([key, value]) => (
                <option key={key} value={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)} - ${value.price} ({value.duration})
                </option>
              ))}
            </select>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '500',
              color: '#374151',
              fontSize: '14px'
            }}>
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px',
                border: `2px solid ${errors.email ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="student@example.com"
            />
            {errors.email && (
              <p style={{ margin: '4px 0 0 0', color: '#ef4444', fontSize: '12px' }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Amount */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '500',
              color: '#374151',
              fontSize: '14px'
            }}>
              Amount (USD) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '12px',
                border: `2px solid ${errors.amount ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="50.00"
            />
            {errors.amount && (
              <p style={{ margin: '4px 0 0 0', color: '#ef4444', fontSize: '12px' }}>
                {errors.amount}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '500',
              color: '#374151',
              fontSize: '14px'
            }}>
              Payment Method *
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="credit_card">Credit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          {/* Credit Card Fields */}
          {formData.paymentMethod === 'credit_card' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '500',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  Cardholder Name *
                </label>
                <input
                  type="text"
                  name="cardholderName"
                  value={formData.cardholderName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.cardholderName ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="John Doe"
                />
                {errors.cardholderName && (
                  <p style={{ margin: '4px 0 0 0', color: '#ef4444', fontSize: '12px' }}>
                    {errors.cardholderName}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '500',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  Card Number *
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.cardNumber ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                />
                {errors.cardNumber && (
                  <p style={{ margin: '4px 0 0 0', color: '#ef4444', fontSize: '12px' }}>
                    {errors.cardNumber}
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: '500',
                    color: '#374151',
                    fontSize: '14px'
                  }}>
                    Expiry Date *
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `2px solid ${errors.expiryDate ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="MM/YY"
                    maxLength="5"
                  />
                  {errors.expiryDate && (
                    <p style={{ margin: '4px 0 0 0', color: '#ef4444', fontSize: '12px' }}>
                      {errors.expiryDate}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: '500',
                    color: '#374151',
                    fontSize: '14px'
                  }}>
                    CVV *
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `2px solid ${errors.cvv ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="123"
                    maxLength="4"
                  />
                  {errors.cvv && (
                    <p style={{ margin: '4px 0 0 0', color: '#ef4444', fontSize: '12px' }}>
                      {errors.cvv}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Bank Transfer Fields */}
          {formData.paymentMethod === 'bank_transfer' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '500',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  Bank Account Number *
                </label>
                <input
                  type="text"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.bankAccount ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="1234567890"
                />
                {errors.bankAccount && (
                  <p style={{ margin: '4px 0 0 0', color: '#ef4444', fontSize: '12px' }}>
                    {errors.bankAccount}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '500',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  Routing Number *
                </label>
                <input
                  type="text"
                  name="routingNumber"
                  value={formData.routingNumber}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.routingNumber ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="123456789"
                />
                {errors.routingNumber && (
                  <p style={{ margin: '4px 0 0 0', color: '#ef4444', fontSize: '12px' }}>
                    {errors.routingNumber}
                  </p>
                )}
              </div>
            </>
          )}

          {/* General Error */}
          {errors.general && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: '0', color: '#dc2626', fontSize: '14px' }}>
                {errors.general}
              </p>
            </div>
          )}

          {/* Summary */}
          <div style={{
            background: '#f9fafb',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#374151' }}>
              Payment Summary
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Subscription Type:</span>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                {formData.subscriptionType.charAt(0).toUpperCase() + formData.subscriptionType.slice(1)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Duration:</span>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                {subscriptionTypes[formData.subscriptionType].duration}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>Total:</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>
                ${formData.amount}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              style={{
                padding: '12px 24px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.6 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              style={{
                padding: '12px 24px',
                backgroundColor: isProcessing ? '#9ca3af' : '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isProcessing ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '50%',
                    borderTopColor: 'white',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Processing...
                </>
              ) : (
                <>
                  💳 Process Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SubscriptionPaymentModal;
