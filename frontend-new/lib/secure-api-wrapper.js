import { NextResponse } from 'next/server';
import { 
  requireAuth, 
  requireRole, 
  rateLimitMiddleware,
  requestSizeLimitMiddleware,
  securityHeadersMiddleware,
  getSecurityHeaders,
  corsMiddleware
} from './security-middleware.js';
import { 
  validateRegistrationData,
  validateLoginData,
  validateAttendanceData,
  validateSubscriptionData,
  validateTransportationData,
  validateQRCodeData,
  validateSearchParams,
  validateFileUpload
} from './input-validation.js';

/**
 * Secure API wrapper that applies security measures to all API endpoints
 */

/**
 * Wrapper for authentication-required endpoints
 */
export function withAuth(handler, options = {}) {
  return async (request) => {
    try {
      // Apply rate limiting
      if (options.rateLimit) {
        const rateLimitResult = rateLimitMiddleware('api', options.rateLimit)(request, null);
        if (rateLimitResult) {
          return rateLimitResult;
        }
      }
      
      // Apply request size limit
      if (options.maxSize) {
        const sizeLimitResult = requestSizeLimitMiddleware(options.maxSize)(request, null);
        if (sizeLimitResult) {
          return sizeLimitResult;
        }
      }
      
      // Apply authentication
      const authResult = await requireAuth(handler)(request, null);
      
      // Add security headers to response
      if (authResult && authResult.headers) {
        const securityHeaders = getSecurityHeaders();
        Object.entries(securityHeaders).forEach(([key, value]) => {
          authResult.headers.set(key, value);
        });
      }
      
      return authResult;
      
    } catch (error) {
      console.error('Auth wrapper error', error);
      const errorResponse = NextResponse.json({
        success: false,
        message: 'Authentication error',
        error: error.message
      }, { status: 500 });
      
      // Add security headers to error response
      const securityHeaders = getSecurityHeaders();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      
      return errorResponse;
    }
  };
}

/**
 * Wrapper for role-based access control
 */
export function withRole(allowedRoles, handler, options = {}) {
  return async (request) => {
    try {
      // Apply security headers
      securityHeadersMiddleware(request, null);
      
      // Apply CORS
      corsMiddleware(request, null);
      
      // Apply rate limiting
      if (options.rateLimit) {
        const rateLimitResult = rateLimitMiddleware('api', options.rateLimit)(request, null);
        if (rateLimitResult) {
          return rateLimitResult;
        }
      }
      
      // Apply request size limit
      if (options.maxSize) {
        const sizeLimitResult = requestSizeLimitMiddleware(options.maxSize)(request, null);
        if (sizeLimitResult) {
          return sizeLimitResult;
        }
      }
      
      // Apply role-based authentication
      const roleResult = await requireRole(allowedRoles)(handler)(request, null);
      return roleResult;
      
    } catch (error) {
      console.error('Role wrapper error:', error);
      return NextResponse.json({
        success: false,
        message: 'Authorization error',
        error: error.message
      }, { status: 500 });
    }
  };
}

/**
 * Wrapper for input validation
 */
export function withValidation(validationFunction, handler, options = {}) {
  return async (request) => {
    try {
      // Apply security headers
      securityHeadersMiddleware(request, null);
      
      // Apply CORS
      corsMiddleware(request, null);
      
      // Apply rate limiting
      if (options.rateLimit) {
        const rateLimitResult = rateLimitMiddleware('api', options.rateLimit)(request, null);
        if (rateLimitResult) {
          return rateLimitResult;
        }
      }
      
      // Apply request size limit
      if (options.maxSize) {
        const sizeLimitResult = requestSizeLimitMiddleware(options.maxSize)(request, null);
        if (sizeLimitResult) {
          return sizeLimitResult;
        }
      }
      
      // Get request data
      const body = await request.json();
      
      // Validate input
      const validation = validationFunction(body);
      if (!validation.isValid) {
        return NextResponse.json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        }, { status: 400 });
      }
      
      // Add validated data to request
      request.validatedData = validation.data;
      
      // Call handler with validated data
      return await handler(request);
      
    } catch (error) {
      console.error('Validation wrapper error:', error);
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        error: error.message
      }, { status: 500 });
    }
  };
}

/**
 * Wrapper for admin-only endpoints
 */
