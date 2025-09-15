'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function TransportationManagementContent({ user, onLogout }) {
  const [transportationData, setTransportationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    time: '',
    location: '',
    parking: '',
    capacity: '',
    status: 'Active'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTransportationData();
  }, []);

  const fetchTransportationData = async () => {
    try {
      const response = await fetch('/api/transportation');
      if (response.ok) {
        const data = await response.json();
        setTransportationData(data);
      }
    } catch (error) {
      console.error('Error fetching transportation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/transportation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Transportation schedule added successfully!');
        setFormData({
          name: '',
          time: '',
          location: '',
          parking: '',
          capacity: '',
          status: 'Active'
        });
        setShowForm(false);
        // Refresh the data
        fetchTransportationData();
      } else {
        setError(data.error || 'Failed to add transportation schedule');
      }
    } catch (error) {
      console.error('Error adding transportation schedule:', error);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this transportation schedule?')) {
      return;
    }

    try {
      const response = await fetch(`/api/transportation/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Transportation schedule deleted successfully!');
        fetchTransportationData();
      } else {
        setError('Failed to delete transportation schedule');
      }
    } catch (error) {
      console.error('Error deleting transportation schedule:', error);
      setError('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Loading Transportation Data...</h3>
          <p style={{ margin: '0', color: '#6b7280' }}>Please wait while we fetch the schedules.</p>
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
        
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h1 style={{ margin: '0', fontSize: '28px' }}>Transportation Management</h1>
          <p style={{ margin: '5px 0 0 0', opacity: '0.9' }}>
            Manage bus schedules, station locations, and parking information
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Add New Schedule Button */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '30px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#1f2937' }}>
              Transportation Schedules
            </h2>
            <p style={{ margin: '0', color: '#6b7280' }}>
              Add and manage transportation schedules for students
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>➕</span>
            {showForm ? 'Cancel' : 'Add New Schedule'}
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1f2937' }}>
              Add New Transportation Schedule
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Schedule Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="e.g., Morning Route, Evening Route"
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Departure Time *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="e.g., Downtown Area, Main Campus Entrance"
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Parking Area *
                  </label>
                  <input
                    type="text"
                    name="parking"
                    value={formData.parking}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="e.g., Main Parking Lot A, Student Parking B"
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Capacity *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                    min="1"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="e.g., 150"
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  backgroundColor: '#fed7d7',
                  border: '1px solid #feb2b2',
                  color: '#c53030',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div style={{
                  backgroundColor: '#c6f6d5',
                  border: '1px solid #9ae6b4',
                  color: '#2f855a',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  {success}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: submitting ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Adding...' : 'Add Schedule'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Transportation Schedules List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1f2937' }}>
            Current Transportation Schedules
          </h3>
          
          {transportationData.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚌</div>
              <p>No transportation schedules found. Add your first schedule above.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {transportationData.map((schedule, index) => (
                <div key={index} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: '18px', 
                      color: '#1f2937',
                      fontWeight: '600'
                    }}>
                      {schedule.name}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px' }}>🕒</span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{schedule.time}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px' }}>📍</span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{schedule.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px' }}>🅿️</span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{schedule.parking}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px' }}>👥</span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{schedule.capacity} students</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '14px' }}>✅</span>
                      <span style={{ 
                        fontSize: '14px', 
                        color: schedule.status === 'Active' ? '#10b981' : '#f59e0b',
                        fontWeight: '500' 
                      }}>
                        {schedule.status}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(schedule._id)}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Delete Schedule
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TransportationManagement() {
  return <TransportationManagementContent />;
}
