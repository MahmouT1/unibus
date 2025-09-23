import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-simple-connection';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    console.log('=== Students Search API Called ===');
    const db = await getDatabase();
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

    // Get students from both students and users collections
    const studentsCollection = db.collection('students');
    const usersCollection = db.collection('users');
    
    console.log('Counting students with query:', query);
    
    // Count from both collections
    const studentsCount = await studentsCollection.countDocuments(query);
    const usersCount = await usersCollection.countDocuments({
      ...query,
      role: 'student' // Only get users with student role
    });
    
    const totalStudents = studentsCount + usersCount;
    console.log('Students found in students collection:', studentsCount);
    console.log('Students found in users collection:', usersCount);
    console.log('Total students found:', totalStudents);

    // Fetch students from both collections
    console.log('Fetching students...');
    const [studentsFromStudents, studentsFromUsers] = await Promise.all([
      studentsCollection.find(query).sort({ fullName: 1 }).toArray(),
      usersCollection.find({ ...query, role: 'student' }).sort({ fullName: 1 }).toArray()
    ]);
    
    // Combine and deduplicate students
    const allStudents = [...studentsFromStudents, ...studentsFromUsers];
    const uniqueStudents = allStudents.filter((student, index, self) => 
      index === self.findIndex(s => s.email === student.email)
    );
    
    // Apply pagination to combined results
    const students = uniqueStudents.slice(skip, skip + limit);
    console.log('Students fetched:', students.length);

    // Get attendance counts for each student
    console.log('Calculating attendance counts...');
    const attendanceCollection = db.collection('attendance');
    const studentsWithAttendance = await Promise.all(
      students.map(async (student) => {
        // Count all attendance records for this student
        const attendanceCount = await attendanceCollection.countDocuments({
          studentEmail: student.email
        });

        return {
          _id: student._id.toString(),
          fullName: student.fullName || 'Unknown',
          email: student.email || '',
          studentId: student.studentId || 'N/A',
          college: student.college || 'N/A',
          major: student.major || 'N/A',
          grade: student.grade || 'N/A',
          phoneNumber: student.phoneNumber || 'N/A',
          address: student.address || 'N/A',
          profilePhoto: student.profilePhoto || '',
          qrCode: student.qrCode || '',
          status: student.status || 'active',
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
    const db = await getDatabase();
    
    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Get student details from students collection
    const studentsCollection = db.collection('students');
    const student = await studentsCollection.findOne({ _id: new ObjectId(studentId) });
    
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    // Get detailed attendance records
    const attendanceCollection = db.collection('attendance');
    const attendanceRecords = await attendanceCollection.find({ 
      studentEmail: student.email 
    })
      .sort({ scanTime: -1 })
      .limit(50)
      .toArray();

    // Calculate attendance statistics
    const totalAttendance = await attendanceCollection.countDocuments({
      studentEmail: student.email
    });

    const lastAttendance = attendanceRecords.length > 0 ? attendanceRecords[0] : null;

    return NextResponse.json({
      success: true,
      data: {
        student: {
          _id: student._id.toString(),
          fullName: student.fullName || 'Unknown',
          email: student.email || '',
          studentId: student.studentId || 'N/A',
          college: student.college || 'N/A',
          major: student.major || 'N/A',
          grade: student.grade || 'N/A',
          phoneNumber: student.phoneNumber || 'N/A',
          address: student.address || 'N/A',
          profilePhoto: student.profilePhoto || '',
          qrCode: student.qrCode || '',
          status: student.status || 'active'
        },
        attendance: {
          records: attendanceRecords,
          totalAttendance,
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
