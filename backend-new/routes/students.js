// routes/students.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const QRCode = require('qrcode');
const { MongoClient, ObjectId } = require('mongodb');
const { getDatabase } = require('../lib/mongodb-simple-connection');
const authMiddleware = require('../middleware/auth-simple');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all students (for admin)
router.get('/profile-simple', async (req, res) => {
  try {
    const { admin, email } = req.query;
    const db = await getDatabase();
    const studentsCollection = db.collection('students');
    const usersCollection = db.collection('users');

    if (admin === 'true') {
      // Return all students for admin view
      const [studentsFromStudents, studentsFromUsers] = await Promise.all([
        studentsCollection.find({}).toArray(),
        usersCollection.find({ role: 'student' }).toArray()
      ]);
      
      // Combine and deduplicate students
      const allStudents = [...studentsFromStudents, ...studentsFromUsers];
      const uniqueStudents = allStudents.filter((student, index, self) => 
        index === self.findIndex(s => s.email === student.email)
      );
      
      // Convert to object format for compatibility
      const studentsObject = {};
      uniqueStudents.forEach(student => {
        studentsObject[student.email] = {
          id: student._id.toString(),
          fullName: student.fullName || student.name || 'Unknown',
          studentId: student.studentId || `STU-${student._id.toString().slice(-6)}`,
          phoneNumber: student.phoneNumber || student.phone || '',
          college: student.college || '',
          grade: student.grade || student.academicYear || '',
          major: student.major || '',
          academicYear: student.academicYear || student.grade || '',
          address: student.address || '',
          profilePhoto: student.profilePhoto || '',
          qrCode: student.qrCode || `QR-${student._id.toString().slice(-6)}`,
          attendanceStats: student.attendanceStats || { totalScans: 0, lastScanDate: null },
          status: student.status || 'active',
          email: student.email,
          updatedAt: student.updatedAt || new Date()
        };
      });
      
      return res.json({ 
        success: true, 
        students: studentsObject 
      });
    } else if (email) {
      // Return specific student by email
      const student = await studentsCollection.findOne({ email: email.toLowerCase() });
      
      if (student) {
        return res.json({ 
          success: true, 
          student: {
            id: student._id.toString(),
            fullName: student.fullName,
            studentId: student.studentId,
            phoneNumber: student.phoneNumber,
            college: student.college,
            grade: student.grade,
            major: student.major,
            academicYear: student.academicYear,
            address: student.address,
            profilePhoto: student.profilePhoto,
            qrCode: student.qrCode,
            attendanceStats: student.attendanceStats,
            status: student.status,
            email: student.email,
            updatedAt: student.updatedAt
          }
        });
      } else {
        return res.status(404).json({ 
          success: false, 
          message: 'Student not found' 
        });
      }
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Email or admin parameter is required' 
      });
    }
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch student profile', 
      error: error.message 
    });
  }
});

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

