import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password, role } = await request.json();
    
    console.log('Login attempt:', { email, role });
    
    if (!email || !password || !role) {
      return NextResponse.json({
        success: false,
        message: 'All fields required'
      }, { status: 400 });
    }

    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('student-portal');
    
    let user = await db.collection('users').findOne({
      email: email.toLowerCase(),
      role: role
    });
    
    if (!user && role === 'admin') {
      user = await db.collection('admins').findOne({
        email: email.toLowerCase()
      });
      if (user) user.role = 'admin';
    }
    
    if (!user && role === 'supervisor') {
      user = await db.collection('supervisors').findOne({
        email: email.toLowerCase()
      });
      if (user) user.role = 'supervisor';
    }
    
    await client.close();
    
    let isPasswordValid = false;
    if (user) {
      if (user.password.startsWith('$2b$')) {
        isPasswordValid = await bcrypt.compare(password, user.password);
      } else {
        isPasswordValid = user.password === password;
      }
    }
    
    if (user && isPasswordValid) {
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
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}
