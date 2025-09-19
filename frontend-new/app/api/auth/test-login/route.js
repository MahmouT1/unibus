import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔍 Test login attempt for:', email);
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 });
    }

    // Simple MongoDB connection
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('student-portal');
    
    console.log('📡 Connected to database');
    
    // Search for user
    const user = await db.collection('users').findOne({
      email: email.toLowerCase()
    });
    
    console.log('👤 User found:', user ? 'YES' : 'NO');
    
    if (user) {
      console.log('📋 User details:', {
        email: user.email,
        role: user.role,
        password: user.password
      });
    }
    
    await client.close();
    
    // Check credentials
    if (user && user.password === password) {
      console.log('✅ Login successful for:', user.email, 'Role:', user.role);
      
      return NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          fullName: user.fullName || 'User',
          isActive: true
        },
        token: 'test-token-' + Date.now()
      });
    } else {
      console.log('❌ Login failed for:', email);
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }

  } catch (error) {
    console.error('💥 Test login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error: ' + error.message
    }, { status: 500 });
  }
}
