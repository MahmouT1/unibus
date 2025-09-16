import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

// Security configuration
const SECURITY_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secure-secret-key-change-in-production',
  JWT_EXPIRES_IN: '24h',
  BCRYPT_ROUNDS: 12,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIREMENTS: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  }
};

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map();
const loginAttempts = new Map();

/**
 * Enhanced JWT token generation with security features
 */
export function generateSecureToken(payload) {
  const tokenPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    jti: generateUniqueId() // JWT ID for token tracking
  };
  
  const token = jwt.sign(tokenPayload, SECURITY_CONFIG.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: SECURITY_CONFIG.JWT_EXPIRES_IN
  });
  
  // Log token generation securely (using console.info for now)
  console.info('JWT token generated', {
    userId: payload.id,
    role: payload.role,
    expiresIn: SECURITY_CONFIG.JWT_EXPIRES_IN
  });
  
  return token;
}

/**
 * Enhanced JWT token verification with security checks
 */
export function verifySecureToken(token) {
  try {
    const decoded = jwt.verify(token, SECURITY_CONFIG.JWT_SECRET, {
      algorithms: ['HS256']
    });
    
    // Check token expiration
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      console.warn('JWT token expired', { tokenId: decoded.jti });
      return { valid: false, error: 'Token expired' };
    }
    
    // Log successful token verification
    console.info('JWT token verified', {
      userId: decoded.id,
      role: decoded.role,
      tokenId: decoded.jti
    });
    
    return { valid: true, payload: decoded };
  } catch (error) {
    console.error('JWT token verification failed', error);
    return { valid: false, error: error.message };
  }
}

/**
 * Enhanced password hashing with salt
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, SECURITY_CONFIG.BCRYPT_ROUNDS);
}

/**
 * Enhanced password verification
 */
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Password strength validation
 */
