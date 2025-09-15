'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SubscriptionPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [requestingSubscription, setRequestingSubscription] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setLoading(false);
  }, [router]);

  // Separate useEffect to fetch subscription when user data is available
  useEffect(() => {
    if (user && user.email) {
      fetchSubscription();
    }
  }, [user]);

  // Handle window resize for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobile);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      
      // Check if user data is available
      if (!user || !user.email) {
        console.log('User data not available yet');
        setSubscription(null);
        return;
      }
      
      // Fetch subscription data from API
      const response = await fetch(`/api/subscription/payment?studentEmail=${encodeURIComponent(user.email)}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.subscription) {
          setSubscription(data.subscription);
        } else {
          // No subscription found, set to null for empty state
          setSubscription(null);
        }
      } else {
        throw new Error('Failed to fetch subscription data');
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

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px',
        fontWeight: '500'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <div>Loading subscription data...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '0',
      width: '100%',
      overflowX: 'hidden'
    }}>
      {/* Modern Header Section */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '24px 0',
        marginBottom: '40px'
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={handleBackToPortal}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}
          >
            ← Back to Portal
          </button>
          <div>
            <h1 style={{ 
              margin: '0 0 8px 0', 
              fontSize: isMobile ? '24px' : '32px', 
              color: '#1f2937',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Subscription Management
            </h1>
            <p style={{ 
              margin: '0', 
              color: '#6b7280',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '400'
            }}>
              Manage your subscription plan and payment options
            </p>
          </div>
          <button 
            onClick={fetchSubscription}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 16px'
      }}>
        {/* Subscription Overview */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: isMobile ? '16px' : '24px',
          padding: isMobile ? '24px' : '48px',
          marginBottom: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Background Elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            borderRadius: '50%',
            zIndex: '0'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            borderRadius: '50%',
            zIndex: '0'
          }}></div>
          
          <div style={{ 
            marginBottom: '40px', 
            textAlign: 'center',
            position: 'relative',
            zIndex: '1'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              marginBottom: '20px',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
            }}>
              <span style={{ fontSize: '36px' }}>🚀</span>
            </div>
            <h2 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '28px', 
              color: '#1f2937', 
              fontWeight: '700',
              letterSpacing: '-0.5px'
            }}>
              Your Subscription Plan
            </h2>
            <p style={{ 
              margin: '0', 
              color: '#6b7280', 
              fontSize: '18px',
              fontWeight: '400',
              maxWidth: '500px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Manage your subscription details and payment information
            </p>
            
            {/* Subscription Status */}
            {subscription && (
              <div style={{
                marginTop: '20px',
                padding: '12px 24px',
                borderRadius: '12px',
                display: 'inline-block',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: subscription.status === 'active' 
                  ? 'rgba(16, 185, 129, 0.1)' 
                  : subscription.status === 'partial' 
                    ? 'rgba(245, 158, 11, 0.1)' 
                    : 'rgba(239, 68, 68, 0.1)',
                color: subscription.status === 'active' 
                  ? '#059669' 
                  : subscription.status === 'partial' 
                    ? '#d97706' 
                    : '#dc2626',
                border: `1px solid ${subscription.status === 'active' 
                  ? 'rgba(16, 185, 129, 0.2)' 
                  : subscription.status === 'partial' 
                    ? 'rgba(245, 158, 11, 0.2)' 
                    : 'rgba(239, 68, 68, 0.2)'}`
              }}>
                Status: {subscription.status === 'active' ? '✅ Active' : subscription.status === 'partial' ? '⚠️ Partial Payment' : '❌ Inactive'}
                {subscription.totalPayments > 0 && (
                  <span style={{ marginLeft: '12px' }}>
                    ({subscription.totalPayments} payment{subscription.totalPayments > 1 ? 's' : ''})
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Three Main Sections */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: isMobile ? '20px' : '32px',
            marginBottom: '40px',
            position: 'relative',
            zIndex: '1'
          }}>
            {/* Paid Balance */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
              borderRadius: isMobile ? '16px' : '20px',
              padding: isMobile ? '24px' : '32px',
              border: '1px solid rgba(5, 150, 105, 0.2)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(5, 150, 105, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                borderRadius: '50%'
              }}></div>
              <div style={{ 
                fontSize: isMobile ? '36px' : '48px', 
                marginBottom: '16px',
                color: '#059669',
                filter: 'drop-shadow(0 4px 8px rgba(5, 150, 105, 0.3))'
              }}>
                💰
              </div>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: isMobile ? '18px' : '20px', 
                color: '#1f2937',
                fontWeight: '700',
                letterSpacing: '-0.3px'
              }}>
                Paid Balance
              </h3>
              <div style={{ 
                fontSize: isMobile ? '28px' : '36px', 
                fontWeight: '800', 
                color: '#059669',
                marginBottom: '12px',
                textShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'
              }}>
                {subscription ? `${subscription.totalPaid} EGP` : '0 EGP'}
              </div>
              <p style={{ 
                margin: '0', 
                fontSize: isMobile ? '14px' : '15px', 
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Total amount paid
              </p>
            </div>

            {/* Subscription Confirmation Date */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
                borderRadius: '50%'
              }}></div>
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '16px',
                color: '#3b82f6',
                filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3))'
              }}>
                ✅
              </div>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '20px', 
                color: '#1f2937',
                fontWeight: '700',
                letterSpacing: '-0.3px'
              }}>
                Confirmation Date
              </h3>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#1f2937',
                marginBottom: '12px',
                minHeight: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {subscription && subscription.confirmationDate ? formatDate(subscription.confirmationDate) : 'Not confirmed'}
              </div>
              <p style={{ 
                margin: '0', 
                fontSize: '15px', 
                color: '#6b7280',
                fontWeight: '500'
              }}>
                When subscription was confirmed
              </p>
            </div>

            {/* Renewal Date */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(245, 158, 11, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
                borderRadius: '50%'
              }}></div>
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '16px',
                color: '#f59e0b',
                filter: 'drop-shadow(0 4px 8px rgba(245, 158, 11, 0.3))'
              }}>
                🔄
              </div>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '20px', 
                color: '#1f2937',
                fontWeight: '700',
                letterSpacing: '-0.3px'
              }}>
                Renewal Date
              </h3>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#1f2937',
                marginBottom: '12px',
                minHeight: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {subscription && subscription.renewalDate ? formatDate(subscription.renewalDate) : 'Not set'}
              </div>
              <p style={{ 
                margin: '0', 
                fontSize: '15px', 
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Next subscription renewal
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '16px',
              color: '#dc2626',
              marginBottom: '32px',
              textAlign: 'center',
              position: 'relative',
              zIndex: '1'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
              <div style={{ fontWeight: '600', fontSize: '16px' }}>{error}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: isMobile ? '12px' : '20px', 
            justifyContent: 'center',
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: '1',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <button 
              onClick={() => router.push('/student/support')}
              style={{
                padding: isMobile ? '14px 24px' : '16px 32px',
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 24px rgba(107, 114, 128, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: isMobile ? '100%' : 'auto'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(107, 114, 128, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(107, 114, 128, 0.3)';
              }}
            >
              🔧 Contact Support
            </button>
            
            <button 
              onClick={handleRequestSubscription}
              disabled={requestingSubscription}
              style={{
                padding: isMobile ? '14px 24px' : '16px 32px',
                background: requestingSubscription 
                  ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: '600',
                cursor: requestingSubscription ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: requestingSubscription 
                  ? '0 4px 12px rgba(156, 163, 175, 0.3)' 
                  : '0 8px 24px rgba(102, 126, 234, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: isMobile ? '100%' : 'auto'
              }}
              onMouseOver={(e) => {
                if (!requestingSubscription) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!requestingSubscription) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.3)';
                }
              }}
            >
              {requestingSubscription ? '⏳ Processing...' : '💎 Request Subscription'}
            </button>
          </div>
        </div>

        {/* Backend Development Note */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '32px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Background */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            left: '-30px',
            width: '120px',
            height: '120px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)',
            borderRadius: '50%'
          }}></div>
          
          <div style={{ position: 'relative', zIndex: '1' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '16px',
              marginBottom: '20px',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
            }}>
              <span style={{ fontSize: '24px' }}>🔧</span>
            </div>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '22px', 
              color: '#1f2937',
              fontWeight: '700',
              letterSpacing: '-0.3px'
            }}>
              Backend Development Ready
            </h3>
            <p style={{ 
              margin: '0', 
              fontSize: '16px', 
              color: '#6b7280',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              This page is ready for backend integration. Replace the TODO comments with actual API calls to fetch:
              <br />
              <span style={{ fontWeight: '600', color: '#374151' }}>
                • Paid balance amount • Subscription confirmation date • Renewal date
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
