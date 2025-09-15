import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-simple-connection';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Get real statistics from database
    const [studentsCount, subscriptionsData, attendanceData, supportTickets] = await Promise.all([
      db.collection('students').countDocuments(),
      db.collection('subscriptions').find({}).toArray(),
      db.collection('attendance').find({}).toArray(),
      db.collection('support_tickets').find({ status: 'open' }).toArray()
    ]);

    // Calculate active subscriptions
    const activeSubscriptions = subscriptionsData.filter(sub => {
      if (!sub.renewalDate) return false;
      const renewalDate = new Date(sub.renewalDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return renewalDate >= today && sub.totalPaid >= 6000;
    }).length;

    // Calculate today's attendance rate
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendanceData.filter(record => 
      record.scanTime && record.scanTime.startsWith(today)
    ).length;
    const todayAttendanceRate = studentsCount > 0 ? Math.round((todayAttendance / studentsCount) * 100) : 0;

    // Calculate pending subscriptions
    const pendingSubscriptions = subscriptionsData.filter(sub => {
      if (!sub.renewalDate) return true;
      const renewalDate = new Date(sub.renewalDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return renewalDate < today || (sub.totalPaid > 0 && sub.totalPaid < 6000);
    }).length;

    // Calculate monthly revenue
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = subscriptionsData
      .filter(sub => {
        if (!sub.lastPaymentDate) return false;
        const paymentDate = new Date(sub.lastPaymentDate);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      })
      .reduce((sum, sub) => sum + (sub.totalPaid || 0), 0);

    const stats = {
      totalStudents: studentsCount,
      activeSubscriptions,
      todayAttendanceRate,
      pendingSubscriptions,
      openTickets: supportTickets.length,
      monthlyRevenue: Math.round(monthlyRevenue)
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
