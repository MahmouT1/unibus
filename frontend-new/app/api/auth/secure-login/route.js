import { NextResponse } from 'next/server';
import { withLoginValidation, withBasicSecurity } from '@/lib/secure-api-wrapper.js';
import { hashPassword, verifyPassword, generateSecureToken, trackLoginAttempt, getSecurityHeaders } from '@/lib/security-middleware.js';
import { getSecureDatabase } from '@/lib/secure-database.js';
import { logSecurityEvent, SECURITY_EVENTS, SECURITY_LEVELS } from '@/lib/security-monitoring.js';

/**
 * Secure login endpoint with comprehensive security measures
 * This replaces the existing login endpoints with enhanced security
 */

export const POST = withLoginValidation(async (request) => {
  try {
    const { email, password, role } = request.validatedData;
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Check login attempts and lockout
    const attemptCheck = trackLoginAttempt(email, false);
    if (!attemptCheck.allowed) {
      await logSecurityEvent(SECURITY_EVENTS.LOGIN_BLOCKED, {
        email,
        ip,
        userAgent,
        reason: attemptCheck.message
      }, SECURITY_LEVELS.HIGH);
      
      return NextResponse.json({
        success: false,
        message: attemptCheck.message
      }, { status: 429 });
    }
    
    // Get database connection
    const db = await getSecureDatabase();
    const usersCollection = db.collection('users');
    
    // Find user with role validation
    let user;
    if (role === 'admin') {
      user = await usersCollection.findOne({
        email: email.toLowerCase(),
        role: { $in: ['admin', 'Admin', 'ADMIN'] },
        isActive: true
      });
    } else if (role === 'supervisor') {
      user = await usersCollection.findOne({
        email: email.toLowerCase(),
        role: { $in: ['supervisor', 'Supervisor', 'SUPERVISOR'] },
        isActive: true
      });
    } else if (role === 'student') {
      user = await usersCollection.findOne({
        email: email.toLowerCase(),
        role: { $in: ['student', 'Student', 'STUDENT'] },
        isActive: true
      });
    }
    
    if (!user) {
      await logSecurityEvent(SECURITY_EVENTS.LOGIN_FAILED, {
        email,
        ip,
        userAgent,
        reason: 'User not found or inactive'
      }, SECURITY_LEVELS.MEDIUM);
      
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }
    
    // Check if user is locked out
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      await logSecurityEvent(SECURITY_EVENTS.LOGIN_BLOCKED, {
        email,
        ip,
        userAgent,
        reason: 'Account locked due to failed attempts'
      }, SECURITY_LEVELS.HIGH);
      
      return NextResponse.json({
        success: false,
        message: 'Account is temporarily locked. Please try again later.'
      }, { status: 429 });
    }
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      await logSecurityEvent(SECURITY_EVENTS.LOGIN_FAILED, {
        email,
        ip,
        userAgent,
        reason: 'Invalid password'
      }, SECURITY_LEVELS.MEDIUM);
      
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }
    
    // Generate secure token
    const token = generateSecureToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    
    // Update user login information
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          lastLogin: new Date(),
          lastLoginIP: ip,
          loginCount: (user.loginCount || 0) + 1
        },
        $unset: {
          lockedUntil: 1,
          failedAttempts: 1
        }
      }
    );
    
    // Log successful login
    await logSecurityEvent(SECURITY_EVENTS.LOGIN_SUCCESS, {
      email,
      ip,
      userAgent,
      userId: user._id.toString(),
      role: user.role
    }, SECURITY_LEVELS.LOW);
    
    // Return success response with security headers
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        isActive: user.isActive,
        lastLogin: user.lastLogin
      }
    });
    
    // Add security headers
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
    
  } catch (error) {
    console.error('Secure login error:', error);
    
    // Log system error
    await logSecurityEvent(SECURITY_EVENTS.SYSTEM_ERROR, {
      error: error.message,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    }, SECURITY_LEVELS.HIGH);
    
    const errorResponse = NextResponse.json({
      success: false,
      message: 'Login failed due to system error'
    }, { status: 500 });
    
    // Add security headers to error response
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      errorResponse.headers.set(key, value);
    });
    
    return errorResponse;
  }
});
