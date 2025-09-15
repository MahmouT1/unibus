import jwt from 'jsonwebtoken';

export function verifyAdminToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return { valid: true, user: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

export function requireAdminAuth(handler) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access token required'
        });
      }

      const { valid, user, error } = verifyAdminToken(token);
      
      if (!valid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
          error
        });
      }

      // Check if user has admin or supervisor role
      if (!['admin', 'supervisor'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      // Add user to request object
      req.user = user;
      return handler(req, res);
      
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }
  };
}

export function requireAdminRole(handler) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access token required'
        });
      }

      const { valid, user, error } = verifyAdminToken(token);
      
      if (!valid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
          error
        });
      }

      // Check if user has admin role specifically
      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      // Add user to request object
      req.user = user;
      return handler(req, res);
      
    } catch (error) {
      console.error('Admin auth middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }
  };
}

export function requireSupervisorRole(handler) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access token required'
        });
      }

      const { valid, user, error } = verifyAdminToken(token);
      
      if (!valid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
          error
        });
      }

      // Check if user has supervisor role (or admin can also access)
      if (!['supervisor', 'admin'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Supervisor access required'
        });
      }

      // Add user to request object
      req.user = user;
      return handler(req, res);
      
    } catch (error) {
      console.error('Supervisor auth middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }
  };
}
