const express = require('express');
const router = express.Router();
const { getDatabase } = require('../lib/mongodb-simple-connection');
const { ObjectId } = require('mongodb');

// Get shifts
router.get('/', async (req, res) => {
  try {
    const { supervisorId, status, date, limit } = req.query;
    
    console.log('🔍 Getting shifts:', { supervisorId, status, date, limit });
    
    const db = await getDatabase();
    const shiftsCollection = db.collection('shifts');
    
    // Build query
    let query = {};
    
    if (supervisorId) {
      // Handle both string and ObjectId formats
      try {
        query.supervisorId = new ObjectId(supervisorId);
      } catch (e) {
        query.supervisorId = supervisorId;
      }
    }
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.$or = [
        { shiftStart: { $gte: startOfDay, $lte: endOfDay } },
        { date: { $gte: startOfDay, $lte: endOfDay } }
      ];
    }
    
    console.log('Query:', query);
    
    // Get shifts from database
    const shifts = await shiftsCollection.find(query)
      .sort({ shiftStart: -1 })
      .limit(parseInt(limit) || 50)
      .toArray();
    
    console.log(`Found ${shifts.length} shifts`);
    
    // Format shifts for frontend compatibility
    const formattedShifts = shifts.map(shift => ({
      ...shift,
      id: shift._id.toString(),
      supervisorId: shift.supervisorId ? shift.supervisorId.toString() : shift.supervisorId
    }));
    
    res.json({
      success: true,
      shifts: formattedShifts
    });
    
  } catch (error) {
    console.error('❌ Get shifts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get shifts'
    });
  }
});

// Create new shift
router.post('/', async (req, res) => {
  try {
    const { supervisorId, supervisorName, supervisorEmail } = req.body;
    
    console.log('🔄 Creating new shift:', { supervisorId, supervisorName, supervisorEmail });
    
    const db = await getDatabase();
    const shiftsCollection = db.collection('shifts');
    
    // Check for existing open shift
    const existingShift = await shiftsCollection.findOne({
      supervisorId: new ObjectId(supervisorId),
      status: 'open'
    });
    
    if (existingShift) {
      return res.status(400).json({
        success: false,
        message: 'Supervisor already has an open shift. Please close it first.'
      });
    }
    
    const newShift = {
      supervisorId: new ObjectId(supervisorId),
      supervisorName: supervisorName || null,
      supervisorEmail: supervisorEmail || null,
      shiftStart: new Date(),
      startTime: new Date(), // Added for consistency
      date: new Date(),
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      totalScans: 0,
      attendanceRecords: [] // Initialize with empty array
    };
    
    // Save to database
    const result = await shiftsCollection.insertOne(newShift);
    console.log('✅ Shift created and saved to database:', result.insertedId);
    
    res.json({
      success: true,
      message: 'Shift opened successfully',
      shift: {
        ...newShift,
        id: result.insertedId.toString(),
        supervisorId: newShift.supervisorId.toString()
      }
    });
    
  } catch (error) {
    console.error('❌ Create shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create shift'
    });
  }
});

// Close shift
router.post('/close', async (req, res) => {
  try {
    const { shiftId, supervisorId } = req.body;
    
    console.log('🔄 Closing shift:', { shiftId, supervisorId });
    
    const db = await getDatabase();
    const shiftsCollection = db.collection('shifts');
    
    // Update shift status to closed - handle both id formats
    let query = {};
    try {
      query = { _id: new ObjectId(shiftId) };
    } catch (e) {
      query = { id: shiftId };
    }
    
    const result = await shiftsCollection.updateOne(
      query,
      { 
        $set: { 
          status: 'closed',
          shiftEnd: new Date(),
          endTime: new Date(),
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found'
      });
    }
    
    console.log('✅ Shift closed successfully');
    
    res.json({
      success: true,
      message: 'Shift closed successfully'
    });
    
  } catch (error) {
    console.error('❌ Close shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close shift'
    });
  }
});

