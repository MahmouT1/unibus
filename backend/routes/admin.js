// routes/admin.js
const express = require('express');
const User = require('../models/User');
const Student = require('../models/Student');
const Subscription = require('../models/Subscription');
const Attendance = require('../models/Attendance');
const SupportTicket = require('../models/SupportTicket');
const authMiddleware = require('../middleware/auth');
const adminRouter = express.Router();

// Admin middleware
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admins only.'
        });
    }
    next();
};

// Dashboard statistics
adminRouter.get('/dashboard/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get basic counts
        const totalStudents = await Student.countDocuments();
        const activeSubscriptions = await Subscription.countDocuments({ status: 'Active' });
        const todayAttendance = await Attendance.countDocuments({
            date: { $gte: today, $lt: tomorrow }
        });

        // Calculate today's attendance rate
        const todayAttendanceRate = totalStudents > 0 ?
            Math.round((todayAttendance / totalStudents) * 100) : 0;

        // Get pending items
        const pendingSubscriptions = await Subscription.countDocuments({ status: 'Pending' });
        const openTickets = await SupportTicket.countDocuments({ status: 'open' });

        // Revenue this month
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthlyRevenue = await Subscription.aggregate([
            {
                $match: {
                    'paymentHistory.paymentDate': { $gte: startOfMonth },
                    'paymentHistory.status': 'completed'
                }
            },
            {
                $unwind: '$paymentHistory'
            },
            {
                $match: {
                    'paymentHistory.paymentDate': { $gte: startOfMonth },
                    'paymentHistory.status': 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$paymentHistory.amount' }
                }
            }
        ]);

        const totalRevenue = monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0;

        // Recent activities
        const recentStudents = await Student.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('fullName studentId college createdAt');

        const recentTickets = await SupportTicket.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('studentId', 'fullName studentId')
            .select('subject category priority status createdAt');

        res.json({
            success: true,
            stats: {
                totalStudents,
                activeSubscriptions,
                todayAttendanceRate,
                pendingSubscriptions,
                openTickets,
                monthlyRevenue: totalRevenue
            },
            recent: {
                students: recentStudents,
                tickets: recentTickets
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get dashboard statistics',
            error: error.message
        });
    }
});

// Get all students with pagination and filters
adminRouter.get('/students', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            college,
            status,
            academicYear
        } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { studentId: { $regex: search, $options: 'i' } }
            ];
        }

        if (college) {
            query.college = college;
        }

        if (status) {
            query.status = status;
        }

        if (academicYear) {
            query.academicYear = academicYear;
        }

        const students = await Student.find(query)
            .populate('userId', 'email lastLogin')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Student.countDocuments(query);

        res.json({
            success: true,
            students,
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
            message: 'Failed to get students',
            error: error.message
        });
    }
});

// Get student details by ID
adminRouter.get('/students/:studentId', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findById(studentId)
            .populate('userId', 'email lastLogin createdAt');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Get subscription info
        const subscription = await Subscription.findOne({ studentId: student._id })
            .sort({ createdAt: -1 });

        // Get recent attendance
        const recentAttendance = await Attendance.find({ studentId: student._id })
            .sort({ date: -1 })
            .limit(10)
            .populate('supervisorId', 'email');

        res.json({
            success: true,
            student,
            subscription,
            recentAttendance
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get student details',
            error: error.message
        });
    }
});

// Update student status
adminRouter.put('/students/:studentId/status', [
    authMiddleware,
    adminMiddleware
], async (req, res) => {
    try {
        const { studentId } = req.params;
        const { status } = req.body;

        if (!['Active', 'Low Days', 'Critical', 'Inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const student = await Student.findByIdAndUpdate(
            studentId,
            { status },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            message: 'Student status updated successfully',
            student
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update student status',
            error: error.message
        });
    }
});

// Get support tickets
adminRouter.get('/support-tickets', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            category,
            priority
        } = req.query;

        const query = {};
        if (status) query.status = status;
        if (category) query.category = category;
        if (priority) query.priority = priority;

        const tickets = await SupportTicket.find(query)
            .populate('studentId', 'fullName studentId')
            .populate('assignedTo', 'email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await SupportTicket.countDocuments(query);

        res.json({
            success: true,
            tickets,
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
            message: 'Failed to get support tickets',
            error: error.message
        });
    }
});

// Update support ticket status
adminRouter.put('/support-tickets/:ticketId', [
    authMiddleware,
    adminMiddleware
], async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { status, assignedTo, response } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (assignedTo) updateData.assignedTo = assignedTo;

        if (response) {
            updateData.$push = {
                responses: {
                    responderId: req.user._id,
                    message: response,
                    responseDate: new Date()
                }
            };
        }

        const ticket = await SupportTicket.findByIdAndUpdate(
            ticketId,
            updateData,
            { new: true }
        ).populate('studentId', 'fullName studentId');

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Support ticket not found'
            });
        }

        res.json({
            success: true,
            message: 'Support ticket updated successfully',
            ticket
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update support ticket',
            error: error.message
        });
    }
});

// Generate reports
adminRouter.get('/reports/:reportType', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { reportType } = req.params;
        const { startDate, endDate } = req.query;

        const dateQuery = {};
        if (startDate || endDate) {
            dateQuery.createdAt = {};
            if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
            if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
        }

        let reportData = {};

        switch (reportType) {
            case 'revenue':
                reportData = await Subscription.aggregate([
                    { $match: dateQuery },
                    {
                        $unwind: '$paymentHistory'
                    },
                    {
                        $match: {
                            'paymentHistory.status': 'completed'
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: '$paymentHistory.paymentDate' },
                                month: { $month: '$paymentHistory.paymentDate' }
                            },
                            totalRevenue: { $sum: '$paymentHistory.amount' },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { '_id.year': 1, '_id.month': 1 } }
                ]);
                break;

            case 'attendance':
                reportData = await Attendance.aggregate([
                    { $match: dateQuery },
                    {
                        $group: {
                            _id: {
                                year: { $year: '$date' },
                                month: { $month: '$date' },
                                day: { $dayOfMonth: '$date' }
                            },
                            present: {
                                $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
                            },
                            late: {
                                $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] }
                            },
                            absent: {
                                $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
                            }
                        }
                    },
                    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
                ]);
                break;

            case 'students':
                reportData = await Student.aggregate([
                    { $match: dateQuery },
                    {
                        $group: {
                            _id: '$college',
                            count: { $sum: 1 },
                            activeCount: {
                                $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
                            }
                        }
                    }
                ]);
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid report type'
                });
        }

        res.json({
            success: true,
            reportType,
            data: reportData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to generate report',
            error: error.message
        });
    }
});

module.exports = adminRouter;