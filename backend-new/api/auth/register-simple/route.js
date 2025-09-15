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

    // For now, just return success without database interaction
    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful (simple mode)',
        token: 'simple-token-' + Date.now(),
        user: {
          id: 'simple-user-id',
          email: email,
          role: 'student'
        },
        student: {
          id: 'simple-student-id',
          fullName: fullName,
          studentId: studentId,
          college: college,
          grade: grade,
          major: major
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Simple registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Registration failed', error: error.message },
      { status: 500 }
    );
  }
}
