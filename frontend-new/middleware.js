import { NextResponse } from 'next/server';
import { securityHeadersMiddleware, corsMiddleware, rateLimitMiddleware } from './lib/security-middleware.js';

/**
 * Next.js middleware for security and protection
 * This runs on every request before reaching API routes and pages
 */

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Create response object
  const response = NextResponse.next();
  
  // Apply security headers to all responses
  securityHeadersMiddleware(request, response);
  
  // Apply CORS configuration
  corsMiddleware(request, response);
  
  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const rateLimitResult = rateLimitMiddleware('api', 100)(request, response);
    if (rateLimitResult) {
      return rateLimitResult;
    }
  }
  
  // Special rate limiting for authentication endpoints
  if (pathname.startsWith('/api/auth/')) {
    const rateLimitResult = rateLimitMiddleware('auth', 10)(request, response);
    if (rateLimitResult) {
      return rateLimitResult;
    }
  }
  
  // Rate limiting for attendance endpoints
  if (pathname.startsWith('/api/attendance/')) {
    const rateLimitResult = rateLimitMiddleware('attendance', 20)(request, response);
    if (rateLimitResult) {
      return rateLimitResult;
    }
  }
  
  // Rate limiting for admin endpoints
  if (pathname.startsWith('/api/admin/')) {
    const rateLimitResult = rateLimitMiddleware('admin', 50)(request, response);
    if (rateLimitResult) {
      return rateLimitResult;
    }
  }
  
  // Block access to sensitive files
  if (pathname.includes('/.env') || 
      pathname.includes('/package.json') || 
      pathname.includes('/node_modules/') ||
      pathname.includes('/.git/') ||
      pathname.includes('/.next/')) {
    return new NextResponse('Not Found', { status: 404 });
  }
  
  // Block access to backup files
  if (pathname.includes('.backup') || 
      pathname.includes('.bak') || 
      pathname.includes('.old')) {
    return new NextResponse('Not Found', { status: 404 });
  }
  
  // Block access to test files in production
  if (process.env.NODE_ENV === 'production' && 
      (pathname.includes('/test') || 
       pathname.includes('/debug') || 
       pathname.includes('/.test'))) {
    return new NextResponse('Not Found', { status: 404 });
  }
  
  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
