import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Student from '../../../../lib/Student';
import Attendance from '../../../../lib/Attendance';

export async function GET(request) {
  try {
    console.log('=== Students Search API Called ===');
    await connectDB();
    console.log('Database connected successfully');
    
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;
    
    console.log('Search params:', { searchTerm, page, limit, skip });

    // Build search query
    let query = {};
    if (searchTerm) {
      query = {
        $or: [
          { fullName: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { studentId: { $regex: searchTerm, $options: 'i' } },
          { college: { $regex: searchTerm, $options: 'i' } },
          { major: { $regex: searchTerm, $options: 'i' } },
          { grade: { $regex: searchTerm, $options: 'i' } }
        ]
      };
    }

    // Get total count for pagination
    console.log('Counting students with query:', query);
    const totalStudents = await Student.countDocuments(query);
    console.log('Total students found:', totalStudents);

    // Fetch students with pagination
    console.log('Fetching students...');
    const students = await Student.find(query)
      .sort({ fullName: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
    console.log('Students fetched:', students.length);

    // Get attendance counts for each student
    console.log('Calculating attendance counts...');
    const studentsWithAttendance = await Promise.all(
      students.map(async (student) => {
        // Count all attendance records for this student (regardless of status)
        const attendanceCount = await Attendance.countDocuments({
          'studentId': student._id
        });

        return {
          ...student,
          attendanceCount
        };
      })
    );
    console.log('Attendance counts calculated for', studentsWithAttendance.length, 'students');

    // Calculate pagination info
    const totalPages = Math.ceil(totalStudents / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    console.log('Returning response with', studentsWithAttendance.length, 'students');
    return NextResponse.json({
      success: true,
      data: {
        students: studentsWithAttendance,
        pagination: {
          currentPage: page,
          totalPages,
          totalStudents,
          hasNextPage,
          hasPrevPage,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Error searching students:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to search students', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Get student details
    const student = await Student.findById(studentId).lean();
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    // Get detailed attendance records
    const attendanceRecords = await Attendance.find({ 'studentId': studentId })
      .sort({ checkInTime: -1 })
      .limit(50)
      .lean();

    // Calculate attendance statistics
    // Count all attendance records for this student
    const totalAttendance = await Attendance.countDocuments({
      'studentId': studentId
    });

    const totalAbsences = await Attendance.countDocuments({
      'studentId': studentId,
      status: 'Absent'
    });

    const lastAttendance = attendanceRecords.length > 0 ? attendanceRecords[0] : null;

    return NextResponse.json({
      success: true,
      data: {
        student,
        attendance: {
          records: attendanceRecords,
          totalAttendance,
          totalAbsences,
          lastAttendance
        }
      }
    });

  } catch (error) {
    console.error('Error fetching student details:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch student details', error: error.message },
      { status: 500 }
    );
  }
}
