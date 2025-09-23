import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search');

    // Connect to database
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Build query
    let query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.fullName': { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const totalUsers = await usersCollection.countDocuments(query);

    // Get users with pagination
    const users = await usersCollection
      .find(query)
      .select({ password: 0, emailVerificationToken: 0, passwordResetToken: 0 })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Format users data
    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified || false,
      profile: user.profile || {},
      lastLogin: user.lastLogin,
      loginAttempts: user.loginAttempts || 0,
      isLocked: user.lockUntil && user.lockUntil > Date.now(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          limit
        }
      }
    });

  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to list users', error: error.message },
      { status: 500 }
    );
  }
}
