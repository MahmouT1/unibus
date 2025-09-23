import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { Attendance } from '../../../../lib/Attendance';

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || 50;
    const date = searchParams.get('date'); // Optional date filter

    console.log('Fetching attendance records from database');

    // Build query
    let query = {};
    
    // Filter by date if provided
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

    // Fetch attendance records from database
    const attendanceRecords = await Attendance.find(query)
      .sort({ checkInTime: -1 }) // Sort by check-in time (newest first)
      .limit(parseInt(limit));

    console.log(`Found ${attendanceRecords.length} attendance records in database`);

    return NextResponse.json({
      success: true,
      attendance: attendanceRecords,
      total: attendanceRecords.length
    });
  } catch (error) {
    console.error('Database attendance records error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch attendance records', error: error.message },
      { status: 500 }
    );
  }
}