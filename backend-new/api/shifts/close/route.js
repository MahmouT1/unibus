import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-simple-connection';
import { ObjectId } from 'mongodb';

// PUT - Close a shift
export async function PUT(request) {
  try {
    const db = await getDatabase();
    const shiftsCollection = db.collection('shifts');
    
    const body = await request.json();
    const { shiftId, supervisorId } = body;

    if (!shiftId || !supervisorId) {
      return NextResponse.json({
        success: false,
        message: 'Shift ID and Supervisor ID are required'
      }, { status: 400 });
    }

    console.log('=== Closing Shift ===');
    console.log('Shift ID:', shiftId);
    console.log('Supervisor ID:', supervisorId);
    
    // Find and update the shift
    const result = await shiftsCollection.updateOne(
      { 
        _id: new ObjectId(shiftId),
        supervisorId: new ObjectId(supervisorId),
        status: 'open'
      },
      { 
        $set: { 
          status: 'closed',
          shiftEnd: new Date(),
          updatedAt: new Date()
        }
      }
    );
    
    console.log('Shift close result:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });

    if (result.modifiedCount === 0) {
      return NextResponse.json({
        success: false,
        message: 'Shift not found or already closed'
      }, { status: 404 });
    }

    // Get the updated shift
    const updatedShift = await shiftsCollection.findOne({ _id: new ObjectId(shiftId) });

    return NextResponse.json({
      success: true,
      message: 'Shift closed successfully',
      shift: {
        id: updatedShift._id.toString(),
        supervisorId: updatedShift.supervisorId.toString(),
        supervisorName: updatedShift.supervisorName,
        supervisorEmail: updatedShift.supervisorEmail,
        date: updatedShift.date,
        shiftStart: updatedShift.shiftStart,
        shiftEnd: updatedShift.shiftEnd,
        status: updatedShift.status,
        totalScans: updatedShift.totalScans,
        attendanceRecords: updatedShift.attendanceRecords
      }
    });
  } catch (error) {
    console.error('Error closing shift:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to close shift',
      error: error.message
    }, { status: 500 });
  }
}
