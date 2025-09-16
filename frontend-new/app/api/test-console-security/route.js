import { NextResponse } from 'next/server';
import { secureLog, secureError, secureWarn, secureInfo, getSecurityHeaders } from '@/lib/secure-logging.js';

/**
 * Test endpoint to verify console security is working
 * This endpoint will log sensitive data to demonstrate redaction
 */

export async function GET(request) {
  try {
    // Test data with sensitive information
    const testData = {
      user: {
        id: '12345',
        email: 'test@example.com',
        password: 'secretpassword123',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NSIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSJ9.signature',
        apiKey: 'sk-1234567890abcdef1234567890abcdef',
        creditCard: '4111-1111-1111-1111',
        ssn: '123-45-6789',
        phone: '+1234567890',
        ip: '192.168.1.100'
      },
      database: {
        connection: 'mongodb://user:password@localhost:27017/database',
        query: 'SELECT * FROM users WHERE password = "secret"',
        credentials: {
          username: 'admin',
          password: 'admin123'
        }
      },
      api: {
        endpoint: 'https://api.example.com/auth/login',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
          'X-API-Key': 'sk-1234567890abcdef1234567890abcdef'
        }
      }
    };
    
    // Log sensitive data to demonstrate redaction
    secureInfo('Testing console security with sensitive data', testData);
    secureWarn('Warning with sensitive information', { password: 'secret123', token: 'abc123' });
    secureError('Error with sensitive data', new Error('Database connection failed'), { 
      connectionString: 'mongodb://user:password@localhost:27017/database' 
    });
    
    // Return response with security headers
    const response = NextResponse.json({
      success: true,
      message: 'Console security test completed',
      note: 'Check the server console to see redacted sensitive data',
      testData: {
        message: 'Sensitive data has been redacted in the response',
        originalData: 'Contains passwords, tokens, API keys, etc.',
        redactedData: 'All sensitive information replaced with [REDACTED]'
      }
    });
    
    // Add security headers
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
    
  } catch (error) {
    secureError('Console security test error', error);
    
    const errorResponse = NextResponse.json({
      success: false,
      message: 'Console security test failed',
      error: error.message
    }, { status: 500 });
    
    // Add security headers to error response
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      errorResponse.headers.set(key, value);
    });
    
    return errorResponse;
  }
}
