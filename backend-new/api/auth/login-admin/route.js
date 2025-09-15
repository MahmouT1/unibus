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

    // Admin login - check for admin email
    if (email === 'admin@university.edu' && password === 'admin123') {
      return NextResponse.json({
        success: true,
        message: 'Admin login successful',
        token: 'admin-jwt-token-' + Date.now(),
        user: {
          id: 'admin-user-id',
          email: email,
          role: 'admin'
        }
      });
    }
    
    // Supervisor login
    if (email === 'supervisor@university.edu' && password === 'supervisor123') {
      return NextResponse.json({
        success: true,
        message: 'Supervisor login successful',
        token: 'supervisor-jwt-token-' + Date.now(),
        user: {
          id: 'supervisor-user-id',
          email: email,
          role: 'supervisor'
        }
      });
    }

    // Regular student login
    if (email && password.length >= 6) {
      return NextResponse.json({
        success: true,
        message: 'Student login successful',
        token: 'student-jwt-token-' + Date.now(),
        user: {
          id: 'student-user-id',
          email: email,
          role: 'student'
        },
        student: {
          id: 'student-profile-id',
          fullName: 'Test Student',
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
