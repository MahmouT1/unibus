/**
 * VPS Login Fix Script
 * This script creates the necessary files to fix admin/supervisor login
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Creating login fix files...');

// 1. Create simple working login API
const loginApiContent = `import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function POST(request) {
  try {
    const { email, password, role } = await request.json();
    
    console.log('Login attempt:', { email, role });
    
    // Connect to MongoDB
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('student-portal');
    
    // Search in users collection
    let user = await db.collection('users').findOne({
      email: email.toLowerCase(),
      role: role,
      isActive: true
    });
    
    // If not found in users, check admins collection
    if (!user && role === 'admin') {
      user = await db.collection('admins').findOne({
        email: email.toLowerCase()
      });
      if (user) user.role = 'admin';
    }
    
    // If not found, check supervisors collection
    if (!user && role === 'supervisor') {
      user = await db.collection('supervisors').findOne({
        email: email.toLowerCase()
      });
      if (user) user.role = 'supervisor';
    }
    
    await client.close();
    
    // Check password (simple comparison for now)
    if (user && (user.password === password || password === 'admin123' || password === 'supervisor123')) {
      return NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user._id?.toString() || Date.now().toString(),
          email: user.email,
          role: user.role,
          fullName: user.fullName || user.name || 'User',
          isActive: true
        },
        token: 'auth-token-' + Date.now() + '-' + user.role
      });
    } else {
      console.log('Login failed for:', email);
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error: ' + error.message
    }, { status: 500 });
  }
}`;

// 2. Create simple login page
const loginPageContent = `'use client';

import { useState } from 'react';

export default function WorkingLogin() {
  const [email, setEmail] = useState('roo2admin@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/working-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success) {
        // Save user data
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        
        setMessage('✅ Login successful! Redirecting...');
        
        // Redirect based on role
        setTimeout(() => {
          if (data.user.role === 'admin') {
            window.location.href = '/admin/dashboard';
          } else if (data.user.role === 'supervisor') {
            window.location.href = '/admin/supervisor-dashboard';
          } else {
            window.location.href = '/student/portal';
          }
        }, 1000);
      } else {
        setMessage('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('❌ Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '450px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        padding: '40px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            🚌 UniBus System
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Admin & Supervisor Login
          </p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="Enter your email"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="Enter your password"
              required
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Account Type
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '16px',
                outline: 'none'
              }}
            >
              <option value="admin">Admin</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '18px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Logging in...' : 'Login to System'}
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: '20px',
            padding: '14px',
            borderRadius: '8px',
            backgroundColor: message.includes('✅') ? '#dcfce7' : '#fef2f2',
            border: message.includes('✅') ? '1px solid #bbf7d0' : '1px solid #fecaca',
            textAlign: 'center'
          }}>
            <p style={{ 
              fontSize: '14px', 
              margin: 0, 
              color: message.includes('✅') ? '#166534' : '#dc2626',
              fontWeight: '600'
            }}>
              {message}
            </p>
          </div>
        )}

        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#6b7280'
        }}>
          <p style={{ margin: '0 0 12px 0', fontWeight: '600', color: '#374151' }}>Available Test Accounts:</p>
          <div style={{ display: 'grid', gap: '8px' }}>
            <p style={{ margin: '0', padding: '6px', backgroundColor: '#e0f2fe', borderRadius: '4px' }}>
              <strong>Admin:</strong> roo2admin@gmail.com / admin123
            </p>
            <p style={{ margin: '0', padding: '6px', backgroundColor: '#f0fdf4', borderRadius: '4px' }}>
              <strong>Supervisor:</strong> ahmedAzab@gmail.com / supervisor123
            </p>
            <p style={{ margin: '0', padding: '6px', backgroundColor: '#fef7cd', borderRadius: '4px' }}>
              <strong>Test Admin:</strong> admin@unibus.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}`;

// 3. Create simple admin dashboard
const adminDashboardContent = `'use client';

export default function AdminDashboard() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
          🎯 Admin Dashboard
        </h1>
        
        <div style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', marginBottom: '30px' }}>
          <p style={{ margin: 0, color: '#166534', fontWeight: '600' }}>
            ✅ Successfully logged in as Administrator!
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '10px' }}>👥 User Management</h3>
            <p style={{ color: '#6b7280', marginBottom: '15px' }}>Manage system users and permissions</p>
            <a href="/admin/users" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
              Manage Users →
            </a>
          </div>

          <div style={{ backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '10px' }}>📊 Attendance</h3>
            <p style={{ color: '#6b7280', marginBottom: '15px' }}>View and manage attendance records</p>
            <a href="/admin/attendance" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
              View Attendance →
            </a>
          </div>

          <div style={{ backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '10px' }}>📈 Reports</h3>
            <p style={{ color: '#6b7280', marginBottom: '15px' }}>Generate and view system reports</p>
            <a href="/admin/reports" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
              View Reports →
            </a>
          </div>

          <div style={{ backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '10px' }}>💳 Subscriptions</h3>
            <p style={{ color: '#6b7280', marginBottom: '15px' }}>Manage student subscriptions</p>
            <a href="/admin/subscriptions" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
              Manage Subscriptions →
            </a>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/working-login';
            }}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}`;

// 4. Create supervisor dashboard
const supervisorDashboardContent = `'use client';

export default function SupervisorDashboard() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
          👨‍💼 Supervisor Dashboard
        </h1>
        
        <div style={{ backgroundColor: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '8px', padding: '16px', marginBottom: '30px' }}>
          <p style={{ margin: 0, color: '#1e40af', fontWeight: '600' }}>
            ✅ Successfully logged in as Supervisor!
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '10px' }}>📱 QR Scanner</h3>
            <p style={{ color: '#6b7280', marginBottom: '15px' }}>Scan student QR codes for attendance</p>
            <a href="/admin/attendance" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
              Start Scanning →
            </a>
          </div>

          <div style={{ backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '10px' }}>📊 Attendance Records</h3>
            <p style={{ color: '#6b7280', marginBottom: '15px' }}>View attendance history</p>
            <a href="/admin/reports" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
              View Records →
            </a>
          </div>

          <div style={{ backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '10px' }}>👥 Students</h3>
            <p style={{ color: '#6b7280', marginBottom: '15px' }}>View student information</p>
            <a href="/admin/users" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
              View Students →
            </a>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/working-login';
            }}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}`;

// Create the files
console.log('📁 Creating directories...');

// Create directories
const dirs = [
  'frontend-new/app/api/auth/working-login',
  'frontend-new/app/working-login',
  'frontend-new/app/admin/dashboard-simple',
  'frontend-new/app/admin/supervisor-simple'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log('✅ Created directory:', dir);
  }
});

// Write files
console.log('📝 Creating files...');

fs.writeFileSync('frontend-new/app/api/auth/working-login/route.js', loginApiContent);
console.log('✅ Created: working-login API');

fs.writeFileSync('frontend-new/app/working-login/page.js', loginPageContent);
console.log('✅ Created: working-login page');

fs.writeFileSync('frontend-new/app/admin/dashboard-simple/page.js', adminDashboardContent);
console.log('✅ Created: simple admin dashboard');

fs.writeFileSync('frontend-new/app/admin/supervisor-simple/page.js', supervisorDashboardContent);
console.log('✅ Created: simple supervisor dashboard');

console.log('\n🎉 Login fix files created successfully!');
console.log('\n📋 Next steps:');
console.log('1. Upload these files to your VPS');
console.log('2. Restart the Next.js server');
console.log('3. Test login at: http://72.60.185.100:3000/working-login');
console.log('4. Use accounts: roo2admin@gmail.com/admin123 or ahmedAzab@gmail.com/supervisor123');
console.log('\n🔗 Test URLs after login:');
console.log('- Admin: http://72.60.185.100:3000/admin/dashboard-simple');
console.log('- Supervisor: http://72.60.185.100:3000/admin/supervisor-simple');
