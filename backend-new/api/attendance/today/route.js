import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock today's attendance data
    const records = [
      {
        _id: '1',
        studentId: {
          _id: 'student1',
          fullName: 'Ahmed Hassan',
          studentId: '2024001',
          college: 'Engineering'
        },
        status: 'Present',
        checkInTime: new Date().toISOString(),
        appointmentSlot: 'first'
      },
      {
        _id: '2',
        studentId: {
          _id: 'student2',
          fullName: 'Mohamed Ali',
          studentId: '2024002',
          college: 'Medicine'
        },
        status: 'Late',
        checkInTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        appointmentSlot: 'first'
      },
      {
        _id: '3',
        studentId: {
          _id: 'student3',
          fullName: 'Sara Ahmed',
          studentId: '2024003',
          college: 'Business'
        },
        status: 'Present',
        checkInTime: new Date().toISOString(),
        appointmentSlot: 'second'
      }
    ];

    return NextResponse.json({
      success: true,
      records
    });
  } catch (error) {
    console.error('Today attendance error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch today attendance' },
      { status: 500 }
    );
  }
}
