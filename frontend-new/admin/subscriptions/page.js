'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshMessage, setRefreshMessage] = useState('');

  const getSubscriptionStatus = (subscription) => {
    if (!subscription || !subscription.renewalDate) return 'inactive';
    
    const renewalDate = new Date(subscription.renewalDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (renewalDate < today) {
      return 'expired';
    } else if (subscription.totalPaid >= 6000) {
      return 'active';
    } else if (subscription.totalPaid > 0) {
      return 'partial';
    } else {
      return 'inactive';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'partial': return '#f59e0b';
      case 'expired': return '#ef4444';
      case 'inactive': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'partial': return 'Partial';
      case 'expired': return 'Expired';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (showMessage = false) => {
    try {
      setLoading(true);
      const subscriptionsResponse = await fetch('/api/subscription/payment?admin=true');
      const subscriptionsResult = await subscriptionsResponse.json();
      const studentsResponse = await fetch('/api/students/profile-simple?admin=true');
      const studentsResult = await studentsResponse.json();

      if (subscriptionsResult.success) {
        setSubscriptions(subscriptionsResult.subscriptions || []);
      } else {
        console.error('Failed to fetch subscriptions:', subscriptionsResult.message);
        setSubscriptions([]);
      }

      if (studentsResult.success) {
        const studentsArray = studentsResult.students ? Object.values(studentsResult.students) : [];
        const validStudents = studentsArray.filter(student => student && student.email);
        setStudents(validStudents);
      } else {
        console.error('Failed to fetch students:', studentsResult.message);
        setStudents([]);
      }

      if (showMessage) {
        setRefreshMessage('Data refreshed successfully!');
        setTimeout(() => setRefreshMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setSubscriptions([]);
      setStudents([]);
      if (showMessage) {
        setRefreshMessage('Failed to refresh data');
        setTimeout(() => setRefreshMessage(''), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const combinedData = students.map(student => {
    const subscription = subscriptions.find(sub =>
      sub.studentEmail && student.email &&
      sub.studentEmail.toLowerCase() === student.email.toLowerCase()
    );
    const status = getSubscriptionStatus(subscription);
    return {
      ...student,
      totalPaid: subscription?.totalPaid || 0,
      subscriptionStatus: status,
      confirmationDate: subscription?.confirmationDate || null,
      renewalDate: subscription?.renewalDate || null,
      lastPaymentDate: subscription?.lastPaymentDate || null,
      payments: subscription?.payments || []
    };
  });

  const filteredData = combinedData.filter(item => {
    if (!item.email) {
      return false;
    }
    const matchesSearch = searchTerm === '' ||
      (item.fullName && item.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.studentId && item.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || item.subscriptionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedData = filteredData.sort((a, b) => {
    const statusPriority = { 'expired': 0, 'partial': 1, 'active': 2, 'inactive': 3 };
    const aPriority = statusPriority[a.subscriptionStatus] || 3;
    const bPriority = statusPriority[b.subscriptionStatus] || 3;
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    const aName = (a.fullName || a.email || '').toLowerCase();
    const bName = (b.fullName || b.email || '').toLowerCase();
    return aName.localeCompare(bName);
  });

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ margin: '0', color: '#6b7280', fontSize: '16px' }}>
            Loading subscription data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <h1 style={{
              margin: '0 0 8px 0',
              fontSize: '28px',
              fontWeight: '700',
              color: '#111827'
            }}>
              Subscription Management
            </h1>
            <p style={{
              margin: '0',
              color: '#6b7280',
              fontSize: '16px'
            }}>
              Manage student subscriptions and track payments
            </p>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={loading}
            style={{
              padding: '12px 20px',
              backgroundColor: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#2563eb';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#3b82f6';
              }
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Loading...
              </>
            ) : (
              <>
                🔄 Refresh Data
              </>
            )}
          </button>
        </div>

        {/* Refresh Message */}
        {refreshMessage && (
          <div style={{
            background: refreshMessage.includes('successfully') ? '#f0f9ff' : '#fef2f2',
            border: `1px solid ${refreshMessage.includes('successfully') ? '#0ea5e9' : '#f87171'}`,
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '24px',
            color: refreshMessage.includes('successfully') ? '#0369a1' : '#dc2626',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {refreshMessage.includes('successfully') ? '✅' : '❌'} {refreshMessage}
          </div>
        )}

        {/* Controls */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            {/* Search */}
            <div style={{ flex: '1', minWidth: '300px' }}>
              <input
                type="text"
                placeholder="Search by name, email, or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  cursor: 'pointer',
                  minWidth: '150px',
                  background: 'white'
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="partial">Partial</option>
                <option value="expired">Expired</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Stats */}
            <div style={{
              background: '#f3f4f6',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Total: {sortedData.length}
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          {sortedData.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                No students found
              </h3>
              <p style={{ margin: '0', fontSize: '14px' }}>
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No students have been registered yet'
                }
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '14px',
                      borderBottom: '1px solid #e5e7eb'
                    }}>Student</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '14px',
                      borderBottom: '1px solid #e5e7eb'
                    }}>Email</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '14px',
                      borderBottom: '1px solid #e5e7eb'
                    }}>Student ID</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'right',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '14px',
                      borderBottom: '1px solid #e5e7eb'
                    }}>Total Paid</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '14px',
                      borderBottom: '1px solid #e5e7eb'
                    }}>Status</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '14px',
                      borderBottom: '1px solid #e5e7eb'
                    }}>Renewal Date</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '14px',
                      borderBottom: '1px solid #e5e7eb'
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((student, index) => (
                    <tr key={student.email || index} style={{
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = 'transparent'}>
                      <td style={{
                        padding: '16px',
                        fontWeight: '500',
                        color: '#111827'
                      }}>
                        {student.fullName || 'N/A'}
                      </td>
                      <td style={{
                        padding: '16px',
                        color: '#6b7280',
                        fontSize: '14px'
                      }}>
                        {student.email || 'N/A'}
                      </td>
                      <td style={{
                        padding: '16px',
                        color: '#6b7280',
                        fontFamily: 'monospace',
                        fontSize: '14px'
                      }}>
                        {student.studentId || 'N/A'}
                      </td>
                      <td style={{
                        padding: '16px',
                        textAlign: 'right',
                        fontWeight: '600',
                        color: student.totalPaid > 0 ? '#059669' : '#6b7280'
                      }}>
                        {formatCurrency(student.totalPaid)}
                      </td>
                      <td style={{
                        padding: '16px',
                        textAlign: 'center'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: getStatusColor(student.subscriptionStatus) + '20',
                          color: getStatusColor(student.subscriptionStatus)
                        }}>
                          {getStatusText(student.subscriptionStatus)}
                        </span>
                      </td>
                      <td style={{
                        padding: '16px',
                        textAlign: 'center',
                        color: '#6b7280',
                        fontSize: '14px'
                      }}>
                        {formatDate(student.renewalDate)}
                      </td>
                      <td style={{
                        padding: '16px',
                        textAlign: 'center'
                      }}>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to delete the subscription for ${student.fullName || student.email}?`)) {
                              try {
                                const token = localStorage.getItem('token');
                                const response = await fetch(`/api/subscription/delete/${student.email}`, {
                                  method: 'DELETE',
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                  }
                                });

                                const result = await response.json();

                                if (result.success) {
                                  alert(`Subscription for ${student.fullName || student.email} deleted successfully!`);
                                  // Refresh the data
                                  fetchData(true);
                                } else {
                                  alert(`Failed to delete subscription: ${result.message}`);
                                }
                              } catch (error) {
                                console.error('Delete error:', error);
                                alert('An error occurred while deleting the subscription');
                              }
                            }
                          }}
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
                            fontSize: '18px'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#fef2f2';
                            e.target.style.transform = 'scale(1.1)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.transform = 'scale(1)';
                          }}
                          title={`Delete subscription for ${student.fullName || student.email}`}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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