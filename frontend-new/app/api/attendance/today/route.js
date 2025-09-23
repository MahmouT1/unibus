import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-simple-connection';

export async function GET() {
  try {
    // Fetch real attendance data from database
    const db = await getDatabase();
    const attendanceCollection = db.collection('attendance');
    
    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Query attendance records for today
    const records = await attendanceCollection.find({
      scanTime: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort({ scanTime: -1 }).toArray();

    return NextResponse.json({
      success: true,
      attendance: records
    });
  } catch (error) {
    console.error('Today attendance error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch today attendance' },
      { status: 500 }
    );
  }
}
