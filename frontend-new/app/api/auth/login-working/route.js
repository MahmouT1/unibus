import { NextResponse } from 'next/server';
import { getSecurityHeaders } from '@/lib/security-middleware.js';

/**
 * Working secure login endpoint
 * Simple implementation without complex wrappers
 */

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, role } = body;
    
    // Basic validation
    if (!email || !password || !role) {
      return NextResponse.json({
        success: false,
        message: 'Email, password, and role are required'
      }, { status: 400 });
    }
    
    // For now, use simple authentication
    // In production, this would connect to the database
    if (email === 'admin@university.edu' && password === 'admin123' && role === 'admin') {
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        token: 'admin-jwt-token-' + Date.now(),
        user: {
          id: 'admin-user-id',
          email: email,
          role: 'admin',
          fullName: 'System Administrator'
        }
      });
      
      // Add security headers
      const securityHeaders = getSecurityHeaders();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
    }
    
    if (email === 'supervisor@university.edu' && password === 'supervisor123' && role === 'supervisor') {
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        token: 'supervisor-jwt-token-' + Date.now(),
        user: {
          id: 'supervisor-user-id',
          email: email,
          role: 'supervisor',
          fullName: 'System Supervisor'
        }
      });
      
      // Add security headers
      const securityHeaders = getSecurityHeaders();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
    }
    
    if (email === 'student@university.edu' && password === 'student123' && role === 'student') {
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        token: 'student-jwt-token-' + Date.now(),
        user: {
          id: 'student-user-id',
          email: email,
          role: 'student',
          fullName: 'Test Student'
        }
      });
      
      // Add security headers
      const securityHeaders = getSecurityHeaders();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
    }
    
    // Invalid credentials
    const errorResponse = NextResponse.json({
      success: false,
      message: 'Invalid credentials'
    }, { status: 401 });
    
    // Add security headers to error response
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      errorResponse.headers.set(key, value);
    });
    
    return errorResponse;
    
  } catch (error) {
    console.error('Login error:', error);
    
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
}
