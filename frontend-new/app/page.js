'use client';

import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    // Redirect to universal login after 2 seconds
    const timer = setTimeout(() => {
      window.location.href = '/login-universal';
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: 'white',
      textAlign: 'center'
    }}>
      <div>
        <div style={{
          fontSize: '64px',
          marginBottom: '20px'
        }}>
          🚌
        </div>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '20px',
          margin: 0
        }}>
          UniBus System
        </h1>
        <p style={{
          fontSize: '20px',
          marginBottom: '30px',
          opacity: 0.9
        }}>
          Student Transportation Portal
        </p>
        <div style={{
          display: 'inline-block',
          padding: '12px 24px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '25px',
          fontSize: '16px'
        }}>
          🔄 Redirecting to login...
        </div>
        
        <div style={{ marginTop: '40px' }}>
          <a 
            href="/login-universal"
            style={{
              display: 'inline-block',
              padding: '15px 30px',
              backgroundColor: 'white',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '18px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}
          >
            🚀 Go to Login
          </a>
        </div>
      </div>
    </div>
  );
}