'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const user = JSON.parse(userData);
      // Redirect based on user role
      if (user.role === 'admin' || user.role === 'supervisor') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/portal');
      }
    } else {
      // Show portal page
      setLoading(false);
    }
  }, [router]);

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

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ 
            color: '#333', 
            marginBottom: '10px',
            fontSize: '32px',
            fontWeight: 'bold'
          }}>
            Student Portal
          </h1>
          <p style={{ color: '#666', fontSize: '18px' }}>
            Welcome to the Student Management System
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button 
            onClick={() => router.push('/login')}
            style={{ 
              padding: '15px 30px', 
              fontSize: '18px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            Login
          </button>
          <button 
            onClick={() => router.push('/signup')}
            style={{ 
              padding: '15px 30px', 
              fontSize: '18px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1e7e34'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
          >
            Sign Up
          </button>
        </div>

        <div style={{ 
          marginTop: '30px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '8px',
          color: '#666'
        }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>System Features</h3>
          <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
            <li>Student Registration with QR Code</li>
            <li>Photo Upload and Profile Management</li>
            <li>Attendance Tracking</li>
            <li>Subscription Management</li>
            <li>Transportation Schedules</li>
            <li>Support Center</li>
            <li>Admin Dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
}