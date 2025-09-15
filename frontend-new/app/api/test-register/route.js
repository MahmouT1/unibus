import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, fullName } = body;

    // Simple validation
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { success: false, message: 'Email, password, and fullName are required' },
        { status: 400 }
      );
    }

    // Return success without database interaction for now
    return NextResponse.json({
      success: true,
      message: 'Test registration successful',
      user: {
        id: 'test-id',
        email: email,
        role: 'student'
      }
    });

  } catch (error) {
    console.error('Test registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Test registration failed', error: error.message },
      { status: 500 }
    );
  }
}
