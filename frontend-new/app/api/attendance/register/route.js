import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb.js';
import Attendance from '../../../../lib/models/Attendance.js';
import Student from '../../../../lib/models/Student.js';
import User from '../../../../lib/models/User.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      studentData, 
      supervisorId, 
      location = 'Main Station',
      scanMethod = 'qr-code',
      notes = '',
      coordinates 
    } = body;

    // Validate required fields
    if (!studentData || !supervisorId) {
      return NextResponse.json(
        { success: false, message: 'Student data and supervisor ID are required' },
        { status: 400 }
      );
    }

    if (!studentData.studentId || !studentData.fullName || !studentData.email) {
      return NextResponse.json(
        { success: false, message: 'Student ID, name, and email are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find supervisor
    const supervisor = await User.findById(supervisorId);
    if (!supervisor) {
      return NextResponse.json(
        { success: false, message: 'Supervisor not found' },
        { status: 404 }
      );
    }

    // Find or create student
    let student = await Student.findOne({ 
      $or: [
        { studentId: studentData.studentId },
        { email: studentData.email }
      ]
    });

    if (!student) {
      // Create new student if not exists
      student = new Student({
        studentId: studentData.studentId,
        fullName: studentData.fullName,
        email: studentData.email,
        phoneNumber: studentData.phoneNumber || '',
        college: studentData.college || 'Unknown',
        major: studentData.major || 'Unknown',
        grade: studentData.grade || 'first-year',
        address: studentData.address || '',
        profilePhoto: studentData.profilePhoto || null
      });
      await student.save();
    }

    // Check for duplicate attendance today
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const existingAttendance = await Attendance.findOne({
      studentId: student._id,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    if (existingAttendance) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Student has already been marked present today',
          existingAttendance: {
            time: existingAttendance.checkInTime,
            location: existingAttendance.location
          }
        },
        { status: 409 }
      );
    }

    // Create attendance record
    const attendanceRecord = new Attendance({
      studentId: student._id,
      studentInfo: {
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        college: student.college,
        major: student.major,
        grade: student.grade
      },
      supervisorId: supervisor._id,
      supervisorInfo: {
        email: supervisor.email,
        fullName: supervisor.fullName
      },
      location,
      scanMethod,
      notes,
      coordinates: coordinates || null,
      deviceInfo: {
        userAgent: request.headers.get('user-agent') || '',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    });

    await attendanceRecord.save();

    // Update student attendance statistics
    const attendanceCount = await Attendance.countDocuments({ studentId: student._id });
    const attendanceRate = Math.round((attendanceCount / 30) * 100); // Assuming 30 days max

    await Student.findByIdAndUpdate(student._id, {
      'attendanceStats.totalAttendance': attendanceCount,
      'attendanceStats.daysRegistered': attendanceCount,
      'attendanceStats.attendanceRate': Math.min(attendanceRate, 100),
      'attendanceStats.remainingDays': Math.max(30 - attendanceCount, 0),
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Attendance registered successfully',
      attendance: {
        id: attendanceRecord._id,
        studentId: student.studentId,
        studentName: student.fullName,
        checkInTime: attendanceRecord.checkInTime,
        location: attendanceRecord.location,
        status: attendanceRecord.status
      },
      student: {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        college: student.college,
        major: student.major,
        grade: student.grade,
        attendanceStats: {
          totalAttendance: attendanceCount,
          attendanceRate: Math.min(attendanceRate, 100)
        }
      }
    });

  } catch (error) {
    console.error('Attendance registration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to register attendance',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
