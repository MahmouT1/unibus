import { NextResponse } from 'next/server';
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
}