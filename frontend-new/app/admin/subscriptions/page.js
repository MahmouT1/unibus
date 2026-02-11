'use client';

import React, { useState, useEffect } from 'react';

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Fetching subscription data from subscriptions collection...');
      
      const response = await fetch('/api/students/subscriptions-data?admin=true');
      const data = await response.json();
      
      console.log('📊 Subscription API response:', data);

      if (data.success && data.students) {
        const subscriptionRecords = Object.values(data.students);
        setSubscriptions(subscriptionRecords);
        console.log(`✅ Loaded ${subscriptionRecords.length} subscription records`);
      } else {
        console.error('❌ Failed to fetch subscriptions:', data.message);
        setError(data.message || 'Failed to fetch subscriptions');
        setSubscriptions([]);
      }
    } catch (error) {
      console.error('❌ Error fetching subscriptions:', error);
      setError('Error connecting to server');
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'status-active';
      case 'partial': return 'status-partial';
      case 'inactive': return 'status-inactive';
      default: return 'status-inactive';
    }
  };

  const handleDelete = async (subscription) => {
    if (!subscription.studentEmail) {
      alert('Cannot delete: Missing student email');
      return;
    }

    if (window.confirm(`Are you sure you want to delete the subscription for ${subscription.studentName || subscription.studentEmail}?`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/subscription/delete/${subscription.studentEmail}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (result.success) {
          alert(`Subscription for ${subscription.studentName || subscription.studentEmail} deleted successfully!`);
          fetchSubscriptions(); // Refresh the data
        } else {
          alert(`Failed to delete subscription: ${result.message}`);
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('An error occurred while deleting the subscription');
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading subscriptions data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '30px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>💳 Subscription Management</h1>
              <p style={{ margin: '0', opacity: '0.9', fontSize: '16px' }}>
                Manage student subscription records from database
              </p>
            </div>
            <button
              onClick={fetchSubscriptions}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '2px solid #dbeafe'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ margin: '0', fontSize: '16px', color: '#1f2937' }}>Total Subscriptions</h3>
            <span style={{ fontSize: '24px' }}>💳</span>
          </div>
          <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
            {subscriptions.length}
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
            Active records in database
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '2px solid #dcfce7'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ margin: '0', fontSize: '16px', color: '#1f2937' }}>Total Revenue</h3>
            <span style={{ fontSize: '24px' }}>💰</span>
          </div>
          <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
            {formatCurrency(subscriptions.reduce((sum, sub) => sum + (sub.totalPaid || 0), 0))}
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
            Total payments received
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '2px solid #fed7aa'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ margin: '0', fontSize: '16px', color: '#1f2937' }}>Active Status</h3>
            <span style={{ fontSize: '24px' }}>✅</span>
          </div>
          <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
            {subscriptions.filter(sub => sub.status === 'active').length}
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
            Currently active subscriptions
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#1f2937' }}>
            📋 Subscription Records from Database
          </h2>
          <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
            Real subscription data from MongoDB collection
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <p style={{ margin: '0', color: '#dc2626', fontWeight: '500' }}>
              ⚠️ Error: {error}
            </p>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                  Student Name
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                  Email
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                  Status
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                  Amount Paid
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                  Confirmation Date
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                  Renewal Date
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: '16px'
                  }}>
                    {error ? '❌ Failed to load subscriptions' : '📭 No subscription records found in database'}
                  </td>
                </tr>
              ) : (
                subscriptions.map((subscription, index) => (
                  <tr key={index} style={{
                    borderBottom: '1px solid #e5e7eb',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  >
                    <td style={{ padding: '16px', fontWeight: '500', color: '#1f2937' }}>
                      {subscription.studentName || 'N/A'}
                    </td>
                    <td style={{ padding: '16px', color: '#6b7280' }}>
                      {subscription.studentEmail || 'N/A'}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: subscription.status === 'active' ? '#dcfce7' : 
                                      subscription.status === 'partial' ? '#fef3c7' : '#fef2f2',
                        color: subscription.status === 'active' ? '#166534' : 
                               subscription.status === 'partial' ? '#92400e' : '#dc2626'
                      }}>
                        {subscription.status || 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontWeight: '600', color: '#059669' }}>
                      {formatCurrency(subscription.totalPaid || 0)}
                    </td>
                    <td style={{ padding: '16px', color: '#6b7280' }}>
                      {formatDate(subscription.confirmationDate)}
                    </td>
                    <td style={{ padding: '16px', color: '#6b7280' }}>
                      {formatDate(subscription.renewalDate)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => handleDelete(subscription)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '8px',
                          borderRadius: '8px',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#fef2f2';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.transform = 'scale(1)';
                        }}
                        title={`Delete subscription for ${subscription.studentName || subscription.studentEmail}`}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}