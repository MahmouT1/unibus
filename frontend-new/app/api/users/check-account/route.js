import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Check if user exists
    const user = await usersCollection.findOne({ 
      email: email.toLowerCase() 
    });

    if (user) {
      return NextResponse.json({
        success: true,
        exists: true,
        message: 'Account exists',
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          emailVerified: user.emailVerified || false,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      });
    } else {
      return NextResponse.json({
        success: true,
        exists: false,
        message: 'Account does not exist'
      });
    }

  } catch (error) {
    console.error('Check account error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check account', error: error.message },
      { status: 500 }
    );
  }
}
