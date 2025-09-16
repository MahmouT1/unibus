import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Attendance from '@/lib/Attendance.js';
import Student from '@/lib/Student.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      studentData, 
      appointmentSlot, 
      stationName, 
      stationLocation, 
      coordinates,
      supervisorId,
      supervisorName 
    } = body;

    console.log('Attendance registration request:', {
      studentName: studentData?.fullName,
      studentId: studentData?.id,
      studentEmail: studentData?.email,
      appointmentSlot,
      stationName
    });

    // Connect to MongoDB
    await connectDB();

    // Ensure proper text encoding for Arabic names
    const sanitizedStudentData = {
      ...studentData,
      fullName: studentData.fullName || 'Unknown Student',
      college: studentData.college || 'Not specified',
      major: studentData.major || 'Not specified'
    };

    // Find or create student record
    let student = await Student.findOne({ email: sanitizedStudentData.email });
    if (!student) {
      student = new Student({
        email: sanitizedStudentData.email,
        fullName: sanitizedStudentData.fullName,
        studentId: sanitizedStudentData.studentId || sanitizedStudentData.id,
        phoneNumber: sanitizedStudentData.phoneNumber,
        college: sanitizedStudentData.college,
        grade: sanitizedStudentData.grade,
        major: sanitizedStudentData.major,
        address: sanitizedStudentData.address,
        profilePhoto: sanitizedStudentData.profilePhoto
      });
      await student.save();
    }

    // Check if attendance already exists for today and this slot
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await Attendance.findOne({
      $or: [
        { studentId: student._id },
        { studentId: sanitizedStudentData.id },
        { 'qrData.id': sanitizedStudentData.id }
      ],
      date: {
        $gte: today,
        $lt: tomorrow
      },
      appointmentSlot: appointmentSlot
    });

    if (existingAttendance) {
      console.log('Duplicate attendance found:', {
        existingRecord: {
          id: existingAttendance._id,
          studentId: existingAttendance.studentId,
          studentEmail: student.email,
          studentName: student.fullName,
          date: existingAttendance.date,
          slot: existingAttendance.appointmentSlot
        },
        newRequest: {
          studentId: sanitizedStudentData.id,
          studentEmail: sanitizedStudentData.email,
          studentName: sanitizedStudentData.fullName,
          slot: appointmentSlot
        }
      });
      
      return NextResponse.json({
        success: false,
        message: `Student ${sanitizedStudentData.fullName} has already been scanned by ${existingAttendance.supervisorName || 'another supervisor'} for ${appointmentSlot || 'first'} slot today`,
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

    // Create new attendance record
    const attendanceRecord = new Attendance({
      studentId: student._id,
      date: new Date(),
      status: 'Present',
      checkInTime: new Date(),
      appointmentSlot: appointmentSlot || 'first',
      station: {
        name: stationName || 'Main Gate',
        location: stationLocation || 'University Entrance',
        coordinates: coordinates || '30.0444,31.2357'
      },
      qrScanned: true,
      supervisorId: supervisorId || 'supervisor-001',
      supervisorName: supervisorName || 'Supervisor',
      qrData: sanitizedStudentData,
      verified: true
    });

    await attendanceRecord.save();

    console.log('Attendance registered successfully:', attendanceRecord._id);

    return NextResponse.json({
      success: true,
      message: 'Attendance registered successfully',
      attendance: attendanceRecord
    });

  } catch (error) {
    console.error('Attendance registration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to register attendance', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