// Scan QR code
router.post('/scan', async (req, res) => {
  try {
    const { qrCodeData, qrData, supervisorId, shiftId, location, notes } = req.body;
    const payload = qrCodeData || qrData;
    console.log('📱 QR Scan request:', { hasPayload: !!payload, supervisorId, shiftId });

    if (!payload || !shiftId) {
      return res.status(400).json({ success: false, message: 'Missing qrCodeData or shiftId' });
    }

    const db = await getDatabase();
    const shiftsCollection = db.collection('shifts');
    const attendanceCollection = db.collection('attendance');
    const studentsCollection = db.collection('students');
    const usersCollection = db.collection('users');

    // Find active shift - handle both ObjectId and string formats
    let activeShift = null;
    try {
      activeShift = await shiftsCollection.findOne({ _id: new ObjectId(shiftId), status: 'open' });
    } catch (e) {
      activeShift = await shiftsCollection.findOne({ id: shiftId, status: 'open' });
    }
    
    if (!activeShift) {
      return res.status(400).json({ success: false, message: 'No active shift found with this ID.' });
    }

    // Parse QR data
    let data = null;
    try {
      data = typeof payload === 'string' ? JSON.parse(payload) : payload;
    } catch (_) {
      if (typeof payload === 'string') {
        if (/^STU-\d+$/.test(payload) || /^\d+$/.test(payload)) data = { studentId: payload };
      }
    }
    if (!data) {
      return res.status(400).json({ success: false, message: 'Invalid QR code data format.' });
    }

    // Locate student by email or studentId - check both collections thoroughly
    let student = null;
    
    console.log('🔍 Looking for student with data:', {
      email: data.email,
      studentId: data.studentId,
      fullName: data.fullName
    });
    
    // Try multiple lookup strategies
    
    // 1. Check students collection by email
    if (data.email && !student) {
      student = await studentsCollection.findOne({ email: data.email.toLowerCase() });
      if (student) console.log('✅ Found in students collection by email');
    }
    
    // 2. Check students collection by studentId
    if (data.studentId && !student) {
      student = await studentsCollection.findOne({ studentId: data.studentId });
      if (student) console.log('✅ Found in students collection by studentId');
    }
    
    // 3. Check users collection by email
    if (data.email && !student) {
      student = await usersCollection.findOne({ email: data.email.toLowerCase(), role: 'student' });
      if (student) console.log('✅ Found in users collection by email');
    }
    
    // 4. Check users collection by studentId (if it exists in users)
    if (data.studentId && !student) {
      student = await usersCollection.findOne({ studentId: data.studentId, role: 'student' });
      if (student) console.log('✅ Found in users collection by studentId');
    }
    
    // 5. Check users collection by fullName (fallback)
    if (data.fullName && !student) {
      student = await usersCollection.findOne({ 
        $or: [
          { fullName: data.fullName },
          { name: data.fullName }
        ],
        role: 'student' 
      });
      if (student) console.log('✅ Found in users collection by fullName');
    }
    
    if (student) {
      console.log('🎯 Student found:', {
        id: student._id,
        email: student.email,
        studentId: student.studentId,
        fullName: student.fullName || student.name,
        collection: student.role ? 'users' : 'students'
      });
    } else {
      console.log('❌ Student not found in either collection');
    }

    // If student not found, create a new student record automatically
    if (!student) {
      console.log('📝 Student not found, creating new student record...');
      
      const newStudent = {
        studentId: data.studentId || `STU-${Date.now()}`,
        fullName: data.fullName || data.name || 'Unknown Student',
        email: (data.email || '').toLowerCase(),
        phoneNumber: data.phoneNumber || '',
        college: data.college || '',
        grade: data.grade || '',
        major: data.major || '',
        address: data.address || '',
        profilePhoto: data.profilePhoto || '',
        status: 'active',
        createdAt: new Date(),
        createdBy: 'qr-scan-auto',
        attendanceStats: {
          totalScans: 0,
          lastScanDate: null,
          attendanceRate: 0
        }
      };

      try {
        const insertResult = await studentsCollection.insertOne(newStudent);
        student = { ...newStudent, _id: insertResult.insertedId };
        console.log('✅ New student created:', student.fullName, 'ID:', student.studentId);
      } catch (createError) {
        console.error('❌ Failed to create student:', createError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to create student record. Please try again.' 
        });
      }
    }

    // منع التكرار: كل طالب مسموح له مسحة واحدة فقط في اليوم الواحد
    const currentShiftId = activeShift._id ? activeShift._id.toString() : activeShift.id;
    const studentEmail = (student.email || data.email || '').toLowerCase();
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    const alreadyScannedToday = await attendanceCollection.findOne({
      studentEmail: studentEmail,
      scanTime: { $gte: startOfToday, $lte: endOfToday }
    });
    if (alreadyScannedToday) {
      return res.status(409).json({ success: false, message: 'تم تسجيل حضور هذا الطالب اليوم مسبقاً.' });
    }

    const attendanceRecord = {
      shiftId: currentShiftId,
      supervisorId: supervisorId || (activeShift.supervisorId ? activeShift.supervisorId.toString() : ''),
      studentId: student.studentId || (student._id ? student._id.toString() : ''),
      studentName: student.fullName || student.name || data.fullName || data.name || 'Student',
      studentEmail: studentEmail,
      college: student.college || data.college || '',
      major: student.major || data.major || '',
      grade: student.grade || data.grade || '',
      scanTime: new Date(),
      location: location || 'Main Station',
      notes: notes || 'QR Scan',
      createdAt: new Date()
    };

    // Insert into attendance collection
    await attendanceCollection.insertOne(attendanceRecord);
    
    // Update shift with attendance record - handle both ObjectId and string formats
    let updateQuery = {};
    try {
      updateQuery = { _id: new ObjectId(currentShiftId) };
    } catch (e) {
      updateQuery = { id: activeShift.id };
    }
    
    await shiftsCollection.updateOne(
      updateQuery,
      { 
        $inc: { totalScans: 1 }, 
        $push: { attendanceRecords: attendanceRecord },
        $set: { updatedAt: new Date() }
      }
    );

    console.log('✅ Attendance successfully saved to database');
    console.log('Attendance record:', attendanceRecord);
    console.log('Updated shift total scans:', activeShift.totalScans + 1);

    // Check if this was a newly created student
    const isNewStudent = student.createdBy === 'qr-scan-auto';
    const successMessage = isNewStudent 
      ? 'New student registered and attendance recorded successfully!' 
      : 'Attendance registered successfully';

    return res.json({ 
      success: true, 
      message: successMessage,
      isNewStudent: isNewStudent,
      attendance: attendanceRecord, 
      student: {
        id: student._id ? student._id.toString() : undefined,
        fullName: attendanceRecord.studentName,
        studentId: attendanceRecord.studentId,
        email: attendanceRecord.studentEmail,
        college: student.college,
        grade: student.grade,
        major: student.major
      }
    });
  } catch (error) {
    console.error('❌ QR Scan error:', error);
    res.status(500).json({ success: false, message: 'Failed to process QR scan', error: error.message });
  }
});

// Debug route to check attendance records
router.get('/debug-attendance', async (req, res) => {
  try {
    const db = await getDatabase();
    const attendanceCollection = db.collection('attendance');
    const shiftsCollection = db.collection('shifts');
    
    // Get recent attendance records
    const recentAttendance = await attendanceCollection.find({})
      .sort({ scanTime: -1 })
      .limit(10)
      .toArray();
    
    // Get recent shifts with attendance
    const recentShifts = await shiftsCollection.find({ status: { $in: ['open', 'closed'] } })
      .sort({ shiftStart: -1 })
      .limit(5)
      .toArray();
    
    return res.json({
      success: true,
      recentAttendance: recentAttendance,
      recentShifts: recentShifts.map(shift => ({
        id: shift._id,
        status: shift.status,
        totalScans: shift.totalScans || 0,
        attendanceRecordsCount: shift.attendanceRecords ? shift.attendanceRecords.length : 0,
        shiftStart: shift.shiftStart
      }))
    });
  } catch (error) {
    console.error('Debug attendance error:', error);
    return res.json({ success: false, error: error.message });
  }
});

module.exports = router;
