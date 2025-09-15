import { NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/mongodb-simple-connection.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      fullName, 
      email, 
      password, 
      confirmPassword
    } = body;

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await getDatabase();
    const usersCollection = db.collection('users');
    const studentsCollection = db.collection('students');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ 
      email: email.toLowerCase() 
    });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // No need to check student ID since we're not collecting it

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user account
    const userData = {
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'student',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const userResult = await usersCollection.insertOne(userData);
    const userId = userResult.insertedId;

    // Create student profile with minimal data
    const studentData = {
      userId: userId,
      fullName: fullName.trim(),
      email: email.toLowerCase(),
      studentId: '', // Will be filled later
      phoneNumber: '',
      college: '',
      grade: '',
      major: '',
      academicYear: new Date().getFullYear(),
      address: '',
      profilePhoto: '',
      qrCode: '',
      attendanceStats: {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        attendanceRate: 0
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const studentResult = await studentsCollection.insertOne(studentData);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: userId.toString(),
        email: email.toLowerCase(),
        role: 'student' 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Prepare response data
    const userResponse = {
      id: userId.toString(),
      email: email.toLowerCase(),
      role: 'student',
      isActive: true,
      createdAt: userData.createdAt
    };

    const studentResponse = {
      id: studentResult.insertedId.toString(),
      fullName: studentData.fullName,
      studentId: studentData.studentId,
      phoneNumber: studentData.phoneNumber,
      college: studentData.college,
      grade: studentData.grade,
      major: studentData.major,
      academicYear: studentData.academicYear,
      address: studentData.address,
      profilePhoto: studentData.profilePhoto,
      qrCode: studentData.qrCode,
      status: studentData.status,
      email: studentData.email
    };

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      token: token,
      user: userResponse,
      student: studentResponse
    }, { status: 201 });

  } catch (error) {
    console.error('Secure registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Registration failed', error: error.message },
      { status: 500 }
    );
  }
}
