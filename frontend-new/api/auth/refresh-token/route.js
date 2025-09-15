import { NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/mongodb-simple-connection.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request) {
  try {
    const body = await request.json();
    const { currentToken } = body;

    if (!currentToken) {
      return NextResponse.json(
        { success: false, message: 'Current token is required' },
        { status: 400 }
      );
    }

    // Verify the current token
    let decoded;
    try {
      decoded = jwt.verify(currentToken, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid current token' },
        { status: 401 }
      );
    }

    // Connect to database
    const db = await getDatabase();
    const usersCollection = db.collection('users');
    const studentsCollection = db.collection('students');

    // Get current user data from database
    let user;
    try {
      // Try to find user by ObjectId first
      const { ObjectId } = await import('mongodb');
      user = await usersCollection.findOne({ 
        _id: new ObjectId(decoded.userId),
        isActive: true 
      });
    } catch (objectIdError) {
      // If ObjectId conversion fails, try finding by string ID
      user = await usersCollection.findOne({ 
        _id: decoded.userId,
        isActive: true 
      });
    }

    if (!user) {
      // Check if user exists but is inactive
      let inactiveUser;
      try {
        const { ObjectId } = await import('mongodb');
        inactiveUser = await usersCollection.findOne({ 
          _id: new ObjectId(decoded.userId)
        });
      } catch (objectIdError) {
        inactiveUser = await usersCollection.findOne({ 
          _id: decoded.userId
        });
      }

      if (inactiveUser) {
        return NextResponse.json(
          { success: false, message: 'User account is inactive' },
          { status: 403 }
        );
      } else {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }
    }

    // Get student profile if user is a student
    let studentProfile = null;
    if (user.role === 'student') {
      studentProfile = await studentsCollection.findOne({ 
        email: user.email 
      });
    }

    // Generate new JWT token with updated information
    const newToken = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Prepare user data (exclude password)
    const userData = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };

    // Prepare student data if available
    let studentData = null;
    if (studentProfile) {
      studentData = {
        id: studentProfile._id.toString(),
        fullName: studentProfile.fullName,
        studentId: studentProfile.studentId,
        phoneNumber: studentProfile.phoneNumber,
        college: studentProfile.college,
        grade: studentProfile.grade,
        major: studentProfile.major,
        academicYear: studentProfile.academicYear,
        address: studentProfile.address,
        profilePhoto: studentProfile.profilePhoto,
        qrCode: studentProfile.qrCode,
        status: studentProfile.status,
        email: studentProfile.email
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken,
      user: userData,
      student: studentData
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { success: false, message: 'Token refresh failed', error: error.message },
      { status: 500 }
    );
  }
}
