import { NextResponse } from 'next/server';

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

    // Simple test login - accept any email/password combination
    if (email && password.length >= 6) {
      return NextResponse.json({
        success: true,
        message: 'Login successful (test mode)',
        token: 'test-jwt-token-' + Date.now(),
        user: {
          id: 'test-user-id',
          email: email,
          role: 'student'
        },
        student: {
          id: 'test-student-id',
          fullName: 'Ahmed Hassan',
          studentId: '2024001',
          college: 'Engineering',
          grade: 'first-year',
          major: 'Computer Science'
        }
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed', error: error.message },
      { status: 500 }
    );
  }
}
