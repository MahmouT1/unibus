import { NextResponse } from 'next/server';
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
}