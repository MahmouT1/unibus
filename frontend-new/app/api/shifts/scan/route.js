import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-simple-connection';
import { ObjectId } from 'mongodb';
import connectDB from '@/lib/mongodb';
import Attendance from '@/lib/Attendance';

// POST - Scan QR code and add attendance record
export async function POST(request) {
  try {
    const db = await getDatabase();
    const shiftsCollection = db.collection('shifts');
    const studentsCollection = db.collection('students');
    
    const body = await request.json();
    const { shiftId, qrCodeData, location, notes } = body;

    console.log('=== DEBUG: Scan API called ===');
    console.log('Request body:', body);

    if (!shiftId || !qrCodeData) {
      return NextResponse.json({
        success: false,
        message: 'Shift ID and QR code data are required'
      }, { status: 400 });
    }

    // Find the shift
    const shift = await shiftsCollection.findOne({ 
      _id: new ObjectId(shiftId),
      status: 'open'
    });

    if (!shift) {
      return NextResponse.json({
        success: false,
        message: 'Shift not found or not open'
      }, { status: 404 });
    }

    // Parse QR code data to get student information
    let studentData;
    try {
      // Try to parse as JSON first (from supervisor dashboard)
      let parsedQrData;
      try {
        parsedQrData = JSON.parse(qrCodeData);
      } catch (jsonError) {
        // If not JSON, treat as simple string (email or studentId)
        parsedQrData = qrCodeData;
      }

      console.log('Parsed QR data:', parsedQrData);
      console.log('Type of parsed QR data:', typeof parsedQrData);

      // Find student by different methods
      if (typeof parsedQrData === 'object' && parsedQrData.email) {
        // QR code contains JSON with email
        console.log('Looking up student by email:', parsedQrData.email);
        studentData = await studentsCollection.findOne({ email: parsedQrData.email });
      } else if (typeof parsedQrData === 'object' && parsedQrData.studentId) {
        // QR code contains JSON with studentId
        console.log('Looking up student by studentId:', parsedQrData.studentId);
        studentData = await studentsCollection.findOne({ studentId: parsedQrData.studentId });
      } else if (typeof parsedQrData === 'object' && parsedQrData.id) {
        // QR code contains JSON with MongoDB _id
        console.log('Looking up student by MongoDB _id:', parsedQrData.id);
        studentData = await studentsCollection.findOne({ _id: new ObjectId(parsedQrData.id) });
      } else if (typeof parsedQrData === 'string' && parsedQrData.includes('@')) {
        // QR code contains email string
        console.log('Looking up student by email string:', parsedQrData);
        studentData = await studentsCollection.findOne({ email: parsedQrData });
      } else if (typeof parsedQrData === 'string') {
        // QR code contains studentId string
        console.log('Looking up student by studentId string:', parsedQrData);
        studentData = await studentsCollection.findOne({ studentId: parsedQrData });
      }

      console.log('Found student data:', studentData);
    } catch (parseError) {
      console.error('Error parsing QR code data:', parseError);
      return NextResponse.json({
        success: false,
        message: 'Invalid QR code format'
      }, { status: 400 });
    }

    if (!studentData) {
      return NextResponse.json({
        success: false,
        message: 'Student not found'
      }, { status: 404 });
    }

    // CRITICAL: Check if student already scanned in ANY shift today (not just this shift)
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Check all shifts for today to see if student was already scanned
    const allTodayShifts = await shiftsCollection.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: 'open'
    }).toArray();

    let existingRecord = null;
    let existingShift = null;

    // Check if student was already scanned in any shift today
    for (const todayShift of allTodayShifts) {
      const record = todayShift.attendanceRecords.find(record => {
        return record.studentEmail === studentData.email;
      });
      
      if (record) {
        existingRecord = record;
        existingShift = todayShift;
        break;
      }
    }

    if (existingRecord && existingShift) {
      console.log('DUPLICATE ATTENDANCE DETECTED IN SHIFT SYSTEM:', {
        studentEmail: studentData.email,
        studentName: studentData.fullName,
        existingRecord: existingRecord,
        existingShiftId: existingShift._id.toString(),
        existingSupervisor: existingShift.supervisorName,
        currentShiftId: shiftId,
        currentSupervisor: shift.supervisorName
      });
      
      return NextResponse.json({
        success: false,
        message: `Student ${studentData.fullName} has already been scanned by ${existingShift.supervisorName} today.`,
        isDuplicate: true,
        existingRecord: {
          studentName: existingRecord.studentName,
          supervisorName: existingShift.supervisorName,
          scanTime: existingRecord.scanTime,
          shiftId: existingShift._id.toString()
        }
      }, { status: 409 });
    }

    // Add attendance record
    const attendanceRecord = {
      studentId: studentData._id,
      studentEmail: studentData.email,
      studentName: studentData.fullName,
      college: studentData.college,
      major: studentData.major,
      grade: studentData.grade,
      scanTime: new Date(),
      location: location || '',
      notes: notes || ''
    };

    console.log('=== Creating Shift Attendance Record ===');
    console.log('Student data for shift record:', {
      name: studentData.fullName,
      college: studentData.college,
      major: studentData.major,
      grade: studentData.grade
    });

    // Update shift with new attendance record
    const result = await shiftsCollection.updateOne(
      { _id: new ObjectId(shiftId) },
      { 
        $push: { attendanceRecords: attendanceRecord },
        $inc: { totalScans: 1 },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.modifiedCount === 0) {
      console.log('❌ Failed to update shift with attendance record');
      return NextResponse.json({
        success: false,
        message: 'Failed to update shift'
      }, { status: 500 });
    }

    console.log('✅ Shift updated successfully with attendance record');

    // Also create attendance record in Attendance collection for student search page
    try {
      console.log('=== Creating Attendance Record ===');
      console.log('Student ID:', studentData._id);
      console.log('Student Name:', studentData.fullName);
      
      await connectDB();
      console.log('Connected to database for attendance record creation');
      
      // Check if attendance record already exists for this specific shift
      // We'll use the shiftId as a unique identifier for this attendance record
      const shiftSpecificId = `${studentData._id}_${shiftId}_${new Date().toISOString().split('T')[0]}`;
      
      console.log('Checking for existing attendance with shift-specific ID:', shiftSpecificId);

      // Check if attendance record already exists for this specific shift
      // We'll use a combination of studentId and shiftId to make it unique per shift
      const existingAttendance = await Attendance.findOne({
        studentId: studentData._id,
        'station.name': location || 'Main Station',
        // Add shiftId to make it unique per shift
        'qrData.shiftId': shiftId
      });

      console.log('Existing attendance found for this shift:', !!existingAttendance);

      if (!existingAttendance) {
        console.log('Creating new attendance record...');
        
        // Create new attendance record in Attendance collection
        const newAttendance = new Attendance({
          studentId: studentData._id,
          studentName: studentData.fullName,
          studentEmail: studentData.email,
          studentPhone: studentData.phoneNumber,
          studentCollege: studentData.college,
          studentGrade: studentData.grade,
          studentMajor: studentData.major,
          studentAddress: studentData.address?.fullAddress || 'Not provided',
          date: new Date(),
          status: 'Present',
          checkInTime: new Date(),
          appointmentSlot: 'first', // Default slot
          station: {
            name: location || 'Main Station',
            location: 'University',
            coordinates: '30.0444,31.2357'
          },
          qrScanned: true,
          supervisorId: 'supervisor-001',
          supervisorName: 'Supervisor',
          qrData: {
            ...studentData,
            shiftId: shiftId  // Add shiftId to make it unique per shift
          },
          verified: true
        });

        const savedAttendance = await newAttendance.save();
        console.log('✅ Attendance record created successfully:', savedAttendance._id);
        console.log('Attendance record details:', {
          id: savedAttendance._id,
          studentId: savedAttendance.studentId,
          date: savedAttendance.date,
          status: savedAttendance.status
        });
      } else {
        console.log('⚠️ Attendance record already exists for today, skipping creation');
        console.log('Existing record ID:', existingAttendance._id);
      }
    } catch (attendanceError) {
      console.error('❌ Error creating attendance record in Attendance collection:', attendanceError);
      console.error('Error details:', {
        message: attendanceError.message,
        stack: attendanceError.stack
      });
      // Don't fail the main operation if attendance record creation fails
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance recorded successfully',
      attendanceRecord: {
        ...attendanceRecord,
        studentId: attendanceRecord.studentId.toString()
      },
      student: {
        id: studentData._id.toString(),
        fullName: studentData.fullName,
        email: studentData.email,
        studentId: studentData.studentId,
        college: studentData.college,
        grade: studentData.grade,
        major: studentData.major,
        profilePhoto: studentData.profilePhoto,
        phoneNumber: studentData.phoneNumber,
        address: studentData.address
      }
    });
  } catch (error) {
    console.error('Error scanning QR code:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to scan QR code',
      error: error.message
    }, { status: 500 });
  }
}
