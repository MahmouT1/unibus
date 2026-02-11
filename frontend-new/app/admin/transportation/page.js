'use client';

import React, { useState, useEffect } from 'react';


function TransportationManagementContent({ user, onLogout }) {
  const [transportationData, setTransportationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    routeName: '',
    firstAppointmentTime: '08:00',
    secondAppointmentTime: '14:00',
    firstAppointmentCapacity: '50',
    secondAppointmentCapacity: '50'
  });
  const [stations, setStations] = useState([
    {
      name: '',
      location: '',
      googleMapsLink: '',
      parkingInfo: '',
      capacity: '50',
      status: 'active'
    }
  ]);
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
        const result = await response.json();
        if (result.success) {
          setTransportationData(result.data);
        }
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

  const handleStationChange = (index, field, value) => {
    const updatedStations = [...stations];
    updatedStations[index][field] = value;
    setStations(updatedStations);
    if (error) setError('');
  };

  const addStation = () => {
    setStations([...stations, {
      name: '',
      location: '',
      googleMapsLink: '',
      parkingInfo: '',
      capacity: '50',
      status: 'active'
    }]);
  };

  const removeStation = (index) => {
    if (stations.length > 1) {
      const updatedStations = stations.filter((_, i) => i !== index);
      setStations(updatedStations);
    }
  };

  const validateGoogleMapsLink = (link) => {
    const googleMapsPattern = /^https:\/\/(www\.)?(maps\.google|google\.com\/maps)/i;
    return googleMapsPattern.test(link) || link.includes('goo.gl') || link.includes('maps.app.goo.gl');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    // Validate form
    if (!formData.routeName) {
      setError('Please enter a route name');
      setSubmitting(false);
      return;
    }

    // Validate stations
    for (let i = 0; i < stations.length; i++) {
      const station = stations[i];
      if (!station.name || !station.location || !station.googleMapsLink) {
        setError(`Please fill in all required fields for station ${i + 1}`);
        setSubmitting(false);
        return;
      }
      
      if (!validateGoogleMapsLink(station.googleMapsLink)) {
        setError(`Please enter a valid Google Maps link for station ${i + 1}`);
        setSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/transportation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routeName: formData.routeName,
          stations,
          firstAppointmentTime: formData.firstAppointmentTime,
          secondAppointmentTime: formData.secondAppointmentTime,
          firstAppointmentCapacity: formData.firstAppointmentCapacity,
          secondAppointmentCapacity: formData.secondAppointmentCapacity
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Transportation schedule added successfully!');
        setFormData({
          routeName: '',
          firstAppointmentTime: '08:00',
          secondAppointmentTime: '14:00',
          firstAppointmentCapacity: '50',
          secondAppointmentCapacity: '50'
        });
        setStations([{
          name: '',
          location: '',
          googleMapsLink: '',
          parkingInfo: '',
          capacity: '50',
          status: 'active'
        }]);
        setShowForm(false);
        // Refresh the data
        fetchTransportationData();
      } else {
        setError(data.message || 'Failed to add transportation schedule');
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
      const response = await fetch(`/api/transportation?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Transportation schedule deleted successfully!');
        fetchTransportationData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to delete transportation schedule');
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>🚌</div>
          <p style={{ color: '#6b7280' }}>Loading transportation data...</p>
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
          <h1 style={{ margin: '0', fontSize: '28px' }}>🚌 Transportation Management</h1>
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
              Transportation Routes
            </h2>
            <p style={{ margin: '0', color: '#6b7280' }}>
              Add and manage transportation routes with stations and schedules
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
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            <span>{showForm ? '❌' : '➕'}</span>
            {showForm ? 'Cancel' : 'Add New Route'}
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#1f2937', fontWeight: '600' }}>
              🚌 Add New Transportation Route
            </h3>
            
            <form onSubmit={handleSubmit}>
              {/* Route Information */}
              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#374151', fontWeight: '600' }}>
                  📍 Route Information
                </h4>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '16px'
                }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                      Route Name *
                    </label>
                    <input
                      type="text"
                      name="routeName"
                      value={formData.routeName}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s'
                      }}
                      placeholder="e.g., Downtown to University"
                    />
                  </div>
                </div>
              </div>

              {/* Schedule Times */}
              <div style={{
                backgroundColor: '#f0f9ff',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#374151', fontWeight: '600' }}>
                  ⏰ Schedule Times
                </h4>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                      First Appointment Time
                    </label>
                    <input
                      type="time"
                      name="firstAppointmentTime"
                      value={formData.firstAppointmentTime}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                      First Appointment Capacity
                    </label>
                    <input
                      type="number"
                      name="firstAppointmentCapacity"
                      value={formData.firstAppointmentCapacity}
                      onChange={handleInputChange}
                      min="1"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      placeholder="50"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                      Second Appointment Time
                    </label>
                    <input
                      type="time"
                      name="secondAppointmentTime"
                      value={formData.secondAppointmentTime}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                      Second Appointment Capacity
                    </label>
                    <input
                      type="number"
                      name="secondAppointmentCapacity"
                      value={formData.secondAppointmentCapacity}
                      onChange={handleInputChange}
                      min="1"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      placeholder="50"
                    />
                  </div>
                </div>
              </div>

              {/* Stations */}
              <div style={{
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: '0', fontSize: '16px', color: '#374151', fontWeight: '600' }}>
                    🏁 Stations ({stations.length})
                  </h4>
                  <button
                    type="button"
                    onClick={addStation}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                  >
                    ➕ Add Station
                  </button>
                </div>
                
                {stations.map((station, index) => (
                  <div key={index} style={{
                    backgroundColor: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px',
                    position: 'relative'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px'
                    }}>
                      <h5 style={{ margin: '0', fontSize: '14px', color: '#374151', fontWeight: '600' }}>
                        🚏 Station {index + 1}
                      </h5>
                      {stations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStation(index)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                        >
                          🗑️ Remove
                        </button>
                      )}
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px'
                    }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151', fontSize: '13px' }}>
                          Station Name *
                        </label>
                        <input
                          type="text"
                          value={station.name}
                          onChange={(e) => handleStationChange(index, 'name', e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '13px',
                            boxSizing: 'border-box'
                          }}
                          placeholder="e.g., Main Campus Gate"
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151', fontSize: '13px' }}>
                          Location *
                        </label>
                        <input
                          type="text"
                          value={station.location}
                          onChange={(e) => handleStationChange(index, 'location', e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '13px',
                            boxSizing: 'border-box'
                          }}
                          placeholder="e.g., 123 University St"
                        />
                      </div>
                      
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151', fontSize: '13px' }}>
                          Google Maps Link *
                        </label>
                        <input
                          type="url"
                          value={station.googleMapsLink}
                          onChange={(e) => handleStationChange(index, 'googleMapsLink', e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '13px',
                            boxSizing: 'border-box'
                          }}
                          placeholder="https://maps.google.com/..."
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151', fontSize: '13px' }}>
                          Parking Info
                        </label>
                        <input
                          type="text"
                          value={station.parkingInfo}
                          onChange={(e) => handleStationChange(index, 'parkingInfo', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '13px',
                            boxSizing: 'border-box'
                          }}
                          placeholder="Free parking available"
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151', fontSize: '13px' }}>
                          Capacity
                        </label>
                        <input
                          type="number"
                          value={station.capacity}
                          onChange={(e) => handleStationChange(index, 'capacity', e.target.value)}
                          min="1"
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '13px',
                            boxSizing: 'border-box'
                          }}
                          placeholder="50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '2px solid #fecaca',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>⚠️</span>
                  {error}
                </div>
              )}

              {success && (
                <div style={{
                  backgroundColor: '#f0fdf4',
                  border: '2px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>✅</span>
                  {success}
                </div>
              )}

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  ❌ Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: submitting ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {submitting ? '⏳ Adding...' : '✅ Add Transportation Route'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Transportation Data */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1f2937', fontWeight: '600' }}>
            📋 Existing Transportation Routes ({transportationData.length})
          </h3>
          
          {transportationData.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '2px dashed #d1d5db'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚌</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>No Transportation Routes</h4>
              <p style={{ margin: '0' }}>Add your first transportation route to get started!</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '20px'
            }}>
              {transportationData.map((route, index) => (
                <div key={route._id || index} style={{
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  transition: 'all 0.2s',
                  backgroundColor: '#fafafa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <h4 style={{ margin: '0', fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
                      🚌 {route.routeName}
                    </h4>
                    <button
                      onClick={() => handleDelete(route._id)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                      ⏰ <strong>Schedule:</strong>
                    </div>
                    <div style={{ fontSize: '13px', color: '#374151', marginLeft: '16px' }}>
                      • First: {route.schedule?.firstAppointment?.time} ({route.schedule?.firstAppointment?.capacity} seats)
                    </div>
                    <div style={{ fontSize: '13px', color: '#374151', marginLeft: '16px' }}>
                      • Second: {route.schedule?.secondAppointment?.time} ({route.schedule?.secondAppointment?.capacity} seats)
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                      🏁 <strong>Stations ({route.stations?.length || 0}):</strong>
                    </div>
                    {route.stations?.map((station, stationIndex) => (
                      <div key={stationIndex} style={{
                        fontSize: '13px',
                        color: '#374151',
                        marginLeft: '16px',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span>🚏</span>
                        <span>{station.name}</span>
                        {station.googleMapsLink && (
                          <a
                            href={station.googleMapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#3b82f6',
                              textDecoration: 'none',
                              fontSize: '12px'
                            }}
                          >
                            📍 Maps
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    const adminToken = localStorage.getItem('adminToken');
    
    if (userData && adminToken) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>🚌</div>
          <p style={{ color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return <TransportationManagementContent user={user} onLogout={handleLogout} />;
}