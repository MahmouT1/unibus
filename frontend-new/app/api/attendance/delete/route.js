import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Attendance from '@/lib/Attendance.js';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const attendanceId = searchParams.get('id');

    if (!attendanceId) {
      return NextResponse.json(
        { success: false, message: 'Attendance ID is required' },
        { status: 400 }
      );
    }

    console.log('Deleting attendance record:', attendanceId);

    // Connect to MongoDB
    await connectDB();

    // Find and delete the attendance record
    const deletedRecord = await Attendance.findByIdAndDelete(attendanceId);

    if (!deletedRecord) {
      return NextResponse.json(
        { success: false, message: 'Attendance record not found' },
        { status: 404 }
      );
    }

    console.log('Attendance record deleted successfully:', attendanceId);

    return NextResponse.json({
      success: true,
      message: 'Attendance record deleted successfully',
      deletedRecord: {
        id: deletedRecord._id,
        studentId: deletedRecord.studentId,
        date: deletedRecord.date
      }
    });

  } catch (error) {
    console.error('Delete attendance error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete attendance record', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
