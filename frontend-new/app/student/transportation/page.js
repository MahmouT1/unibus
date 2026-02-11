'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TransportationPage() {
  const [user, setUser] = useState(null);
  const [transportationData, setTransportationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedTime, setSelectedTime] = useState('first');
  const router = useRouter();

  const fetchTransportationData = async () => {
    try {
      const response = await fetch('/api/transportation');
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTransportationData(result.data);
        }
      } else {
        console.error('Failed to fetch transportation data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching transportation data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/auth');
      return;
    }

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Fetch transportation data
    fetchTransportationData();

    return () => window.removeEventListener('resize', checkMobile);
  }, [router]);

  const navigateBackToPortal = () => {
    router.push('/student/portal');
  };

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔐</div>
          <p style={{ color: '#6b7280' }}>Please log in to access this page</p>
        </div>
      </div>
    );
  }

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
          <p style={{ color: '#6b7280' }}>Loading transportation schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        padding: isMobile ? '20px 16px' : '32px 24px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        
        {/* Back button */}
        <button
          onClick={navigateBackToPortal}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            position: 'relative',
            zIndex: 1
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
        >
          <span>←</span>
          Back to Portal
        </button>
        
        {/* Header content */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: isMobile ? '24px' : '32px',
            fontWeight: '700'
          }}>
            🚌 Transportation Times & Locations
          </h1>
          <p style={{
            margin: '0',
            fontSize: isMobile ? '14px' : '16px',
            opacity: '0.9'
          }}>
            View bus schedules, station locations, and parking information
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '16px' : '24px'
      }}>
        {transportationData.length === 0 ? (
          /* No Data State */
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: isMobile ? '32px 16px' : '48px 32px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '2px dashed #e5e7eb'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚌</div>
            <h2 style={{
              margin: '0 0 8px 0',
              fontSize: isMobile ? '20px' : '24px',
              color: '#1f2937',
              fontWeight: '600'
            }}>
              No Transportation Schedules Available
            </h2>
            <p style={{
              margin: '0',
              color: '#6b7280',
              fontSize: isMobile ? '14px' : '16px'
            }}>
              Transportation schedules will appear here once they are added by the administrator.
            </p>
          </div>
        ) : (
          <>
            {/* Schedule Time Selector */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                color: '#1f2937',
                fontWeight: '600'
              }}>
                ⏰ Select Schedule Time
              </h3>
              
              <div style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => setSelectedTime('first')}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: selectedTime === 'first' ? '#8b5cf6' : '#f3f4f6',
                    color: selectedTime === 'first' ? 'white' : '#6b7280',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>🌅</span>
                  First Appointment
                </button>
                
                <button
                  onClick={() => setSelectedTime('second')}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: selectedTime === 'second' ? '#8b5cf6' : '#f3f4f6',
                    color: selectedTime === 'second' ? 'white' : '#6b7280',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>🌆</span>
                  Second Appointment
                </button>
              </div>
            </div>

            {/* Transportation Routes */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '24px'
            }}>
              {transportationData.map((route, routeIndex) => (
                <div key={route._id || routeIndex} style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                }}
                >
                  {/* Route Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                    paddingBottom: '16px',
                    borderBottom: '2px solid #f3f4f6'
                  }}>
                    <h3 style={{
                      margin: '0',
                      fontSize: isMobile ? '18px' : '20px',
                      color: '#1f2937',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      🚌 {route.routeName}
                    </h3>
                    
                    <div style={{
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      Active
                    </div>
                  </div>

                  {/* Schedule Info */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '20px'
                  }}>
                    <h4 style={{
                      margin: '0 0 12px 0',
                      fontSize: '14px',
                      color: '#374151',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      ⏰ {selectedTime === 'first' ? 'First' : 'Second'} Appointment Schedule
                    </h4>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>Departure Time</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                          {selectedTime === 'first' 
                            ? route.schedule?.firstAppointment?.time || '08:00 AM'
                            : route.schedule?.secondAppointment?.time || '02:00 PM'
                          }
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>Available Seats</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>
                          {selectedTime === 'first' 
                            ? route.schedule?.firstAppointment?.capacity || 50
                            : route.schedule?.secondAppointment?.capacity || 50
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stations */}
                  <div>
                    <h4 style={{
                      margin: '0 0 16px 0',
                      fontSize: '14px',
                      color: '#374151',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      🏁 Stations ({route.stations?.length || 0})
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {route.stations?.map((station, stationIndex) => (
                        <div key={stationIndex} style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '16px',
                          backgroundColor: '#fafafa',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '8px'
                          }}>
                            <div style={{ flex: 1 }}>
                              <h5 style={{
                                margin: '0 0 4px 0',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#1f2937',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                🚏 {station.name}
                              </h5>
                              
                              <p style={{
                                margin: '0 0 8px 0',
                                fontSize: '13px',
                                color: '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                📍 {station.location}
                              </p>
                              
                              {station.parkingInfo && (
                                <p style={{
                                  margin: '0 0 8px 0',
                                  fontSize: '12px',
                                  color: '#059669',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  🅿️ {station.parkingInfo}
                                </p>
                              )}
                              
                              <div style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                👥 Capacity: {station.capacity || 50} passengers
                              </div>
                            </div>
                            
                            {station.googleMapsLink && (
                              <a
                                href={station.googleMapsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  textDecoration: 'none',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  transition: 'all 0.2s',
                                  marginLeft: '12px'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                              >
                                🗺️ View on Maps
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}