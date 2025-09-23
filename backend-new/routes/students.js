// routes/students.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const QRCode = require('qrcode');
const { MongoClient, ObjectId } = require('mongodb');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Get student profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Students only.'
            });
        }

        const student = await Student.findOne({ userId: req.user._id })
            .populate('userId', 'email lastLogin');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        res.json({
            success: true,
            student
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get student profile',
            error: error.message
        });
    }
});

// Update student profile
router.put('/profile', [
    authMiddleware,
    body('fullName').optional().trim().notEmpty(),
    body('phoneNumber').optional().trim(),
    body('college').optional().trim(),
    body('major').optional().trim()
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

        if (req.user.role !== 'student') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Students only.'
            });
        }

        const updateData = req.body;

        // Remove undefined values
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        const student = await Student.findOneAndUpdate(
            { userId: req.user._id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            student
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
});



// Upload profile photo - Simple working version
router.post('/profile/photo', authMiddleware, (req, res, next) => {
    upload.single('profilePhoto')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        next();
    });
}, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Students only.'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const photoUrl = `/uploads/profiles/${req.file.filename}`;

        const student = await Student.findOneAndUpdate(
            { userId: req.user._id },
            { profilePhoto: photoUrl },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        res.json({
            success: true,
            message: 'Photo uploaded successfully',
            photoUrl: photoUrl
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to upload photo',
            error: error.message
        });
    }
});

// Generate QR Code for student
router.post('/generate-qr', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Students only.'
            });
        }

        const student = await Student.findOne({ userId: req.user._id });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        // Create QR code data
        const qrData = {
            studentId: student.studentId,
            id: student._id,
            name: student.fullName,
            college: student.college,
            timestamp: new Date().toISOString()
        };

        // Generate QR code
        const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));

        // Update student with QR code
        student.qrCode = qrCodeDataURL;
        await student.save();

        res.json({
            success: true,
            message: 'QR code generated successfully',
            qrCode: qrCodeDataURL
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to generate QR code',
            error: error.message
        });
    }
});

// Get student attendance records
router.get('/attendance', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Students only.'
            });
        }

        const student = await Student.findOne({ userId: req.user._id });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        const { page = 1, limit = 10, startDate, endDate } = req.query;

        const query = { studentId: student._id };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const attendanceRecords = await Attendance.find(query)
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('supervisorId', 'email');

        const total = await Attendance.countDocuments(query);

        res.json({
            success: true,
            attendance: attendanceRecords,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get attendance records',
            error: error.message
        });
    }
});

// Submit support ticket
router.post('/support', [
    authMiddleware,
    body('category').isIn(['emergency', 'general', 'academic', 'technical', 'billing']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('subject').trim().notEmpty(),
    body('description').trim().isLength({ min: 20 })
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

        if (req.user.role !== 'student') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Students only.'
            });
        }

        const student = await Student.findOne({ userId: req.user._id });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        const { category, priority, subject, description } = req.body;

        const supportTicket = new SupportTicket({
            studentId: student._id,
            email: req.user.email,
            category,
            priority,
            subject,
            description
        });

        await supportTicket.save();

        res.status(201).json({
            success: true,
            message: 'Support ticket submitted successfully',
            ticket: supportTicket
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to submit support ticket',
            error: error.message
        });
    }
});

// Get student support tickets
router.get('/support', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Students only.'
            });
        }

        const student = await Student.findOne({ userId: req.user._id });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        const tickets = await SupportTicket.find({ studentId: student._id })
            .sort({ createdAt: -1 })
            .populate('assignedTo', 'email');

        res.json({
            success: true,
            tickets
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get support tickets',
            error: error.message
        });
    }
});

module.exports = router;