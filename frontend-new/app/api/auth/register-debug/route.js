import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import User from '../../../lib/User';
import Student from '../../../lib/Student';

export async function POST(request) {
  try {
    console.log('Starting registration...');
    await connectDB();
    console.log('Database connected');

    const body = await request.json();
    console.log('Request body:', body);
    
    const { email, password, fullName, studentId, phoneNumber, college, grade, major } = body;

    // Basic validation
    if (!email || !password || !fullName || !studentId || !phoneNumber || !college || !grade || !major) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    console.log('Validation passed');

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 400 }
      );
    }

    console.log('User check passed');

    // Check if student ID already exists
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return NextResponse.json(
        { success: false, message: 'Student ID already registered' },
        { status: 400 }
      );
    }

    console.log('Student ID check passed');

    // Create user
    const user = new User({
      email,
      password,
      role: 'student'
    });
    
    console.log('Creating user...');
    await user.save();
    console.log('User created:', user._id);

    // Create student profile
    const student = new Student({
      userId: user._id,
      studentId,
      fullName,
      phoneNumber,
      college,
      grade,
      major,
      academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
    });
    
    console.log('Creating student...');
    await student.save();
    console.log('Student created:', student._id);

    // Generate simple token
    const token = 'jwt-token-' + Date.now() + '-' + user._id;

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        },
        student: {
          id: student._id,
          fullName: student.fullName,
          studentId: student.studentId,
          college: student.college,
          grade: student.grade,
          major: student.major
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Registration failed', error: error.message },
      { status: 500 }
    );
  }
}
