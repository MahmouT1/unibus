import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import connectDB from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const date = searchParams.get('date');
    const supervisorId = searchParams.get('supervisorId');
    
    console.log('=== Fetching All Attendance Records ===');
    console.log('Page:', page, 'Limit:', limit, 'Date:', date, 'Supervisor:', supervisorId);
    
    // Debug: Log the parsed date
    if (date) {
      const parsedDate = new Date(date);
      console.log('Parsed date:', parsedDate.toISOString());
      console.log('Date is valid:', !isNaN(parsedDate.getTime()));
    }

    const { getDatabase } = await import('../../../../lib/mongodb-simple-connection');
    const db = await getDatabase();

    // Build query for shifts - include both closed and open shifts
    let shiftQuery = { status: { $in: ['closed', 'open'] } };
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      console.log('Date filter range:', {
        startOfDay: startOfDay.toISOString(),
        endOfDay: endOfDay.toISOString()
      });
      
      // Check both shiftStart and date fields to find shifts
      shiftQuery.$or = [
        {
          shiftStart: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        },
        {
          date: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }
      ];
    }
    
    if (supervisorId) {
      shiftQuery.supervisorId = new ObjectId(supervisorId);
    }

    // Get shifts with attendance records
    const shiftsCollection = db.collection('shifts');
    const shifts = await shiftsCollection.find(shiftQuery).toArray();
    
    console.log('Found shifts:', shifts.length);
    console.log('Shift query:', JSON.stringify(shiftQuery, null, 2));
    
    // If no shifts found with date filter, try to get recent shifts (last 7 days)
    if (shifts.length === 0) {
      console.log('No shifts found for specified date, trying recent shifts...');
      const recentQuery = { 
        status: { $in: ['closed', 'open'] },
        $or: [
          { shiftStart: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
          { date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
        ]
      };
      
      if (supervisorId) {
        recentQuery.supervisorId = new ObjectId(supervisorId);
      }
      
      const recentShifts = await shiftsCollection.find(recentQuery).toArray();
      console.log('Found recent shifts:', recentShifts.length);
      
      if (recentShifts.length > 0) {
        shifts.push(...recentShifts);
      }
    }
    
    if (shifts.length > 0) {
      console.log('Sample shift details:', {
        id: shifts[0]._id.toString(),
        supervisorId: shifts[0].supervisorId.toString(),
        status: shifts[0].status,
        date: shifts[0].date,
        attendanceRecords: shifts[0].attendanceRecords?.length || 0,
        totalScans: shifts[0].totalScans || 0
      });
      
      // Debug: Log all shifts and their attendance records
      shifts.forEach((shift, index) => {
        console.log(`Shift ${index + 1}:`, {
          id: shift._id.toString(),
          status: shift.status,
          attendanceRecordsCount: shift.attendanceRecords?.length || 0,
          hasAttendanceRecords: !!shift.attendanceRecords && shift.attendanceRecords.length > 0
        });
      });
    }

    // Flatten all attendance records from all shifts
    let allRecords = [];
    
    for (const shift of shifts) {
      if (shift.attendanceRecords && shift.attendanceRecords.length > 0) {
        for (const record of shift.attendanceRecords) {
          allRecords.push({
            _id: `${shift._id}_${record.studentEmail}_${record.scanTime}`,
            studentName: record.studentName,
            studentEmail: record.studentEmail,
            studentId: record.studentId || 'N/A',
            college: record.college || 'N/A',
            major: record.major || 'N/A',
            grade: record.grade || 'N/A',
            scanTime: record.scanTime,
            location: record.location || 'Main Station',
            notes: record.notes || '',
            status: 'Present',
            // Shift information
            shiftId: shift._id,
            supervisorId: shift.supervisorId,
            supervisorName: shift.supervisorName || 'Unknown Supervisor',
            shiftStart: shift.shiftStart,
            shiftEnd: shift.shiftEnd,
            shiftStatus: shift.status, // Add shift status (open/closed)
            shiftDuration: shift.shiftEnd ? 
              Math.floor((new Date(shift.shiftEnd) - new Date(shift.shiftStart)) / (1000 * 60)) : 
              Math.floor((new Date() - new Date(shift.shiftStart)) / (1000 * 60))
          });
        }
      }
    }

    // Sort by scan time (newest first)
    allRecords.sort((a, b) => new Date(b.scanTime) - new Date(a.scanTime));

    // Calculate pagination
    const totalRecords = allRecords.length;
    const totalPages = Math.ceil(totalRecords / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRecords = allRecords.slice(startIndex, endIndex);

    console.log('Total records:', totalRecords);
    console.log('Records on page:', paginatedRecords.length);

    return NextResponse.json({
      success: true,
      records: paginatedRecords,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalRecords: totalRecords,
        limit: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching all attendance records:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch attendance records',
      error: error.message
    }, { status: 500 });
  }
}