export function withAdminAuth(handler, options = {}) {
  return withRole(['admin'], handler, {
    rateLimit: options.rateLimit || 50,
    maxSize: options.maxSize || 1024 * 1024, // 1MB
    ...options
  });
}

/**
 * Wrapper for supervisor-only endpoints
 */
export function withSupervisorAuth(handler, options = {}) {
  return withRole(['supervisor', 'admin'], handler, {
    rateLimit: options.rateLimit || 20,
    maxSize: options.maxSize || 1024 * 1024, // 1MB
    ...options
  });
}

/**
 * Wrapper for student-only endpoints
 */
export function withStudentAuth(handler, options = {}) {
  return withRole(['student'], handler, {
    rateLimit: options.rateLimit || 30,
    maxSize: options.maxSize || 1024 * 1024, // 1MB
    ...options
  });
}

/**
 * Wrapper for public endpoints with basic security
 */
export function withBasicSecurity(handler, options = {}) {
  return async (request) => {
    try {
      // Apply security headers
      securityHeadersMiddleware(request, null);
      
      // Apply CORS
      corsMiddleware(request, null);
      
      // Apply rate limiting
      if (options.rateLimit) {
        const rateLimitResult = rateLimitMiddleware('public', options.rateLimit)(request, null);
        if (rateLimitResult) {
          return rateLimitResult;
        }
      }
      
      // Apply request size limit
      if (options.maxSize) {
        const sizeLimitResult = requestSizeLimitMiddleware(options.maxSize)(request, null);
        if (sizeLimitResult) {
          return sizeLimitResult;
        }
      }
      
      return await handler(request);
      
    } catch (error) {
      console.error('Basic security wrapper error:', error);
      return NextResponse.json({
        success: false,
        message: 'Request processing error',
        error: error.message
      }, { status: 500 });
    }
  };
}

/**
 * Wrapper for registration endpoints
 */
export function withRegistrationValidation(handler, options = {}) {
  return withValidation(validateRegistrationData, handler, {
    rateLimit: 5, // 5 requests per window for registration
    maxSize: 1024 * 1024, // 1MB
    ...options
  });
}

/**
 * Wrapper for login endpoints
 */
export function withLoginValidation(handler, options = {}) {
  return withValidation(validateLoginData, handler, {
    rateLimit: 10, // 10 requests per window for login
    maxSize: 1024, // 1KB for login data
    ...options
  });
}

/**
 * Wrapper for attendance endpoints
 */
export function withAttendanceValidation(handler, options = {}) {
  return withValidation(validateAttendanceData, handler, {
    rateLimit: 20, // 20 requests per window for attendance
    maxSize: 1024 * 1024, // 1MB
    ...options
  });
}

/**
 * Wrapper for subscription endpoints
 */
export function withSubscriptionValidation(handler, options = {}) {
  return withValidation(validateSubscriptionData, handler, {
    rateLimit: 10, // 10 requests per window for subscriptions
    maxSize: 1024 * 1024, // 1MB
    ...options
  });
}

/**
 * Wrapper for transportation endpoints
 */
export function withTransportationValidation(handler, options = {}) {
  return withValidation(validateTransportationData, handler, {
    rateLimit: 15, // 15 requests per window for transportation
    maxSize: 1024 * 1024, // 1MB
    ...options
  });
}

/**
 * Wrapper for QR code endpoints
 */
export function withQRCodeValidation(handler, options = {}) {
  return withValidation(validateQRCodeData, handler, {
    rateLimit: 30, // 30 requests per window for QR codes
    maxSize: 1024 * 1024, // 1MB
    ...options
  });
}

/**
 * Wrapper for search endpoints
 */
export function withSearchValidation(handler, options = {}) {
  return withValidation(validateSearchParams, handler, {
    rateLimit: 50, // 50 requests per window for search
    maxSize: 1024, // 1KB for search parameters
    ...options
  });
}

/**
 * Wrapper for file upload endpoints
 */
