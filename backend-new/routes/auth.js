const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    console.log('🔐 Backend login attempt:', { email, role });
    
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and role are required'
      });
    }

    // Use existing database connection or create new one
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({
        success: false,
        message: 'Database connection not available'
      });
    }
    
    console.log('📡 Database connected');
    
    // Find user by email first (ignore role parameter)
    const user = await db.collection('users').findOne({
      email: email.toLowerCase()
    });
    
    console.log('👤 User search result:', user ? `FOUND (Role: ${user?.role})` : 'NOT FOUND');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found. Please check your email or register first.'
      });
    }

    // Check if the user's role matches what's expected (optional validation)
    console.log('🔄 Role check:', { requestedRole: role, actualRole: user.role });

    // Check password (handle both hashed and plain text)
    let isPasswordValid = false;
    
    if (user.password && (user.password.startsWith('$2b$') || user.password.startsWith('$2a$'))) {
      // Hashed password (bcrypt can handle both $2a$ and $2b$)
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Plain text password
      isPasswordValid = user.password === password;
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Generate token
    const token = `${user.role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('✅ Login successful for:', user.email);
    
    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        isActive: user.isActive !== false
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Check user endpoint
router.post('/check-user', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('🔍 Backend checking user existence:', { email });
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Use existing database connection
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({
        success: false,
        message: 'Database connection not available'
      });
    }
    
    console.log('📡 Database connected for user check');
    
    // Find user by email only (no role required)
    const user = await db.collection('users').findOne({
      email: email.toLowerCase()
    });
    
    if (user) {
      console.log('👤 User found:', { email: user.email, role: user.role });
      return res.json({
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          isActive: user.isActive !== false
        }
      });
    } else {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
  } catch (error) {
    console.error('❌ Check user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, role = 'student' } = req.body;
    
    console.log('📝 Backend registration attempt:', { email, role, fullName });
    
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required'
      });
    }

    // Use existing database connection
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({
        success: false,
        message: 'Database connection not available'
      });
    }
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({
      email: email.toLowerCase()
    });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('users').insertOne(newUser);
    
    // Generate token
    const token = `${role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('✅ Registration successful for:', email);
    
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: result.insertedId.toString(),
        email: newUser.email,
        role: newUser.role,
        fullName: newUser.fullName,
        isActive: newUser.isActive
      }
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;