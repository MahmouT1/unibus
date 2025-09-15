import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import UserSimple from '../../../lib/UserSimple';

export async function POST(request) {
  try {
    console.log('Testing simple user creation...');
    await connectDB();
    console.log('Database connected');

    const body = await request.json();
    const { email, password } = body;

    console.log('Creating user with email:', email);

    // Create user
    const user = new UserSimple({
      email,
      password,
      role: 'student'
    });
    
    console.log('User object created, saving...');
    await user.save();
    console.log('User saved successfully:', user._id);

    return NextResponse.json({
      success: true,
      message: 'Simple user created successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Simple user creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Simple user creation failed', error: error.message },
      { status: 500 }
    );
  }
}
