import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-simple-connection';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const db = await getDatabase();
    const attendanceCollection = db.collection('attendance');

    // Find the attendance record by _id
    const attendanceRecord = await attendanceCollection.findOne({ _id: id });

    if (!attendanceRecord) {
      return NextResponse.json(
        { success: false, message: 'Attendance record not found' },
        { status: 404 }
      );
    }

    // Delete the attendance record
    const result = await attendanceCollection.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete attendance record' },
        { status: 500 }
      );
    }

    console.log(`Deleted attendance record: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });

  } catch (error) {
    console.error('Delete attendance error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete attendance record' },
      { status: 500 }
    );
  }
}
