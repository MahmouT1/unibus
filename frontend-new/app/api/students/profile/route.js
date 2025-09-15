import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Student from '@/lib/Student.js';
import User from '@/lib/User.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Find student by userId
    const student = await Student.findOne({ userId: user._id.toString() });

    if (student) {
      return NextResponse.json({ 
        success: true, 
        student: {
          id: student._id.toString(),
          studentId: student.studentId,
          fullName: student.fullName,
          email: user.email,
          phoneNumber: student.phoneNumber,
          college: student.college,
          grade: student.grade,
          major: student.major,
          address: student.address,
          profilePhoto: student.profilePhoto
        }
      });
    } else {
      // Return default values if student not found
      return NextResponse.json({ 
        success: true, 
        student: {
          id: 'not-assigned',
          studentId: 'Not assigned',
          fullName: 'Not provided',
          email: email,
          phoneNumber: 'Not provided',
          college: 'Not provided',
          grade: 'Not provided',
          major: 'Not provided',
          address: {
            streetAddress: 'Not provided',
            buildingNumber: 'Not provided',
            fullAddress: 'Not provided'
          },
          profilePhoto: null
        }
      });
    }
  } catch (error) {
    console.error('GET /api/students/profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve student profile', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { email, ...updateData } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if student already exists
    let student = await Student.findOne({ userId: user._id.toString() });

    if (student) {
      // Update existing student
      Object.assign(student, updateData);
      await student.save();
    } else {
      // Create new student
      student = new Student({
        userId: user._id.toString(),
        studentId: updateData.studentId || `STU${Date.now()}`,
        fullName: updateData.fullName || '',
        phoneNumber: updateData.phoneNumber || '',
        college: updateData.college || '',
        grade: updateData.grade || '',
        major: updateData.major || '',
        address: updateData.address || {},
        profilePhoto: updateData.profilePhoto || null
      });
      await student.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Student profile updated successfully',
      student: {
        id: student._id.toString(),
        studentId: student.studentId,
        fullName: student.fullName,
        email: user.email,
        phoneNumber: student.phoneNumber,
        college: student.college,
        grade: student.grade,
        major: student.major,
        address: student.address,
        profilePhoto: student.profilePhoto
      }
    });
  } catch (error) {
    console.error('PUT /api/students/profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update student profile', error: error.message },
      { status: 500 }
    );
  }
}