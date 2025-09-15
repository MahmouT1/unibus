import jwt from 'jsonwebtoken';
import User from './User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '30d'
  });
}

export async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    return user;
  } catch (error) {
    return null;
  }
}

export async function authMiddleware(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return { error: 'No token provided' };
  }

  const user = await verifyToken(token);
  
  if (!user) {
    return { error: 'Invalid token' };
  }

  return { user };
}
