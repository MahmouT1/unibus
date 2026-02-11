import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb.js';
import User from '../../../../lib/models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is admin or supervisor
    if (user.role !== 'admin' && user.role !== 'supervisor') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin or supervisor role required.' },
        { status: 403 }
      );
    }

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Account is inactive. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update login statistics
    await user.updateLoginStats();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        permissions: user.permissions,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Login failed',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// GET method to verify existing token
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      await connectDB();
      
      const user = await User.findById(decoded.userId);
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      if (user.status !== 'active') {
        return NextResponse.json(
          { success: false, message: 'Account is inactive' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          permissions: user.permissions,
          lastLogin: user.lastLogin
        }
      });

    } catch (tokenError) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Token verification failed',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
