import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-simple-connection';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      studentId, 
      supervisorId, 
      supervisorName,
      qrData, 
      appointmentSlot, 
      stationInfo 
    } = body;

    if (!studentId || !supervisorId || !qrData) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    const db = await getDatabase();
    const attendanceCollection = db.collection('attendance');

    // Parse student data from QR code
    let studentData;
    try {
      studentData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Invalid QR code format'
      }, { status: 400 });
    }

    // CRITICAL: Check for existing attendance record for this student today
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await attendanceCollection.findOne({
      $or: [
        { studentId: studentId },
        { 'qrData.id': studentId }
      ],
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      appointmentSlot: appointmentSlot || 'first'
    });

    if (existingAttendance) {
      console.log('DUPLICATE ATTENDANCE DETECTED IN CONCURRENT SCAN:', {
        existingRecord: {
          id: existingAttendance._id,
          studentId: existingAttendance.studentId,
          studentName: existingAttendance.studentName,
          date: existingAttendance.date,
          slot: existingAttendance.appointmentSlot,
          supervisorId: existingAttendance.supervisorId,
          supervisorName: existingAttendance.supervisorName
        },
        newRequest: {
          studentId: studentId,
          studentName: studentData.fullName,
          slot: appointmentSlot,
          supervisorId: supervisorId,
          supervisorName: supervisorName
        }
      });

      return NextResponse.json({
        success: false,
        message: `Student ${studentData.fullName} has already been scanned by ${existingAttendance.supervisorName || 'another supervisor'} for ${appointmentSlot || 'first'} slot today`,
        isDuplicate: true,
        existingAttendance: {
          id: existingAttendance._id,
          studentName: existingAttendance.studentName,
          supervisorName: existingAttendance.supervisorName,
          checkInTime: existingAttendance.checkInTime,
          appointmentSlot: existingAttendance.appointmentSlot
        }
      }, { status: 409 });
    }

    // Create attendance record with atomic operation
    const attendanceRecord = {
      studentId: studentId,
      studentName: studentData.fullName || 'Unknown Student',
      studentEmail: studentData.email || '',
      studentPhone: studentData.phoneNumber || '',
      studentCollege: studentData.college || 'Not specified',
      studentGrade: studentData.grade || '',
      studentMajor: studentData.major || 'Not specified',
      studentAddress: studentData.address || '',
      date: new Date(),
      checkInTime: new Date(),
      status: 'Present',
      appointmentSlot: appointmentSlot || 'first',
      station: {
        name: stationInfo?.name || 'Main Gate',
        location: stationInfo?.location || 'University Entrance',
        coordinates: stationInfo?.coordinates || '30.0444,31.2357'
      },
      qrScanned: true,
      supervisorId: supervisorId,
      supervisorName: supervisorName || 'Supervisor',
      qrData: studentData,
      verified: true,
      scanTimestamp: new Date(),
      concurrentScanId: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Insert the attendance record
    const result = await attendanceCollection.insertOne(attendanceRecord);

    if (result.insertedId) {
      console.log('Concurrent attendance registered successfully:', {
        id: result.insertedId,
        studentId: studentId,
        studentName: studentData.fullName,
        supervisorId: supervisorId,
        appointmentSlot: appointmentSlot,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        message: 'Attendance registered successfully',
        attendance: {
          ...attendanceRecord,
          _id: result.insertedId
        }
      });
    } else {
      throw new Error('Failed to insert attendance record');
    }

  } catch (error) {
    console.error('Concurrent attendance registration error:', error);
    
    // Check if it's a duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        message: 'Attendance already registered for this student and slot',
        isDuplicate: true
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to register attendance'
    }, { status: 500 });
  }
}