export function validatePasswordStrength(password) {
  const errors = [];
  
  if (password.length < SECURITY_CONFIG.PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD_REQUIREMENTS.minLength} characters long`);
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Rate limiting middleware
 */
export function rateLimitMiddleware(identifier, maxRequests = SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS) {
  return (req, res, next) => {
    const key = `${identifier}_${req.ip || 'unknown'}`;
    const now = Date.now();
    const windowStart = now - SECURITY_CONFIG.RATE_LIMIT_WINDOW;
    
    // Clean old entries
    if (rateLimitStore.has(key)) {
      const requests = rateLimitStore.get(key).filter(time => time > windowStart);
      rateLimitStore.set(key, requests);
    }
    
    // Check current requests
    const currentRequests = rateLimitStore.get(key) || [];
    if (currentRequests.length >= maxRequests) {
      return NextResponse.json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((currentRequests[0] + SECURITY_CONFIG.RATE_LIMIT_WINDOW - now) / 1000)
      }, { status: 429 });
    }
    
    // Add current request
    currentRequests.push(now);
    rateLimitStore.set(key, currentRequests);
    
    if (next) next();
  };
}

/**
 * Login attempt tracking and lockout
 */
export function trackLoginAttempt(identifier, success) {
  const key = `login_${identifier}`;
  const now = Date.now();
  
  if (success) {
    loginAttempts.delete(key);
    return { allowed: true };
  }
  
  const attempts = loginAttempts.get(key) || { count: 0, lastAttempt: 0 };
  attempts.count += 1;
  attempts.lastAttempt = now;
  
  if (attempts.count >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
    const lockoutUntil = attempts.lastAttempt + SECURITY_CONFIG.LOCKOUT_TIME;
    if (now < lockoutUntil) {
      return {
        allowed: false,
        message: `Account locked due to too many failed attempts. Try again in ${Math.ceil((lockoutUntil - now) / 60000)} minutes.`
      };
    } else {
      // Reset attempts after lockout period
      attempts.count = 1;
      attempts.lastAttempt = now;
    }
  }
  
  loginAttempts.set(key, attempts);
  return { allowed: true };
}

/**
 * Input sanitization
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .replace(/[;]/g, '') // Remove semicolons
    .substring(0, 1000); // Limit length
}

/**
 * Email validation
 */
export function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * SQL injection prevention
 */
export function sanitizeForDatabase(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[';]/g, '') // Remove single quotes and semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove SQL comment starts
    .replace(/\*\//g, '') // Remove SQL comment ends
    .replace(/union/gi, '') // Remove UNION keywords
    .replace(/select/gi, '') // Remove SELECT keywords
    .replace(/insert/gi, '') // Remove INSERT keywords
    .replace(/update/gi, '') // Remove UPDATE keywords
    .replace(/delete/gi, '') // Remove DELETE keywords
    .replace(/drop/gi, '') // Remove DROP keywords
    .replace(/create/gi, '') // Remove CREATE keywords
    .replace(/alter/gi, '') // Remove ALTER keywords
    .replace(/exec/gi, '') // Remove EXEC keywords
    .replace(/execute/gi, '') // Remove EXECUTE keywords
    .trim();
}

/**
 * XSS prevention
 */
export function preventXSS(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Generate unique ID
 */
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Security headers middleware for Next.js
 */
export function securityHeadersMiddleware(req, res, next) {
  // For Next.js API routes, headers are set in the response object
  if (res && typeof res.setHeader === 'function') {
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob:; " +
      "font-src 'self'; " +
      "connect-src 'self'; " +
      "frame-ancestors 'none';"
    );
  }
  
  if (next) next();
}

/**
 * Security headers for Next.js API routes
 */
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob:; " +
      "font-src 'self'; " +
      "connect-src 'self'; " +
      "frame-ancestors 'none';"
  };
}

/**
 * CORS configuration
 */
export function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://yourdomain.com' // Add your production domain
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (next) next();
}

/**
 * Request size limit middleware
 */
export function requestSizeLimitMiddleware(maxSize = 1024 * 1024) { // 1MB default
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > maxSize) {
      return NextResponse.json({
        success: false,
        message: 'Request too large'
      }, { status: 413 });
    }
    
    if (next) next();
  };
}

/**
 * Authentication middleware with enhanced security
 */
export function requireAuth(handler) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') || 
                   req.cookies?.token ||
                   req.headers.cookie?.split('token=')[1]?.split(';')[0];

      if (!token) {
        return NextResponse.json({
          success: false,
          message: 'Access token required'
        }, { status: 401 });
      }

      const { valid, payload, error } = verifySecureToken(token);
      
      if (!valid) {
        return NextResponse.json({
          success: false,
          message: 'Invalid or expired token',
          error
        }, { status: 401 });
      }

      // Add user info to request
      req.user = payload;
      return handler(req, res);
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Authentication error',
        error: error.message
      }, { status: 500 });
    }
  };
}

/**
 * Role-based access control
 */
export function requireRole(allowedRoles) {
  return (handler) => {
    return async (req, res) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '') || 
                     req.cookies?.token ||
                     req.headers.cookie?.split('token=')[1]?.split(';')[0];

        if (!token) {
          return NextResponse.json({
            success: false,
            message: 'Access token required'
          }, { status: 401 });
        }

        const { valid, payload, error } = verifySecureToken(token);
        
        if (!valid) {
          return NextResponse.json({
            success: false,
            message: 'Invalid or expired token',
            error
          }, { status: 401 });
        }

        // Check role
        if (!allowedRoles.includes(payload.role)) {
          return NextResponse.json({
            success: false,
            message: 'Insufficient permissions'
          }, { status: 403 });
        }

        // Add user info to request
        req.user = payload;
        return handler(req, res);
      } catch (error) {
        return NextResponse.json({
          success: false,
          message: 'Authorization error',
          error: error.message
        }, { status: 500 });
      }
    };
  };
}

export { SECURITY_CONFIG };
