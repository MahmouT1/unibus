import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, fullName, studentId, phoneNumber, college, grade, major } = body;

    // Basic validation
    if (!email || !password || !fullName || !studentId || !phoneNumber || !college || !grade || !major) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Simple registration without database for now
    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      token: 'registration-token-' + Date.now(),
      user: {
        id: 'new-user-id',
        email: email,
        role: 'student'
      },
      student: {
        id: 'new-student-id',
        fullName: fullName,
        studentId: studentId,
        phoneNumber: phoneNumber,
        college: college,
        grade: grade,
        major: major
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Registration failed', error: error.message },
      { status: 500 }
    );
  }
}