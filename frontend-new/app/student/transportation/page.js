'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TransportationPage() {
  const [user, setUser] = useState(null);
  const [transportationData, setTransportationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  const fetchTransportationData = async () => {
    try {
      const response = await fetch('/api/transportation');
      
      if (response.ok) {
        const data = await response.json();
        setTransportationData(data);
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


  if (!user) {
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
          <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Loading...</h3>
          <p style={{ margin: '0', color: '#6b7280' }}>Please wait while we load your transportation information.</p>
        </div>
      </div>
    );
  }

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
          <p style={{ margin: '0', color: '#6b7280' }}>Please wait while we fetch the latest schedules.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: isMobile ? '16px' : '24px'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: isMobile ? '24px' : '32px',
        marginBottom: '30px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        
        {/* Back Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Back button clicked - navigating to portal');
            try {
              router.push('/student/portal');
            } catch (error) {
              console.log('Router failed, using window.location');
              window.location.href = '/student/portal';
            }
          }}
          style={{
            position: 'absolute',
            left: isMobile ? '12px' : '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            padding: isMobile ? '8px 12px' : '10px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)',
            zIndex: 10
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            e.target.style.transform = 'translateY(-50%) scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          <span style={{ fontSize: isMobile ? '14px' : '16px' }}>←</span>
          <span>{isMobile ? 'Portal' : 'Back to Portal'}</span>
        </button>

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h1 style={{ margin: '0', fontSize: isMobile ? '24px' : '28px' }}>Transportation Times & Locations</h1>
          <p style={{ margin: '5px 0 0 0', opacity: '0.9' }}>
            View bus schedules, station locations, and parking information
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {transportationData.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: isMobile ? '24px' : '30px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚌</div>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#1f2937' }}>
              No Transportation Schedules Available
            </h2>
            <p style={{ margin: '0', color: '#6b7280' }}>
              Transportation schedules will appear here once they are added by the administrator.
            </p>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: isMobile ? '24px' : '30px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#1f2937' }}>
              🚌 Available Transportation Schedules
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {transportationData.map((schedule, index) => (
                <div key={index} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: '18px', 
                      color: '#1f2937',
                      fontWeight: '600'
                    }}>
                      {schedule.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px' }}>🕒</span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{schedule.time}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px' }}>📍</span>
                      {schedule.location.startsWith('http') ? (
                        <a 
                          href={schedule.location} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            fontSize: '14px', 
                            color: '#3b82f6', 
                            textDecoration: 'underline',
                            cursor: 'pointer'
                          }}
                        >
                          View Location on Map
                        </a>
                      ) : (
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>{schedule.location}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px' }}>🅿️</span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{schedule.parking}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px' }}>👥</span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{schedule.capacity} students</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px' }}>✅</span>
                      <span style={{ fontSize: '14px', color: '#10b981', fontWeight: '500' }}>{schedule.status}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (schedule.location.startsWith('http')) {
                        window.open(schedule.location, '_blank', 'noopener,noreferrer');
                      } else {
                        alert('No map link available for this location');
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>🗺️</span>
                    View on Map
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}