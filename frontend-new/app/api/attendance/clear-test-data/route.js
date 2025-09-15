import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-simple-connection';

export async function DELETE() {
  try {
    const db = await getDatabase();
    const attendanceCollection = db.collection('attendance');

    // Clear test attendance records (those with test student IDs)
    const result = await attendanceCollection.deleteMany({
      $or: [
        { studentId: { $regex: /^test/ } },
        { studentId: { $regex: /^TEST/ } },
        { 'studentData.id': { $regex: /^test/ } },
        { 'studentData.id': { $regex: /^TEST/ } },
        { 'qrData.id': { $regex: /^test/ } },
        { 'qrData.id': { $regex: /^TEST/ } }
      ]
    });

    console.log(`Cleared ${result.deletedCount} test attendance records`);

    return NextResponse.json({
      success: true,
      message: `Cleared ${result.deletedCount} test records`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error clearing test data:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to clear test data'
    }, { status: 500 });
  }
}
