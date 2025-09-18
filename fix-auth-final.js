/**
 * Final Auth Fix Script - Complete Solution
 */

const fs = require('fs');

console.log('🔧 FIXING AUTH SYSTEM COMPLETELY...');

// 1. Create simple working MongoDB connection
const mongoConnection = `import { MongoClient } from 'mongodb';

let client = null;
let db = null;

export async function getDatabase() {
  try {
    if (!db) {
      client = new MongoClient('mongodb://localhost:27017');
      await client.connect();
      db = client.db('student-portal');
      console.log('✅ MongoDB connected');
    }
    return db;
  } catch (error) {
    console.error('❌ MongoDB error:', error);
    throw error;
  }
}

export default getDatabase;`;

// 2. Create working admin-login API
const adminLoginAPI = `import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/simple-db.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, role } = body;
    
    console.log('🔍 Login attempt:', { email, role, password });
    
    if (!email || !password || !role) {
      return NextResponse.json({
        success: false,
        message: 'All fields required'
      }, { status: 400 });
    }

    // Connect to database
    const db = await getDatabase();
    console.log('📡 Database connected');
    
    // Search for user
    const user = await db.collection('users').findOne({
      email: email.toLowerCase(),
      role: role.toLowerCase()
    });
    
    console.log('👤 User search result:', user ? 'FOUND' : 'NOT FOUND');
    
    if (user) {
      console.log('📋 User details:', {
        email: user.email,
        role: user.role,
        hasPassword: !!user.password,
        isActive: user.isActive
      });
    }
    
    // Check password
    if (user && user.password === password) {
      console.log('✅ Password correct - Login successful');
      
      const token = 'auth-' + Date.now() + '-' + user.role;
      
      return NextResponse.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          fullName: user.fullName || 'User',
          isActive: true
        }
      });
    } else {
      console.log('❌ Login failed - Invalid credentials');
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }

  } catch (error) {
    console.error('💥 Login API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error: ' + error.message
    }, { status: 500 });
  }
}`;

// 3. Create simple login page that works
const loginPage = `'use client';

import { useState } from 'react';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@unibus.local');
  const [password, setPassword] = useState('123456');
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    console.log('🔄 Attempting login:', { email, role });

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📋 Response data:', data);

      if (data.success) {
        console.log('✅ Login successful, saving data...');
        
        // Save user data
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        localStorage.setItem('adminToken', data.token);
        
        setMessage('✅ تم تسجيل الدخول بنجاح! جاري التوجيه...');
        
        // Redirect based on role
        setTimeout(() => {
          if (data.user.role === 'admin') {
            console.log('🎯 Redirecting to admin dashboard');
            window.location.href = '/admin/dashboard';
          } else if (data.user.role === 'supervisor') {
            console.log('👨‍💼 Redirecting to supervisor dashboard');
            window.location.href = '/admin/supervisor-dashboard';
          }
        }, 1000);
      } else {
        console.log('❌ Login failed:', data.message);
        setMessage('❌ ' + data.message);
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      setMessage('❌ خطأ في الاتصال: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '450px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        margin: '20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🚌 UniBus System
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Admin & Supervisor Login
          </p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
              required
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>
              Account Type
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box'
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
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '18px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxSizing: 'border-box'
            }}
          >
            {loading ? '🔄 Logging in...' : '🚀 Sign In'}
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: message.includes('✅') ? '#dcfce7' : '#fef2f2',
            border: message.includes('✅') ? '2px solid #bbf7d0' : '2px solid #fecaca',
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
          borderRadius: '12px',
          fontSize: '13px',
          color: '#6b7280'
        }}>
          <p style={{ margin: '0 0 12px 0', fontWeight: '600', color: '#374151' }}>Test Accounts:</p>
          <div style={{ display: 'grid', gap: '8px' }}>
            <p style={{ margin: '0', padding: '8px', backgroundColor: '#e0f2fe', borderRadius: '6px' }}>
              <strong>Admin:</strong> admin@unibus.local / 123456
            </p>
            <p style={{ margin: '0', padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '6px' }}>
              <strong>Supervisor:</strong> supervisor@unibus.local / 123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}`;

// 4. Create database seeding script
const seedScript = `const { MongoClient } = require('mongodb');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('student-portal');
    
    // Clear existing admin/supervisor accounts
    await db.collection('users').deleteMany({ role: { $in: ['admin', 'supervisor'] } });
    
    // Create fresh admin account
    await db.collection('users').insertOne({
      email: 'admin@unibus.local',
      password: '123456',
      role: 'admin',
      fullName: 'System Administrator',
      isActive: true,
      createdAt: new Date()
    });
    
    // Create fresh supervisor account
    await db.collection('users').insertOne({
      email: 'supervisor@unibus.local',
      password: '123456',
      role: 'supervisor', 
      fullName: 'System Supervisor',
      isActive: true,
      createdAt: new Date()
    });
    
    // Verify accounts
    const adminUser = await db.collection('users').findOne({ email: 'admin@unibus.local' });
    const supervisorUser = await db.collection('users').findOne({ email: 'supervisor@unibus.local' });
    
    console.log('✅ Admin account:', adminUser ? 'CREATED' : 'FAILED');
    console.log('✅ Supervisor account:', supervisorUser ? 'CREATED' : 'FAILED');
    
    await client.close();
    console.log('🎉 Database seeding completed!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seedDatabase();`;

// Create directories
const dirs = [
  'frontend-new/lib',
  'frontend-new/app/api/auth/admin-login',
  'frontend-new/app/admin-login-fixed',
  'frontend-new/scripts'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log('✅ Created directory:', dir);
  }
});

// Write files
fs.writeFileSync('frontend-new/lib/simple-db.js', mongoConnection);
console.log('✅ Created: Simple MongoDB connection');

fs.writeFileSync('frontend-new/app/api/auth/admin-login/route.js', adminLoginAPI);
console.log('✅ Created: Fixed admin-login API');

fs.writeFileSync('frontend-new/app/admin-login-fixed/page.js', loginPage);
console.log('✅ Created: Fixed login page');

fs.writeFileSync('frontend-new/scripts/seed-auth-accounts.js', seedScript);
console.log('✅ Created: Database seeding script');

console.log('\n🎉 AUTH FIX COMPLETED!');
console.log('\n📋 DEPLOYMENT STEPS:');
console.log('1. Upload to VPS: git add . && git commit -m "Fix auth" && git push');
console.log('2. On VPS: git pull origin main');
console.log('3. On VPS: cd frontend-new && node scripts/seed-auth-accounts.js');
console.log('4. On VPS: npm run dev -- --hostname 0.0.0.0 --port 3000');
console.log('5. Test: http://72.60.185.100:3000/admin-login-fixed');
console.log('\n🔑 ACCOUNTS:');
console.log('Admin: admin@unibus.local / 123456');
console.log('Supervisor: supervisor@unibus.local / 123456');
