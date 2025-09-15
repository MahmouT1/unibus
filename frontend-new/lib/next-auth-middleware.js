import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, payload: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

export function getTokenFromRequest(request) {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try to get token from cookies
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    
    if (cookies.token) {
      return cookies.token;
    }
  }

  return null;
}

export function authenticateRequest(request) {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    return { 
      authenticated: false, 
      error: 'No token provided' 
    };
  }

  const { valid, payload, error } = verifyToken(token);
  
  if (!valid) {
    return { 
      authenticated: false, 
      error: error 
    };
  }

  return { 
    authenticated: true, 
    user: payload 
  };
}

export function requireAuth(handler) {
  return async (request) => {
    const { authenticated, user, error } = authenticateRequest(request);
    
    if (!authenticated) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Authentication required',
          error: error
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Add user to request context
    request.user = user;
    return handler(request);
  };
}

export function requireRole(allowedRoles) {
  return (handler) => {
    return async (request) => {
      const { authenticated, user, error } = authenticateRequest(request);
      
      if (!authenticated) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Authentication required',
            error: error
          }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      if (!allowedRoles.includes(user.role)) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Insufficient permissions'
          }),
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Add user to request context
      request.user = user;
      return handler(request);
    };
  };
}
