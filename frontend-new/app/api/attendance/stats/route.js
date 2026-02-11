import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb.js';
import Attendance from '../../../../lib/models/Attendance.js';
import Student from '../../../../lib/models/Student.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period') || 'month'; // month, week, year

    await connectDB();

    // Build date range
    let dateRange = {};
    if (startDate && endDate) {
      dateRange = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      // Default to current month
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      dateRange = {
        date: {
          $gte: firstDay,
          $lte: lastDay
        }
      };
    }

    if (studentId) {
      // Get statistics for a specific student
      const student = await Student.findById(studentId);
      if (!student) {
        return NextResponse.json(
          { success: false, message: 'Student not found' },
          { status: 404 }
        );
      }

      const query = { studentId, ...dateRange };
      
      const attendanceRecords = await Attendance.find(query).sort({ date: 1 });
      
      const totalDays = attendanceRecords.length;
      const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
      const lateDays = attendanceRecords.filter(record => record.status === 'late').length;
      const absentDays = attendanceRecords.filter(record => record.status === 'absent').length;
      const excusedDays = attendanceRecords.filter(record => record.status === 'excused').length;
      
      const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
      
      // Group by month for trend analysis
      const monthlyStats = {};
      attendanceRecords.forEach(record => {
        const month = record.date.toISOString().substring(0, 7); // YYYY-MM
        if (!monthlyStats[month]) {
          monthlyStats[month] = { present: 0, late: 0, absent: 0, excused: 0 };
        }
        monthlyStats[month][record.status]++;
      });

      return NextResponse.json({
        success: true,
        stats: {
          student: {
            id: student._id,
            studentId: student.studentId,
            fullName: student.fullName,
            college: student.college,
            major: student.major,
            grade: student.grade
          },
          period: {
            start: dateRange.date.$gte,
            end: dateRange.date.$lte
          },
          summary: {
            totalDays,
            presentDays,
            lateDays,
            absentDays,
            excusedDays,
            attendanceRate
          },
          monthlyTrend: monthlyStats,
          recentAttendance: attendanceRecords.slice(-10).map(record => ({
            date: record.date,
            status: record.status,
            checkInTime: record.checkInTime,
            location: record.location
          }))
        }
      });

    } else {
      // Get overall statistics
      const query = dateRange;
      
      const totalAttendance = await Attendance.countDocuments(query);
      const presentCount = await Attendance.countDocuments({ ...query, status: 'present' });
      const lateCount = await Attendance.countDocuments({ ...query, status: 'late' });
      const absentCount = await Attendance.countDocuments({ ...query, status: 'absent' });
      const excusedCount = await Attendance.countDocuments({ ...query, status: 'excused' });
      
      const totalStudents = await Student.countDocuments({ status: 'active' });
      const overallAttendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

      // Daily attendance trend
      const dailyStats = await Attendance.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$date" }
            },
            present: {
              $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] }
            },
            late: {
              $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] }
            },
            absent: {
              $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] }
            },
            total: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Top performing students
      const topStudents = await Attendance.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$studentId",
            presentCount: {
              $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] }
            },
            totalCount: { $sum: 1 },
            studentInfo: { $first: "$studentInfo" }
          }
        },
        {
          $addFields: {
            attendanceRate: {
              $round: [{ $multiply: [{ $divide: ["$presentCount", "$totalCount"] }, 100] }, 2]
            }
          }
        },
        { $sort: { attendanceRate: -1 } },
        { $limit: 10 }
      ]);

      return NextResponse.json({
        success: true,
        stats: {
          period: {
            start: dateRange.date.$gte,
            end: dateRange.date.$lte
          },
          summary: {
            totalStudents,
            totalAttendance,
            presentCount,
            lateCount,
            absentCount,
            excusedCount,
            overallAttendanceRate
          },
          dailyTrend: dailyStats,
          topStudents: topStudents.map(student => ({
            studentId: student.studentInfo.studentId,
            fullName: student.studentInfo.fullName,
            college: student.studentInfo.college,
            attendanceRate: student.attendanceRate,
            presentDays: student.presentCount,
            totalDays: student.totalCount
          }))
        }
      });
    }

  } catch (error) {
    console.error('Attendance stats error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch attendance statistics',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
