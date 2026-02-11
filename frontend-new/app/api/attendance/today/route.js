import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock today's attendance records
    const records = [
      {
        id: '1',
        studentName: 'Ahmed Mohammed',
        studentId: 'ST001',
        college: 'Engineering',
        major: 'Computer Science',
        grade: 'third-year',
        status: 'Present',
        scanTime: new Date().toISOString(),
        email: 'ahmed@example.com'
      },
      {
        id: '2',
        studentName: 'Sara Ali',
        studentId: 'ST002',
        college: 'Business',
        major: 'Management',
        grade: 'second-year',
        status: 'Present',
        scanTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        email: 'sara@example.com'
      },
      {
        id: '3',
        studentName: 'Omar Hassan',
        studentId: 'ST003',
        college: 'Medicine',
        major: 'General Medicine',
        grade: 'fourth-year',
        status: 'Late',
        scanTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        email: 'omar@example.com'
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