export function withFileUploadValidation(handler, options = {}) {
  return async (request) => {
    try {
      // Apply security headers
      securityHeadersMiddleware(request, null);
      
      // Apply CORS
      corsMiddleware(request, null);
      
      // Apply rate limiting
      if (options.rateLimit) {
        const rateLimitResult = rateLimitMiddleware('upload', options.rateLimit)(request, null);
        if (rateLimitResult) {
          return rateLimitResult;
        }
      }
      
      // Apply request size limit
      if (options.maxSize) {
        const sizeLimitResult = requestSizeLimitMiddleware(options.maxSize)(request, null);
        if (sizeLimitResult) {
          return sizeLimitResult;
        }
      }
      
      // Get form data
      const formData = await request.formData();
      const file = formData.get('file');
      
      // Validate file
      const validation = validateFileUpload(file);
      if (!validation.isValid) {
        return NextResponse.json({
          success: false,
          message: 'File validation failed',
          errors: validation.errors
        }, { status: 400 });
      }
      
      // Add validated file to request
      request.validatedFile = validation.data;
      
      // Call handler with validated file
      return await handler(request);
      
    } catch (error) {
      console.error('File upload validation wrapper error:', error);
      return NextResponse.json({
        success: false,
        message: 'File upload error',
        error: error.message
      }, { status: 500 });
    }
  };
}

/**
 * Wrapper for monitoring endpoints
 */
export function withMonitoringAuth(handler, options = {}) {
  return withRole(['admin'], handler, {
    rateLimit: 100, // 100 requests per window for monitoring
    maxSize: 1024 * 1024, // 1MB
    ...options
  });
}

/**
 * Wrapper for system status endpoints
 */
export function withSystemStatusAuth(handler, options = {}) {
  return withRole(['admin', 'supervisor'], handler, {
    rateLimit: 50, // 50 requests per window for system status
    maxSize: 1024 * 1024, // 1MB
    ...options
  });
}

/**
 * Wrapper for report endpoints
 */
export function withReportAuth(handler, options = {}) {
  return withRole(['admin'], handler, {
    rateLimit: 20, // 20 requests per window for reports
    maxSize: 1024 * 1024, // 1MB
    ...options
  });
}

/**
 * Wrapper for user management endpoints
 */
export function withUserManagementAuth(handler, options = {}) {
  return withRole(['admin'], handler, {
    rateLimit: 30, // 30 requests per window for user management
    maxSize: 1024 * 1024, // 1MB
    ...options
  });
}

/**
 * Wrapper for support endpoints
 */
export function withSupportAuth(handler, options = {}) {
  return withRole(['admin', 'supervisor', 'student'], handler, {
    rateLimit: 25, // 25 requests per window for support
    maxSize: 1024 * 1024, // 1MB
    ...options
  });
}

/**
 * Wrapper for expense endpoints
 */
export function withExpenseAuth(handler, options = {}) {
  return withRole(['admin'], handler, {
    rateLimit: 20, // 20 requests per window for expenses
    maxSize: 1024 * 1024, // 1MB
    ...options
  });
}

/**
 * Wrapper for salary endpoints
 */
export function withSalaryAuth(handler, options = {}) {
  return withRole(['admin'], handler, {
    rateLimit: 15, // 15 requests per window for salaries
    maxSize: 1024 * 1024, // 1MB
    ...options
  });
}

/**
 * Wrapper for shift endpoints
 */
export function withShiftAuth(handler, options = {}) {
  return withRole(['admin', 'supervisor'], handler, {
    rateLimit: 25, // 25 requests per window for shifts
    maxSize: 1024 * 1024, // 1MB
    ...options
  });
}

/**
 * Wrapper for debug endpoints (development only)
 */
export function withDebugAuth(handler, options = {}) {
  if (process.env.NODE_ENV === 'production') {
    return async (request) => {
      return NextResponse.json({
        success: false,
        message: 'Debug endpoints are not available in production'
      }, { status: 404 });
    };
  }
  
  return withRole(['admin'], handler, {
    rateLimit: 100, // 100 requests per window for debug
    maxSize: 1024 * 1024, // 1MB
    ...options
  });
}

/**
 * Wrapper for test endpoints (development only)
 */
export function withTestAuth(handler, options = {}) {
  if (process.env.NODE_ENV === 'production') {
    return async (request) => {
      return NextResponse.json({
        success: false,
        message: 'Test endpoints are not available in production'
      }, { status: 404 });
    };
  }
  
  return withBasicSecurity(handler, {
    rateLimit: 100, // 100 requests per window for tests
    maxSize: 1024 * 1024, // 1MB
    ...options
  });
}
