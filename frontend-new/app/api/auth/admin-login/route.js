import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password, role } = await request.json();
    
    console.log('🔍 ORIGINAL Login attempt:', { email, role });
    
    if (!email || !password || !role) {
      return NextResponse.json({
        success: false,
        message: 'Email, password, and role are required'
      }, { status: 400 });
    }

    // Simple, direct MongoDB connection
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('student-portal');
    console.log('📡 Database connected');
    
    // Search for user in multiple collections
    let user = await db.collection('users').findOne({
      email: email.toLowerCase(),
      role: role
    });
    
    // Also check admins collection for backward compatibility
    if (!user && role === 'admin') {
      user = await db.collection('admins').findOne({
        email: email.toLowerCase()
      });
      if (user) user.role = 'admin';
    }
    
    // Also check supervisors collection
    if (!user && role === 'supervisor') {
      user = await db.collection('supervisors').findOne({
        email: email.toLowerCase()
      });
      if (user) user.role = 'supervisor';
    }
    
    await client.close();
    
    console.log('👤 User search result:', user ? 'FOUND' : 'NOT FOUND');
    
    if (user) {
      console.log('📋 User details:', {
        email: user.email,
        role: user.role,
        hasPassword: !!user.password,
        isActive: user.isActive
      });
    }
    
    // Check password (handle both plain text and hashed passwords)
    let isPasswordValid = false;
    
    if (user) {
      if (user.password.startsWith('$2b$')) {
        // Hashed password - use bcrypt
        isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('🔐 Checking hashed password:', isPasswordValid ? 'MATCH' : 'NO MATCH');
      } else {
        // Plain text password
        isPasswordValid = user.password === password;
        console.log('📝 Checking plain password:', isPasswordValid ? 'MATCH' : 'NO MATCH');
      }
    }
    
    if (user && isPasswordValid) {
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
}