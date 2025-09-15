import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Student from '@/lib/Student.js';
import User from '@/lib/User.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { qrData, appointmentSlot, stationName, stationLocation, coordinates } = body;

    // Parse QR data
    const studentData = JSON.parse(qrData);
    console.log('QR Code scanned data:', studentData);

    // Connect to MongoDB
    await connectDB();

    // Find student in database to verify and get additional data
    const student = await Student.findById(studentData.id);
    const user = student ? await User.findById(student.userId) : null;

    // Create attendance record with real student data
    const attendanceRecord = {
      _id: 'new-attendance-' + Date.now(),
      studentId: studentData.id,
      studentName: studentData.fullName,
      studentEmail: studentData.email,
      studentPhone: studentData.phoneNumber,
      studentCollege: studentData.college,
      studentGrade: studentData.grade,
      studentMajor: studentData.major,
      studentAddress: studentData.address,
      date: new Date().toISOString(),
      checkInTime: new Date().toISOString(),
      status: 'Present',
      appointmentSlot,
      stationName,
      stationLocation,
      coordinates,
      qrData: studentData, // Store the complete QR data for reference
      verified: !!student, // Mark if student was found in database
      userEmail: user ? user.email : null
    };

    console.log('Attendance registered:', attendanceRecord);

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
