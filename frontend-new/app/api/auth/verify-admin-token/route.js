import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth-middleware';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authorization header required'
      }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { valid, user, error } = verifyAdminToken(token);

    if (!valid) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired token',
        error
      }, { status: 401 });
    }

    // Check if user has admin or supervisor role
    if (!['admin', 'supervisor'].includes(user.role)) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions'
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      message: 'Token is valid',
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Token verification failed'
    }, { status: 500 });
  }
}
