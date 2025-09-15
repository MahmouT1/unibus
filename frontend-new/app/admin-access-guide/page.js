'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminAccessGuide() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        marginTop: '50px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#667eea',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)'
          }}>
            <span style={{ fontSize: '32px', color: 'white' }}>🔐</span>
          </div>
          <h1 style={{
            margin: '0 0 10px 0',
            fontSize: '32px',
            fontWeight: '700',
            color: '#2d3748',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Admin Access Guide
          </h1>
          <p style={{
            margin: '0',
            color: '#718096',
            fontSize: '18px'
          }}>
            Secure access points for administrators and supervisors
          </p>
        </div>

        {/* Access Points */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '24px',
            fontWeight: '600',
            color: '#2d3748'
          }}>
            🚪 Access Points
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {/* Admin Login */}
            <div style={{
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px',
              transition: 'all 0.3s ease',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>👑</span>
                <h3 style={{
                  margin: '0',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#2d3748'
                }}>
                  Admin Login
                </h3>
              </div>
              <p style={{
                margin: '0 0 15px 0',
                color: '#718096',
                fontSize: '14px'
              }}>
                Secure login for administrators and supervisors
              </p>
              <Link href="/admin-login" style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#667eea',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#5a67d8';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#667eea';
                e.target.style.transform = 'translateY(0)';
              }}
              >
                🔐 Access Admin Login
              </Link>
            </div>

            {/* Student Login */}
            <div style={{
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px',
              transition: 'all 0.3s ease',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>🎓</span>
                <h3 style={{
                  margin: '0',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#2d3748'
                }}>
                  Student Login
                </h3>
              </div>
              <p style={{
                margin: '0 0 15px 0',
                color: '#718096',
                fontSize: '14px'
              }}>
                Login for students and new account creation
              </p>
              <Link href="/login" style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#48bb78',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#38a169';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#48bb78';
                e.target.style.transform = 'translateY(0)';
              }}
              >
                🎓 Access Student Login
              </Link>
            </div>
          </div>
        </div>

        {/* Default Credentials */}
        <div style={{
          backgroundColor: '#e7f3ff',
          border: '1px solid #b3d9ff',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#2d3748'
          }}>
            🔑 Default Admin Credentials
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{
                margin: '0 0 10px 0',
                fontSize: '14px',
                fontWeight: '600',
                color: '#667eea'
              }}>
                👑 Administrator
              </h4>
              <p style={{ margin: '2px 0', fontSize: '12px', color: '#4a5568' }}>
                <strong>Email:</strong> admin@university.edu
              </p>
              <p style={{ margin: '2px 0', fontSize: '12px', color: '#4a5568' }}>
                <strong>Password:</strong> admin123
              </p>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{
                margin: '0 0 10px 0',
                fontSize: '14px',
                fontWeight: '600',
                color: '#667eea'
              }}>
                👨‍💼 Supervisor
              </h4>
              <p style={{ margin: '2px 0', fontSize: '12px', color: '#4a5568' }}>
                <strong>Email:</strong> supervisor1@university.edu
              </p>
              <p style={{ margin: '2px 0', fontSize: '12px', color: '#4a5568' }}>
                <strong>Password:</strong> supervisor123
              </p>
            </div>
          </div>
          
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '6px'
          }}>
            <p style={{
              margin: '0',
              fontSize: '12px',
              color: '#856404',
              fontWeight: '600'
            }}>
              ⚠️ Please change these passwords after first login!
            </p>
          </div>
        </div>

        {/* Protected Routes */}
        <div style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#2d3748'
          }}>
            🛡️ Protected Admin Routes
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '12px'
            }}>
              <strong>👑 Admin Only:</strong><br />
              /admin/dashboard<br />
              /admin/attendance<br />
              /admin/reports<br />
              /admin/subscriptions<br />
              /admin/users
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '12px'
            }}>
              <strong>👨‍💼 Supervisor/Admin:</strong><br />
              /admin/supervisor-dashboard<br />
              /admin/attendance/supervisor<br />
              /admin/reports/supervisor
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <p style={{
            margin: '0',
            color: '#718096',
            fontSize: '14px'
          }}>
            🔐 Secure authentication system with database integration
          </p>
        </div>
      </div>
    </div>
  );
}
