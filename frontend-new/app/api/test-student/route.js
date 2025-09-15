import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Student from '../../../lib/Student';

export async function POST(request) {
  try {
    console.log('Testing student creation...');
    await connectDB();
    console.log('Database connected');

    const body = await request.json();
    const { studentId, fullName, phoneNumber, college, grade, major } = body;

    console.log('Creating student with ID:', studentId);

    // Create student profile
    const student = new Student({
      userId: '68bedbb38530c4b2ce843f27', // Use existing user ID
      studentId,
      fullName,
      phoneNumber,
      college,
      grade,
      major,
      academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
    });
    
    console.log('Student object created, saving...');
    await student.save();
    console.log('Student saved successfully:', student._id);

    return NextResponse.json({
      success: true,
      message: 'Student created successfully',
      student: {
        id: student._id,
        fullName: student.fullName,
        studentId: student.studentId,
        college: student.college,
        grade: student.grade,
        major: student.major
      }
    });

  } catch (error) {
    console.error('Student creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Student creation failed', error: error.message },
      { status: 500 }
    );
  }
}
