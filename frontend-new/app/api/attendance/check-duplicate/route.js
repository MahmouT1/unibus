import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-simple-connection';

export async function POST(request) {
  try {
    const body = await request.json();
    const { studentId, appointmentSlot, date } = body;

    if (!studentId || !appointmentSlot) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: studentId and appointmentSlot'
      }, { status: 400 });
    }

    const db = await getDatabase();
    const attendanceCollection = db.collection('attendance');

    // Parse the date and create date range for today
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Check for existing attendance
    const existingAttendance = await attendanceCollection.findOne({
      $or: [
        { studentId: studentId },
        { 'studentData.id': studentId },
        { 'qrData.id': studentId }
      ],
      appointmentSlot: appointmentSlot,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    return NextResponse.json({
      success: true,
      exists: !!existingAttendance,
      attendance: existingAttendance || null
    });

  } catch (error) {
    console.error('Error checking duplicate attendance:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check for duplicate attendance'
    }, { status: 500 });
  }
}
