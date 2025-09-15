import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-simple-connection';

export async function GET() {
  try {
    const db = await getDatabase();
    const attendanceCollection = db.collection('attendance');

    // Get today's statistics
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Count today's attendance records
    const todayAttendance = await attendanceCollection.countDocuments({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    // Count by appointment slot
    const firstSlotCount = await attendanceCollection.countDocuments({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      appointmentSlot: 'first'
    });

    const secondSlotCount = await attendanceCollection.countDocuments({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      appointmentSlot: 'second'
    });

    // Get active supervisors (those who registered attendance today)
    const activeSupervisors = await attendanceCollection.distinct('supervisorId', {
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    // Get recent scans (last 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentScans = await attendanceCollection.countDocuments({
      scanTimestamp: {
        $gte: tenMinutesAgo
      }
    });

    // Get system health metrics
    const systemStatus = {
      isHealthy: true,
      totalTodayAttendance: todayAttendance,
      firstSlotAttendance: firstSlotCount,
      secondSlotAttendance: secondSlotCount,
      activeSupervisors: activeSupervisors.length,
      recentScans: recentScans,
      lastUpdated: new Date().toISOString(),
      serverTime: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      status: systemStatus
    });

  } catch (error) {
    console.error('Error getting system status:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to get system status',
      status: {
        isHealthy: false,
        error: error.message,
        lastUpdated: new Date().toISOString()
      }
    }, { status: 500 });
  }
}
