'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TransportationPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedTime, setSelectedTime] = useState('first');
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

  // Handle window resize for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const transportationData = {
    first: {
      time: '08:00 AM',
      stations: [
        {
          name: 'Central Station',
          location: 'Downtown Area',
          coordinates: '30.0444,31.2357',
          parking: 'Main Parking Lot A',
          capacity: 150,
          status: 'active'
        },
        {
          name: 'University Gate',
          location: 'Main Campus Entrance',
          coordinates: '30.0444,31.2357',
          parking: 'Student Parking B',
          capacity: 200,
          status: 'active'
        },
        {
          name: 'Residential Area',
          location: 'Student Housing',
          coordinates: '30.0444,31.2357',
          parking: 'Residential Parking C',
          capacity: 100,
          status: 'active'
        }
      ]
    },
    second: {
      time: '02:00 PM',
      stations: [
        {
          name: 'Central Station',
          location: 'Downtown Area',
          coordinates: '30.0444,31.2357',
          parking: 'Main Parking Lot A',
          capacity: 150,
          status: 'active'
        },
        {
          name: 'University Gate',
          location: 'Main Campus Entrance',
          coordinates: '30.0444,31.2357',
          parking: 'Student Parking B',
          capacity: 200,
          status: 'active'
        }
      ]
    }
  };

  const handleBackToPortal = () => {
    router.push('/student/portal');
  };

  const openGoogleMaps = (coordinates, stationName) => {
    const url = `https://www.google.com/maps?q=${coordinates}&z=15&t=m`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      padding: isMobile ? '16px' : '20px',
      width: '100%',
      overflowX: 'hidden'
    }}>
      {/* Header Section */}
      <div style={{ 
        marginBottom: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '16px' : '20px',
        flexWrap: isMobile ? 'wrap' : 'nowrap'
      }}>
        <button 
          onClick={handleBackToPortal}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Back to Portal
        </button>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#1f2937' }}>
            Transportation Times
          </h1>
          <p style={{ margin: '0', color: '#6b7280' }}>
            View schedules and routes for university transportation
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Time Selection */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: isMobile ? '24px' : '30px',
          marginBottom: '30px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#1f2937' }}>
            📅 Select Departure Time
          </h2>
          
          <div style={{ 
            display: 'flex', 
            gap: isMobile ? '12px' : '15px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setSelectedTime('first')}
              style={{
                padding: '12px 24px',
                backgroundColor: selectedTime === 'first' ? '#3b82f6' : '#f3f4f6',
                color: selectedTime === 'first' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              First Trip - {transportationData.first.time}
            </button>
            <button
              onClick={() => setSelectedTime('second')}
              style={{
                padding: '12px 24px',
                backgroundColor: selectedTime === 'second' ? '#3b82f6' : '#f3f4f6',
                color: selectedTime === 'second' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Second Trip - {transportationData.second.time}
            </button>
          </div>
        </div>

        {/* Stations List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#1f2937' }}>
            🚌 Available Stations - {transportationData[selectedTime].time}
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '20px' 
          }}>
            {transportationData[selectedTime].stations.map((station, index) => (
              <div key={index} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                backgroundColor: '#f9fafb'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1f2937' }}>
                    {station.name}
                  </h3>
                  <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
                    📍 {station.location}
                  </p>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Parking:</span>
                    <span style={{ color: '#6b7280' }}>{station.parking}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Capacity:</span>
                    <span style={{ color: '#6b7280' }}>{station.capacity} students</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Status:</span>
                    <span style={{ 
                      color: station.status === 'active' ? '#059669' : '#dc2626',
                      fontWeight: '500'
                    }}>
                      {station.status === 'active' ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => openGoogleMaps(station.coordinates, station.name)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  🗺️ View on Map
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          marginTop: '30px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#1f2937' }}>
            ℹ️ Important Information
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px' 
          }}>
            <div style={{
              padding: '20px',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid #bae6fd'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0369a1' }}>
                ⏰ Schedule
              </h3>
              <p style={{ margin: '0', color: '#0c4a6e', fontSize: '14px' }}>
                Buses run on schedule. Please arrive 5 minutes early to ensure you don't miss your ride.
              </p>
            </div>
            
            <div style={{
              padding: '20px',
              backgroundColor: '#f0fdf4',
              borderRadius: '8px',
              border: '1px solid #bbf7d0'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#166534' }}>
                🎫 Tickets
              </h3>
              <p style={{ margin: '0', color: '#14532d', fontSize: '14px' }}>
                Show your student ID or QR code to the driver. No additional tickets required.
              </p>
            </div>
            
            <div style={{
              padding: '20px',
              backgroundColor: '#fefce8',
              borderRadius: '8px',
              border: '1px solid #fde047'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#a16207' }}>
                📞 Support
              </h3>
              <p style={{ margin: '0', color: '#713f12', fontSize: '14px' }}>
                For transportation issues, contact support at +1 (555) 123-4567
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
