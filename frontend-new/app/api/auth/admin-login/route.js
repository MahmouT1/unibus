import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-simple-connection';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { email, password, role } = await request.json();
    
    // Validate input
    if (!email || !password || !role) {
      return NextResponse.json({
        success: false,
        message: 'Email, password, and role are required'
      }, { status: 400 });
    }

    // Validate role
    if (!['admin', 'supervisor'].includes(role)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid role. Must be admin or supervisor'
      }, { status: 400 });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Find user in the users collection based on role
    let user;
    if (role === 'admin') {
      user = await db.collection('users').findOne({ 
        email: email.toLowerCase(),
        role: { $in: ['admin', 'Admin', 'ADMIN'] },
        isActive: true
      });
    } else if (role === 'supervisor') {
      user = await db.collection('users').findOne({ 
        email: email.toLowerCase(),
        role: { $in: ['supervisor', 'Supervisor', 'SUPERVISOR'] },
        isActive: true
      });
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }

    // Check if user is active
    if (user.status && user.status !== 'active') {
      return NextResponse.json({
        success: false,
        message: 'Account is deactivated. Please contact system administrator'
      }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role || role,
        name: user.name || user.fullName
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Update last login (update in the collection where the user was found)
    await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastLogin: new Date(),
          lastLoginIP: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        }
      }
    );

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name || user.fullName,
        role: user.role || role,
        permissions: user.permissions || [],
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error. Please try again later.'
    }, { status: 500 });
  }
}
