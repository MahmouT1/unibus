// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '30d'
    });
};

// Register new user
router.post('/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('fullName').notEmpty().trim(),
    body('studentId').notEmpty().trim(),
    body('phoneNumber').notEmpty().trim(),
    body('college').notEmpty().trim(),
    body('grade').notEmpty().trim(),
    body('major').notEmpty().trim()
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { email, password, fullName, studentId, phoneNumber, college, grade, major } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Check if student ID already exists
        const existingStudent = await Student.findOne({ studentId });
        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: 'Student ID already registered'
            });
        }

        // Create user
        const user = new User({
            email,
            password,
            role: 'student'
        });
        await user.save();

        // Create student profile
        const student = new Student({
            userId: user._id,
            studentId,
            fullName,
            phoneNumber,
            college,
            grade,
            major,
            academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
        });
        await student.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            },
            student: {
                id: student._id,
                fullName: student.fullName,
                studentId: student.studentId
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

// Login user
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Get student profile if user is a student
        let studentProfile = null;
        if (user.role === 'student') {
            studentProfile = await Student.findOne({ userId: user._id });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                lastLogin: user.lastLogin
            },
            student: studentProfile ? {
                id: studentProfile._id,
                fullName: studentProfile.fullName,
                studentId: studentProfile.studentId,
                college: studentProfile.college,
                profilePhoto: studentProfile.profilePhoto
            } : null
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// Verify token middleware
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or user not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
    try {
        let studentProfile = null;
        if (req.user.role === 'student') {
            studentProfile = await Student.findOne({ userId: req.user._id });
        }

        res.json({
            success: true,
            user: {
                id: req.user._id,
                email: req.user.email,
                role: req.user.role,
                lastLogin: req.user.lastLogin
            },
            student: studentProfile ? {
                id: studentProfile._id,
                fullName: studentProfile.fullName,
                studentId: studentProfile.studentId,
                college: studentProfile.college,
                profilePhoto: studentProfile.profilePhoto,
                attendanceStats: studentProfile.attendanceStats,
                status: studentProfile.status
            } : null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get user data',
            error: error.message
        });
    }
});

// Logout (optional - mainly for clearing client-side token)
router.post('/logout', authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// Change password
router.put('/change-password', [
    authMiddleware,
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;

        // Verify current password
        const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        req.user.password = newPassword;
        await req.user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to change password',
            error: error.message
        });
    }
});

module.exports = router