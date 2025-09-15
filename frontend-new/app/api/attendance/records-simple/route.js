import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Attendance from '@/lib/Attendance.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const date = searchParams.get('date'); // Optional date filter

    console.log('Fetching attendance records from MongoDB');

    // Connect to MongoDB
    await connectDB();

    // Build query
    let query = {};
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    // Fetch attendance records from MongoDB
    const attendanceRecords = await Attendance.find(query)
      .sort({ checkInTime: -1 })
      .limit(limit);

    // Format the records to match the expected structure
    const formattedAttendance = attendanceRecords.map(record => ({
      _id: record._id,
      studentId: {
        _id: record.studentId || record._id,
        fullName: record.studentName || 'Unknown Student',
        studentId: record.studentId || 'N/A',
        college: record.studentCollege || 'N/A',
        email: record.studentEmail || 'N/A',
        phone: record.studentPhone || 'N/A',
        grade: record.studentGrade || 'N/A',
        major: record.studentMajor || 'N/A'
      },
      date: record.date,
      checkInTime: record.checkInTime,
      status: record.status,
      appointmentSlot: record.appointmentSlot,
      station: record.station,
      verified: record.verified,
      supervisorName: record.supervisorName
    }));

    console.log(`Found ${formattedAttendance.length} attendance records`);

    return NextResponse.json({
      success: true,
      attendance: formattedAttendance,
      total: formattedAttendance.length
    });
  } catch (error) {
    console.error('Attendance records error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch attendance records', error: error.message },
      { status: 500 }
    );
  }
}
