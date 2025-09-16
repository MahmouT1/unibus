import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Student from '@/lib/Student.js';
import User from '@/lib/User.js';
import Attendance from '@/lib/Attendance.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { qrData, appointmentSlot, stationName, stationLocation, coordinates, supervisorId, supervisorName } = body;

    // Parse QR data
    const studentData = JSON.parse(qrData);
    console.log('QR Code scanned data:', studentData);

    // Connect to MongoDB
    await connectDB();

    // Find student in database to verify and get additional data
    const student = await Student.findById(studentData.id);
    const user = student ? await User.findById(student.userId) : null;

    // CRITICAL: Check for existing attendance record for this student today
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await Attendance.findOne({
      $or: [
        { studentId: studentData.id },
        { 'qrData.id': studentData.id }
      ],
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      appointmentSlot: appointmentSlot || 'first'
    });

    if (existingAttendance) {
      console.log('DUPLICATE ATTENDANCE DETECTED:', {
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
          studentId: studentData.id,
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

    // Create attendance record with real student data
    const attendanceRecord = new Attendance({
      studentId: studentData.id,
      studentName: studentData.fullName,
      studentEmail: studentData.email,
      studentPhone: studentData.phoneNumber,
      studentCollege: studentData.college,
      studentGrade: studentData.grade,
      studentMajor: studentData.major,
      studentAddress: studentData.address,
      date: new Date(),
      checkInTime: new Date(),
      status: 'Present',
      appointmentSlot: appointmentSlot || 'first',
      station: {
        name: stationName || 'Main Gate',
        location: stationLocation || 'University Entrance',
        coordinates: coordinates || '30.0444,31.2357'
      },
      qrScanned: true,
      supervisorId: supervisorId || 'supervisor-unknown',
      supervisorName: supervisorName || 'Supervisor',
      qrData: studentData,
      verified: !!student,
      userEmail: user ? user.email : null
    });

    await attendanceRecord.save();

    console.log('Attendance registered successfully:', {
      id: attendanceRecord._id,
      studentName: studentData.fullName,
      supervisorName: supervisorName,
      appointmentSlot: appointmentSlot
    });

    return NextResponse.json({
      success: true,
      message: 'Attendance registered successfully',
      attendance: attendanceRecord
    });
  } catch (error) {
    console.error('QR scan attendance error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to register attendance' },
      { status: 500 }
    );
  }
}