// Search students with attendance data
router.get('/search', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const db = await getDatabase();
    const studentsCollection = db.collection('students');
    const usersCollection = db.collection('users');
    const shiftsCollection = db.collection('shifts');

    console.log('🔍 Student search request:', { search, page, limit });

    // Build search query
    let searchQuery = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      searchQuery = {
        $or: [
          { fullName: searchRegex },
          { name: searchRegex },
          { email: searchRegex },
          { studentId: searchRegex },
          { college: searchRegex },
          { major: searchRegex },
          { grade: searchRegex }
        ]
      };
    }

    // Get students from both collections
    const [studentsFromStudents, studentsFromUsers] = await Promise.all([
      studentsCollection.find(searchQuery).toArray(),
      usersCollection.find({ ...searchQuery, role: 'student' }).toArray()
    ]);

    // Combine and deduplicate students
    const allStudents = [...studentsFromStudents, ...studentsFromUsers];
    const uniqueStudents = allStudents.filter((student, index, self) => 
      index === self.findIndex(s => (s.email && student.email && s.email === student.email) || 
                                   (s.studentId && student.studentId && s.studentId === student.studentId))
    );

    console.log(`📊 Found ${uniqueStudents.length} unique students`);

    // Calculate attendance for each student
    const studentsWithAttendance = await Promise.all(
      uniqueStudents.map(async (student) => {
        try {
          const studentEmail = (student.email || '').toLowerCase();
          const studentId = student.studentId || student._id?.toString() || '';
          
          // Get attendance from both shifts and attendance collection
          const [shifts, attendanceRecords] = await Promise.all([
            shiftsCollection.find({
              'attendanceRecords.studentEmail': studentEmail
            }).toArray(),
            db.collection('attendance').find({
              $or: [
                { studentEmail: studentEmail },
                { studentId: studentId }
              ]
            }).toArray()
          ]);

          const attendanceDates = new Set();

          // Process attendance from shifts collection
          shifts.forEach(shift => {
            if (shift.attendanceRecords) {
              shift.attendanceRecords.forEach(record => {
                if (record.studentEmail === studentEmail) {
                  const date = record.scanTime || record.checkInTime || shift.shiftStart;
                  if (date) {
                    const dateKey = new Date(date).toISOString().split('T')[0];
                    attendanceDates.add(dateKey);
                  }
                }
              });
            }
          });

          // Process attendance from attendance collection
          attendanceRecords.forEach(record => {
            const date = record.scanTime || record.checkInTime;
            if (date) {
              const dateKey = new Date(date).toISOString().split('T')[0];
              attendanceDates.add(dateKey);
            }
          });

          const attendanceCount = attendanceDates.size;

          console.log(`📊 Student ${student.fullName || student.name}: ${attendanceCount} attendance days`);

          return {
            _id: student._id,
            fullName: student.fullName || student.name || 'Unknown',
            email: student.email || '',
            studentId: student.studentId || `STU-${student._id.toString().slice(-6)}`,
            college: student.college || '',
            major: student.major || '',
            grade: student.grade || student.academicYear || '',
            phoneNumber: student.phoneNumber || student.phone || '',
            profilePhoto: student.profilePhoto || '',
            attendanceCount: attendanceCount,
            status: student.status || 'active',
            createdAt: student.createdAt || new Date(),
            lastAttendance: attendanceDates.size > 0 ? Array.from(attendanceDates).sort().pop() : null,
            _debug: {
              attendanceDates: Array.from(attendanceDates).sort(),
              shiftsCount: shifts.length,
              attendanceRecordsCount: attendanceRecords.length
            }
          };
        } catch (error) {
          console.error(`Error calculating attendance for student ${student._id}:`, error);
          return {
            ...student,
            attendanceCount: 0,
            lastAttendance: null
          };
        }
      })
    );

    // Sort by attendance count (highest first), then by name
    studentsWithAttendance.sort((a, b) => {
      if (b.attendanceCount !== a.attendanceCount) {
        return b.attendanceCount - a.attendanceCount;
      }
      return (a.fullName || '').localeCompare(b.fullName || '');
    });

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedStudents = studentsWithAttendance.slice(skip, skip + parseInt(limit));
    const totalStudents = studentsWithAttendance.length;
    const totalPages = Math.ceil(totalStudents / parseInt(limit));

    console.log(`📄 Returning page ${page}/${totalPages} with ${paginatedStudents.length} students`);

    res.json({
      success: true,
      data: {
        students: paginatedStudents,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalStudents,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('❌ Student search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search students',
      error: error.message
    });
  }
});

