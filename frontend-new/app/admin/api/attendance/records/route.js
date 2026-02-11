import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const { getDatabase } = await import('../../../../../lib/mongodb-simple-connection');
    const db = await getDatabase();
    const attendanceCollection = db.collection('attendance');
    const shiftsCollection = db.collection('shifts');

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const date = searchParams.get('date');
    const supervisorId = searchParams.get('supervisorId');
    const shiftId = searchParams.get('shiftId');
    const sortParam = (searchParams.get('sort') || 'desc').toLowerCase();

    console.log('=== Admin Attendance Records API ===');
    console.log('Date:', date, 'SupervisorId:', supervisorId, 'ShiftId:', shiftId);

    // Build query
    const query = {};

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.scanTime = { $gte: startOfDay, $lte: endOfDay };
    }

    if (supervisorId) {
      try { 
        query.supervisorId = new ObjectId(supervisorId); 
      } catch (_) { 
        query.supervisorId = supervisorId; 
      }
    }

    if (shiftId) {
      query.shiftId = shiftId;
    }

    const sortOrder = sortParam === 'asc' ? 1 : -1;

    // Get attendance records
    const attendanceRecords = await attendanceCollection
      .find(query)
      .sort({ scanTime: sortOrder })
      .limit(limit)
      .toArray();

    console.log(`Found ${attendanceRecords.length} attendance records`);

    // If no records found and we have a date, try to get from shifts collection
    if (attendanceRecords.length === 0 && date) {
      const shiftQuery = {};
      
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        shiftQuery.$or = [
          { shiftStart: { $gte: startOfDay, $lte: endOfDay } },
          { date: { $gte: startOfDay, $lte: endOfDay } }
        ];
      }

      if (supervisorId) {
        try { 
          shiftQuery.supervisorId = new ObjectId(supervisorId); 
        } catch (_) { 
          shiftQuery.supervisorId = supervisorId; 
        }
      }

      const shifts = await shiftsCollection.find(shiftQuery).toArray();
      
      // Extract attendance records from shifts
      const shiftRecords = [];
      for (const shift of shifts) {
        if (shift.attendanceRecords && shift.attendanceRecords.length > 0) {
          for (const record of shift.attendanceRecords) {
            shiftRecords.push({
              ...record,
              _id: record._id || `${shift._id}_${record.studentEmail}_${record.scanTime}`,
              shiftId: shift._id.toString(),
              supervisorId: shift.supervisorId?.toString() || record.supervisorId,
              shiftStart: shift.shiftStart,
              shiftEnd: shift.shiftEnd,
              shiftStatus: shift.status
            });
          }
        }
      }

      console.log(`Found ${shiftRecords.length} records from shifts collection`);
      
      return NextResponse.json({
        success: true,
        attendance: shiftRecords.sort((a, b) => new Date(b.scanTime) - new Date(a.scanTime)),
        total: shiftRecords.length,
        source: 'shifts'
      });
    }

    return NextResponse.json({
      success: true,
      attendance: attendanceRecords,
      total: attendanceRecords.length,
      source: 'attendance'
    });

  } catch (error) {
    console.error('Admin attendance records error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch attendance records', error: error.message },
      { status: 500 }
    );
  }
}
