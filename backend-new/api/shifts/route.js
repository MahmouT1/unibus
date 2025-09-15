import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-simple-connection';
import { ObjectId } from 'mongodb';

// GET - Get all active shifts or shifts for a specific supervisor
export async function GET(request) {
  try {
    const db = await getDatabase();
    const shiftsCollection = db.collection('shifts');
    
    const { searchParams } = new URL(request.url);
    const supervisorId = searchParams.get('supervisorId');
    const shiftId = searchParams.get('shiftId');
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    let query = {};
    
    if (supervisorId) {
      query.supervisorId = new ObjectId(supervisorId);
    }
    
    if (shiftId) {
      query._id = new ObjectId(shiftId);
    }
    
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }
    
    if (status) {
      query.status = status;
    }

    console.log('=== Fetching Shifts ===');
    console.log('Query parameters:', { supervisorId, shiftId, date, status });
    console.log('MongoDB query:', JSON.stringify(query, null, 2));

    const shifts = await shiftsCollection.find(query).sort({ createdAt: -1 }).toArray();
    
    console.log('Found shifts:', shifts.length);
    if (shifts.length > 0) {
      console.log('Sample shift:', {
        id: shifts[0]._id.toString(),
        supervisorId: shifts[0].supervisorId.toString(),
        status: shifts[0].status,
        date: shifts[0].date,
        attendanceRecords: shifts[0].attendanceRecords?.length || 0
      });
    }

    // Convert MongoDB _id to id for consistency
    const formattedShifts = shifts.map(shift => ({
      id: shift._id.toString(),
      ...shift,
      supervisorId: shift.supervisorId.toString(),
      _id: undefined // Remove the original _id field
    }));

    return NextResponse.json({
      success: true,
      shifts: formattedShifts
    });
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch shifts',
      error: error.message
    }, { status: 500 });
  }
}

// POST - Create a new shift (open shift)
export async function POST(request) {
  try {
    const db = await getDatabase();
    const shiftsCollection = db.collection('shifts');
    const usersCollection = db.collection('users');
    
    const body = await request.json();
    const { supervisorId, supervisorEmail } = body;

    if (!supervisorId || !supervisorEmail) {
      return NextResponse.json({
        success: false,
        message: 'Supervisor ID and email are required'
      }, { status: 400 });
    }

    // Get supervisor information
    const supervisor = await usersCollection.findOne({ 
      _id: new ObjectId(supervisorId),
      email: supervisorEmail,
      role: 'supervisor'
    });

    if (!supervisor) {
      return NextResponse.json({
        success: false,
        message: 'Supervisor not found or invalid role'
      }, { status: 404 });
    }

    // Check if supervisor already has an open shift (regardless of date)
    // This allows creating new shifts after closing previous ones
    console.log('=== Creating New Shift ===');
    console.log('Supervisor ID:', supervisorId);
    console.log('Supervisor Email:', supervisorEmail);
    
    const existingOpenShift = await shiftsCollection.findOne({
      supervisorId: new ObjectId(supervisorId),
      status: 'open'
    });

    console.log('Existing open shift found:', !!existingOpenShift);
    if (existingOpenShift) {
      console.log('Existing shift ID:', existingOpenShift._id);
      console.log('Existing shift status:', existingOpenShift.status);
    }

    if (existingOpenShift) {
      return NextResponse.json({
        success: false,
        message: 'Supervisor already has an open shift. Please close the current shift first.'
      }, { status: 400 });
    }

    // Create new shift
    const shiftData = {
      supervisorId: new ObjectId(supervisorId),
      supervisorEmail: supervisorEmail,
      supervisorName: supervisor.fullName || supervisor.email.split('@')[0],
      date: new Date(),
      shiftStart: new Date(),
      shiftEnd: null,
      status: 'open',
      attendanceRecords: [],
      totalScans: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await shiftsCollection.insertOne(shiftData);
    
    console.log('✅ New shift created successfully:', result.insertedId);
    console.log('New shift data:', {
      id: result.insertedId.toString(),
      supervisorId: shiftData.supervisorId.toString(),
      status: shiftData.status,
      date: shiftData.date
    });

    // Verify the shift was actually saved
    const savedShift = await shiftsCollection.findOne({ _id: result.insertedId });
    console.log('✅ Shift verification - found in DB:', !!savedShift);
    if (savedShift) {
      console.log('Saved shift details:', {
        id: savedShift._id.toString(),
        supervisorId: savedShift.supervisorId.toString(),
        status: savedShift.status,
        date: savedShift.date,
        attendanceRecords: savedShift.attendanceRecords?.length || 0
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Shift opened successfully',
      shift: {
        id: result.insertedId.toString(),
        ...shiftData,
        supervisorId: shiftData.supervisorId.toString()
      }
    });
  } catch (error) {
    console.error('Error creating shift:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create shift',
      error: error.message
    }, { status: 500 });
  }
}
