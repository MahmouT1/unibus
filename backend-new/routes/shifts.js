const express = require('express');
const router = express.Router();
const { getDatabase } = require('../lib/mongodb-simple-connection');

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
      query.supervisorId = supervisorId;
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
    
    res.json({
      success: true,
      shifts: shifts
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
    
    const newShift = {
      id: Date.now().toString(),
      supervisorId,
      supervisorName: supervisorName || null,
      supervisorEmail: supervisorEmail || null,
      shiftStart: new Date(),
      startTime: new Date(), // Added for consistency
      status: 'open',
      createdAt: new Date(),
      totalScans: 0,
      attendanceRecords: [] // Initialize with empty array
    };
    
    // Save to database
    const result = await shiftsCollection.insertOne(newShift);
    console.log('✅ Shift created and saved to database:', result.insertedId);
    
    res.json({
      success: true,
      message: 'Shift opened successfully',
      shift: newShift
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
    
    // Update shift status to closed
    const result = await shiftsCollection.updateOne(
      { id: shiftId },
      { 
        $set: { 
          status: 'closed',
          shiftEnd: new Date(),
          endTime: new Date()
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

    const activeShift = await shiftsCollection.findOne({ id: shiftId, status: 'open' });
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

    // Locate student by email or studentId
    let student = null;
    if (data.email) student = await studentsCollection.findOne({ email: data.email.toLowerCase() });
    if (!student && data.studentId) student = await studentsCollection.findOne({ studentId: data.studentId });
    if (!student && data.email) student = await usersCollection.findOne({ email: data.email.toLowerCase(), role: 'student' });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found in the system.' });
    }

    // Prevent duplicates within current shift
    const duplicate = await attendanceCollection.findOne({
      shiftId: activeShift.id,
      studentEmail: (student.email || data.email || '').toLowerCase(),
      scanTime: { $gte: new Date(activeShift.shiftStart) }
    });
    if (duplicate) {
      return res.status(409).json({ success: false, message: 'Student already scanned for this shift.' });
    }

    const attendanceRecord = {
      shiftId: activeShift.id,
      supervisorId: supervisorId || activeShift.supervisorId,
      studentId: student.studentId || (student._id ? student._id.toString() : ''),
      studentName: student.fullName || student.name || data.fullName || data.name || 'Student',
      studentEmail: (student.email || data.email || '').toLowerCase(),
      scanTime: new Date(),
      location: location || 'Unknown',
      notes: notes || 'QR Scan',
      createdAt: new Date()
    };

    await attendanceCollection.insertOne(attendanceRecord);
    await shiftsCollection.updateOne(
      { id: activeShift.id },
      { $inc: { totalScans: 1 }, $push: { attendanceRecords: attendanceRecord } }
    );

    return res.json({ success: true, message: 'Attendance registered successfully', attendance: attendanceRecord, student: {
      id: student._id ? student._id.toString() : undefined,
      fullName: attendanceRecord.studentName,
      studentId: attendanceRecord.studentId,
      email: attendanceRecord.studentEmail
    }});
  } catch (error) {
    console.error('❌ QR Scan error:', error);
    res.status(500).json({ success: false, message: 'Failed to process QR scan', error: error.message });
  }
});

module.exports = router;
