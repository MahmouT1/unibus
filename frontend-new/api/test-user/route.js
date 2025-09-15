import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import User from '../../../lib/User';

export async function POST(request) {
  try {
    console.log('Testing user creation...');
    await connectDB();
    console.log('Database connected');

    const body = await request.json();
    const { email, password } = body;

    console.log('Creating user with email:', email);

    // Create user
    const user = new User({
      email,
      password,
      role: 'student'
    });
    
    console.log('User object created, saving...');
    await user.save();
    console.log('User saved successfully:', user._id);

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { success: false, message: 'User creation failed', error: error.message },
      { status: 500 }
    );
  }
}
