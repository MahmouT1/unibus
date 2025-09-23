import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function GET(request) {
  try {
    // Connect to database
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Get user statistics
    const stats = await usersCollection.aggregate([
      {
        $group: {
          _id: '$role',
          total: { $sum: 1 },
          active: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          verified: {
            $sum: { $cond: ['$emailVerified', 1, 0] }
          },
          locked: {
            $sum: {
              $cond: [
                { $and: ['$lockUntil', { $gt: ['$lockUntil', new Date()] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]).toArray();

    // Get total counts
    const totalUsers = await usersCollection.countDocuments();
    const activeUsers = await usersCollection.countDocuments({ isActive: true });
    const verifiedUsers = await usersCollection.countDocuments({ emailVerified: true });
    const lockedUsers = await usersCollection.countDocuments({
      lockUntil: { $gt: new Date() }
    });

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await usersCollection.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get users by month for chart data
    const monthlyStats = await usersCollection.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getFullYear(), 0, 1) // Current year
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]).toArray();

    // Format role-based stats
    const roleStats = {
      student: { total: 0, active: 0, verified: 0, locked: 0 },
      admin: { total: 0, active: 0, verified: 0, locked: 0 },
      supervisor: { total: 0, active: 0, verified: 0, locked: 0 }
    };

    stats.forEach(stat => {
      if (roleStats[stat._id]) {
        roleStats[stat._id] = {
          total: stat.total,
          active: stat.active,
          verified: stat.verified,
          locked: stat.locked
        };
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          verifiedUsers,
          lockedUsers,
          recentRegistrations
        },
        roleStats,
        monthlyStats: monthlyStats.map(stat => ({
          month: stat._id.month,
          year: stat._id.year,
          count: stat.count
        }))
      }
    });

  } catch (error) {
    console.error('User stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get user statistics', error: error.message },
      { status: 500 }
    );
  }
}
