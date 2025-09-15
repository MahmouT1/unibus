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

export function requireAuth(handler) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') || 
                   req.cookies?.token ||
                   req.headers.cookie?.split('token=')[1]?.split(';')[0];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access token required'
        });
      }

      const { valid, payload, error } = verifyToken(token);
      
      if (!valid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
          error: error
        });
      }

      // Add user info to request
      req.user = payload;
      return handler(req, res);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Authentication error',
        error: error.message
      });
    }
  };
}

export function requireRole(allowedRoles) {
  return (handler) => {
    return async (req, res) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '') || 
                     req.cookies?.token ||
                     req.headers.cookie?.split('token=')[1]?.split(';')[0];

        if (!token) {
          return res.status(401).json({
            success: false,
            message: 'Access token required'
          });
        }

        const { valid, payload, error } = verifyToken(token);
        
        if (!valid) {
          return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            error: error
          });
        }

        // Check role
        if (!allowedRoles.includes(payload.role)) {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions'
          });
        }

        // Add user info to request
        req.user = payload;
        return handler(req, res);
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Authorization error',
          error: error.message
        });
      }
    };
  };
}
