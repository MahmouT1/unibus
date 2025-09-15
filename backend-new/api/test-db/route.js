import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import User from '../../../lib/User';

export async function GET() {
  try {
    await connectDB();
    
    // Try to find a user
    const users = await User.find({});
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount: users.length,
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        role: user.role
      }))
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    }, { status: 500 });
  }
}
