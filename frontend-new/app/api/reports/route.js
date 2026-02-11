import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import Attendance from '../../../lib/models/Attendance.js';
import Student from '../../../lib/models/Student.js';
import User from '../../../lib/models/User.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'attendance';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') || 'json'; // json, csv, pdf

    await connectDB();

    let reportData = {};

    switch (reportType) {
      case 'attendance':
        reportData = await generateAttendanceReport(startDate, endDate);
        break;
      case 'students':
        reportData = await generateStudentsReport();
        break;
      case 'summary':
        reportData = await generateSummaryReport(startDate, endDate);
        break;
      case 'detailed':
        reportData = await generateDetailedReport(startDate, endDate);
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid report type' },
          { status: 400 }
        );
    }

    if (format === 'csv') {
      return generateCSVResponse(reportData, reportType);
    }

    return NextResponse.json({
      success: true,
      reportType,
      period: {
        startDate: startDate || 'All time',
        endDate: endDate || 'All time'
      },
      generatedAt: new Date().toISOString(),
      data: reportData
    });

  } catch (error) {
    console.error('Reports error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to generate report',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

async function generateAttendanceReport(startDate, endDate) {
  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const attendanceRecords = await Attendance.find(dateFilter)
    .populate('studentId', 'studentId fullName college major grade')
    .populate('supervisorId', 'fullName email')
    .sort({ date: -1, checkInTime: -1 });

  const summary = {
    totalRecords: attendanceRecords.length,
    presentCount: attendanceRecords.filter(r => r.status === 'present').length,
    lateCount: attendanceRecords.filter(r => r.status === 'late').length,
    absentCount: attendanceRecords.filter(r => r.status === 'absent').length,
    excusedCount: attendanceRecords.filter(r => r.status === 'excused').length
  };

  // Group by date
  const dailyStats = {};
  attendanceRecords.forEach(record => {
    const date = record.date.toISOString().split('T')[0];
    if (!dailyStats[date]) {
      dailyStats[date] = { present: 0, late: 0, absent: 0, excused: 0, total: 0 };
    }
    dailyStats[date][record.status]++;
    dailyStats[date].total++;
  });

  // Group by college
  const collegeStats = {};
  attendanceRecords.forEach(record => {
    const college = record.studentInfo.college;
    if (!collegeStats[college]) {
      collegeStats[college] = { present: 0, late: 0, absent: 0, excused: 0, total: 0 };
    }
    collegeStats[college][record.status]++;
    collegeStats[college].total++;
  });

  return {
    summary,
    dailyStats,
    collegeStats,
    records: attendanceRecords.map(record => ({
      id: record._id,
      date: record.date,
      checkInTime: record.checkInTime,
      student: {
        id: record.studentId?._id,
        studentId: record.studentInfo.studentId,
        fullName: record.studentInfo.fullName,
        college: record.studentInfo.college,
        major: record.studentInfo.major,
        grade: record.studentInfo.grade
      },
      supervisor: {
        id: record.supervisorId?._id,
        fullName: record.supervisorInfo.fullName,
        email: record.supervisorInfo.email
      },
      status: record.status,
      location: record.location,
      scanMethod: record.scanMethod,
      notes: record.notes
    }))
  };
}

async function generateStudentsReport() {
  const students = await Student.find({})
    .sort({ createdAt: -1 });

  const summary = {
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'active').length,
    inactiveStudents: students.filter(s => s.status === 'inactive').length,
    suspendedStudents: students.filter(s => s.status === 'suspended').length
  };

  // Group by college
  const collegeStats = {};
  students.forEach(student => {
    if (!collegeStats[student.college]) {
      collegeStats[student.college] = 0;
    }
    collegeStats[student.college]++;
  });

  // Group by grade
  const gradeStats = {};
  students.forEach(student => {
    if (!gradeStats[student.grade]) {
      gradeStats[student.grade] = 0;
    }
    gradeStats[student.grade]++;
  });

  // Calculate attendance statistics for each student
  const studentsWithStats = await Promise.all(
    students.map(async (student) => {
      const attendanceCount = await Attendance.countDocuments({ studentId: student._id });
      const presentCount = await Attendance.countDocuments({ 
        studentId: student._id, 
        status: 'present' 
      });
      
      const attendanceRate = attendanceCount > 0 ? Math.round((presentCount / attendanceCount) * 100) : 0;

      return {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        phoneNumber: student.phoneNumber,
        college: student.college,
        major: student.major,
        grade: student.grade,
        status: student.status,
        attendanceStats: {
          totalDays: attendanceCount,
          presentDays: presentCount,
          attendanceRate
        },
        subscription: student.subscription,
        createdAt: student.createdAt
      };
    })
  );

  return {
    summary,
    collegeStats,
    gradeStats,
    students: studentsWithStats
  };
}

async function generateSummaryReport(startDate, endDate) {
  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const [
    totalStudents,
    totalAttendance,
    attendanceByStatus,
    attendanceByCollege,
    recentAttendance
  ] = await Promise.all([
    Student.countDocuments({ status: 'active' }),
    Attendance.countDocuments(dateFilter),
    Attendance.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Attendance.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$studentInfo.college', count: { $sum: 1 } } }
    ]),
    Attendance.find(dateFilter)
      .sort({ checkInTime: -1 })
      .limit(10)
      .populate('studentId', 'studentId fullName')
  ]);

  const statusStats = {};
  attendanceByStatus.forEach(item => {
    statusStats[item._id] = item.count;
  });

  const collegeStats = {};
  attendanceByCollege.forEach(item => {
    collegeStats[item._id] = item.count;
  });

  const averageAttendanceRate = totalStudents > 0 ? 
    Math.round(((statusStats.present || 0) / totalAttendance) * 100) : 0;

  return {
    overview: {
      totalStudents,
      totalAttendance,
      averageAttendanceRate,
      period: dateFilter.date ? `${startDate} to ${endDate}` : 'All time'
    },
    statusBreakdown: statusStats,
    collegeBreakdown: collegeStats,
    recentActivity: recentAttendance.map(record => ({
      studentId: record.studentInfo.studentId,
      studentName: record.studentInfo.fullName,
      checkInTime: record.checkInTime,
      status: record.status,
      location: record.location
    }))
  };
}

