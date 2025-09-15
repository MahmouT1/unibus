import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock dashboard statistics
    const stats = {
      totalStudents: 150,
      activeSubscriptions: 120,
      todayAttendanceRate: 85,
      pendingSubscriptions: 8,
      openTickets: 3,
      monthlyRevenue: 15000
    };

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
