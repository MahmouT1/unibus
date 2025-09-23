import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { Attendance } from '../../../../lib/Attendance';

export async function POST(request) {
  try {
    await connectToDatabase();
    
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

    console.log('Database attendance registration request:', {
      studentName: studentData?.fullName,
      studentId: studentData?.id,
      studentEmail: studentData?.email,
      appointmentSlot,
      stationName
    });

    // Ensure proper text encoding for Arabic names
    const sanitizedStudentData = {
      ...studentData,
      fullName: studentData.fullName || 'Unknown Student',
      college: studentData.college || 'Not specified',
      major: studentData.major || 'Not specified'
    };

    // Check if attendance already exists for today and this slot
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check for duplicates by EXACT studentId AND email combination
    const existingAttendance = await Attendance.findOne({
      studentId: sanitizedStudentData.id,
      studentEmail: sanitizedStudentData.email,
      date: {
        $gte: today,
        $lt: tomorrow
      },
      appointmentSlot: appointmentSlot || 'first'
    });

    if (existingAttendance) {
      console.log('Duplicate attendance found in database:', {
        existingRecord: {
          id: existingAttendance._id,
          studentId: existingAttendance.studentId,
          studentEmail: existingAttendance.studentEmail,
          studentName: existingAttendance.studentName,
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
        message: 'Attendance already registered for this slot today',
        attendance: existingAttendance
      }, { status: 400 });
    }

    // Create new attendance record in database
    const attendanceRecord = new Attendance({
      studentId: sanitizedStudentData.id,
      studentName: sanitizedStudentData.fullName,
      studentEmail: sanitizedStudentData.email,
      studentPhone: sanitizedStudentData.phoneNumber,
      studentCollege: sanitizedStudentData.college,
      studentGrade: sanitizedStudentData.grade,
      studentMajor: sanitizedStudentData.major,
      studentAddress: sanitizedStudentData.address,
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

    console.log('Attendance registered successfully in database:', attendanceRecord._id);

    return NextResponse.json({
      success: true,
      message: 'Attendance registered successfully',
      attendance: attendanceRecord
    });

  } catch (error) {
    console.error('Database attendance registration error:', error);
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