async function generateDetailedReport(startDate, endDate) {
  const attendanceReport = await generateAttendanceReport(startDate, endDate);
  const studentsReport = await generateStudentsReport();
  const summaryReport = await generateSummaryReport(startDate, endDate);

  return {
    summary: summaryReport,
    attendance: attendanceReport,
    students: studentsReport,
    metadata: {
      generatedAt: new Date().toISOString(),
      period: {
        startDate: startDate || 'All time',
        endDate: endDate || 'All time'
      },
      reportType: 'detailed'
    }
  };
}

function generateCSVResponse(data, reportType) {
  let csvContent = '';
  
  switch (reportType) {
    case 'attendance':
      csvContent = generateAttendanceCSV(data);
      break;
    case 'students':
      csvContent = generateStudentsCSV(data);
      break;
    default:
      csvContent = 'Report type not supported for CSV export';
  }

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${reportType}_report_${new Date().toISOString().split('T')[0]}.csv"`
    }
  });
}

function generateAttendanceCSV(data) {
  const headers = [
    'Date', 'Student ID', 'Student Name', 'College', 'Major', 'Grade',
    'Check In Time', 'Status', 'Location', 'Scan Method', 'Supervisor', 'Notes'
  ];

  let csv = headers.join(',') + '\n';

  data.records.forEach(record => {
    const row = [
      record.date.toISOString().split('T')[0],
      record.student.studentId,
      `"${record.student.fullName}"`,
      `"${record.student.college}"`,
      `"${record.student.major}"`,
      record.student.grade,
      record.checkInTime.toISOString(),
      record.status,
      `"${record.location}"`,
      record.scanMethod,
      `"${record.supervisor.fullName}"`,
      `"${record.notes || ''}"`
    ];
    csv += row.join(',') + '\n';
  });

  return csv;
}

function generateStudentsCSV(data) {
  const headers = [
    'Student ID', 'Full Name', 'Email', 'Phone', 'College', 'Major', 'Grade',
    'Status', 'Total Days', 'Present Days', 'Attendance Rate', 'Registration Date'
  ];

  let csv = headers.join(',') + '\n';

  data.students.forEach(student => {
    const row = [
      student.studentId,
      `"${student.fullName}"`,
      student.email,
      student.phoneNumber,
      `"${student.college}"`,
      `"${student.major}"`,
      student.grade,
      student.status,
      student.attendanceStats.totalDays,
      student.attendanceStats.presentDays,
      student.attendanceStats.attendanceRate + '%',
      student.createdAt.toISOString().split('T')[0]
    ];
    csv += row.join(',') + '\n';
  });

  return csv;
}