// POST /search - Get single student with full attendance records (for eye button modal)
router.post('/search', async (req, res) => {
  try {
    const { _id, studentId, email } = req.body;
    const lookupId = _id || studentId;
    if (!lookupId && !email) {
      return res.status(400).json({ success: false, message: 'Student ID or email is required' });
    }
    const db = await getDatabase();
    const studentsCollection = db.collection('students');
    const usersCollection = db.collection('users');
    const shiftsCollection = db.collection('shifts');
    const attendanceCollection = db.collection('attendance');
    let student = null;
    if (lookupId) {
      try {
        student = await studentsCollection.findOne({ _id: new ObjectId(lookupId) });
        if (!student) student = await usersCollection.findOne({ _id: new ObjectId(lookupId), role: 'student' });
      } catch (e) {}
    }
    if (!student && email) {
      const em = (email || '').toLowerCase();
      student = await studentsCollection.findOne({ email: em });
      if (!student) student = await usersCollection.findOne({ email: em, role: 'student' });
    }
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const studentEmail = (student.email || '').toLowerCase();
    const studentName = (student.fullName || student.name || '').toLowerCase();
    const studentStuId = (student.studentId || '').toString();
    const allRecords = [];
    const seenIds = new Set();
    const shifts = await shiftsCollection.find({ status: { $in: ['closed', 'open'] } }).toArray();
    for (const shift of shifts) {
      if (shift.attendanceRecords && shift.attendanceRecords.length > 0) {
        for (const record of shift.attendanceRecords) {
          const recId = `${shift._id}_${record.studentEmail}_${record.scanTime}`;
          if (seenIds.has(recId)) continue;
          seenIds.add(recId);
          const rEmail = (record.studentEmail || record.email || '').toLowerCase();
          const rName = (record.studentName || '').toLowerCase();
          const rId = (record.studentId || '').toString();
          const match = (studentEmail && rEmail === studentEmail) ||
            (studentStuId && studentStuId !== 'N/A' && rId === studentStuId) ||
            (studentName && rName && (rName.includes(studentName) || studentName.includes(rName)));
          if (match) {
            allRecords.push({
              studentName: record.studentName,
              studentEmail: record.studentEmail || record.email,
              college: record.college || 'N/A',
              scanTime: record.scanTime,
              checkInTime: record.checkInTime || record.scanTime,
              status: 'Present'
            });
          }
        }
      }
    }
    const attendanceDocs = await attendanceCollection.find({}).limit(5000).toArray();
    for (const doc of attendanceDocs) {
      const scanTime = doc.scanTime || doc.checkInTime || doc.createdAt;
      const rEmail = (doc.studentEmail || doc.studentInfo?.email || '').toLowerCase();
      const rId = (doc.studentId || doc.studentInfo?.studentId || '').toString();
      const rName = (doc.studentName || doc.studentInfo?.fullName || '').toLowerCase();
      const match = (studentEmail && rEmail === studentEmail) ||
        (studentStuId && studentStuId !== 'N/A' && rId === studentStuId) ||
        (studentName && rName && (rName.includes(studentName) || studentName.includes(rName)));
      if (match && scanTime) {
        const recId = `att_${doc._id}_${rEmail}_${scanTime}`;
        if (seenIds.has(recId)) continue;
        seenIds.add(recId);
        allRecords.push({
          studentName: doc.studentName || doc.studentInfo?.fullName || '',
          studentEmail: doc.studentEmail || doc.studentInfo?.email || '',
          college: doc.college || doc.studentInfo?.college || 'N/A',
          scanTime,
          checkInTime: scanTime,
          status: 'Present'
        });
      }
    }
    allRecords.sort((a, b) => new Date(b.scanTime || b.checkInTime) - new Date(a.scanTime || a.checkInTime));
    return res.json({
      success: true,
      data: {
        student: {
          _id: student._id.toString(),
          fullName: student.fullName || student.name || 'Unknown',
          email: student.email || '',
          studentId: student.studentId || 'N/A',
          college: student.college || 'N/A',
          major: student.major || 'N/A',
          grade: student.grade || 'N/A'
        },
        attendance: {
          records: allRecords,
          totalAttendance: allRecords.length,
          lastAttendance: allRecords.length > 0 ? allRecords[0] : null
        }
      }
    });
  } catch (error) {
    console.error('POST /search error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student details', error: error.message });
  }
});

// Get student attendance records
router.get('/attendance', authMiddleware, async (req, res) => {
    try {
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