import { NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/mongodb-simple-connection.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await getDatabase();
    const usersCollection = db.collection('users');
    const studentsCollection = db.collection('students');

    // Find user in database
    const user = await usersCollection.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    // Get student profile if user is a student
    let studentProfile = null;
    if (user.role === 'student') {
      studentProfile = await studentsCollection.findOne({ 
        email: email.toLowerCase() 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
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
      message: 'Login successful',
      token: token,
      user: userData,
      student: studentData
    });

  } catch (error) {
    console.error('Secure login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed', error: error.message },
      { status: 500 }
    );
  }
}
