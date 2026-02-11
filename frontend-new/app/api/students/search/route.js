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

    // Fetch attendance records ONCE from backend (use env for production/Docker)
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    let attendanceRecords = [];
    try {
      const attendanceResponse = await fetch(`${backendUrl.replace(/\/$/, '')}/api/attendance/all-records?limit=5000&page=1`, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json();
        if (attendanceData.success && attendanceData.records) {
          attendanceRecords = attendanceData.records;
          console.log(`📊 Loaded ${attendanceRecords.length} attendance records for student count calculation`);
        }
      }
    } catch (backendError) {
      console.error('Error fetching attendance from backend:', backendError);
    }

    // Calculate attendance count per student from the fetched records
    console.log('Calculating attendance counts per student...');
    const studentsWithAttendance = students.map((student) => {
      try {
        const studentEmail = (student.email || '').toLowerCase();
        const studentName = (student.fullName || student.name || '').toLowerCase();
        const attendanceDates = new Set(); // أيام فريدة (طالب = مسحة واحدة/يوم)
        
        attendanceRecords.forEach(record => {
          const recordEmail = (record.studentEmail || record.email || '').toLowerCase();
          const recordStudentId = record.studentId;
          const recordStudentName = (record.studentName || '').toLowerCase();
          
          const emailMatch = recordEmail === studentEmail;
          const idMatch = recordStudentId === student.studentId && student.studentId !== 'N/A';
          const nameMatch = recordStudentName && studentName && recordStudentName.includes(studentName);
          
          if (emailMatch || idMatch || nameMatch) {
            const scanTime = record.scanTime || record.checkInTime || record.createdAt || record.timestamp;
            if (scanTime) {
              attendanceDates.add(new Date(scanTime).toDateString());
            }
          }
        });
        
        const attendanceCount = attendanceDates.size;
        return {
            _id: student._id.toString(),
            fullName: student.fullName || student.name || 'Unknown',
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
      } catch (error) {
        console.error(`Error calculating attendance for student ${student._id}:`, error);
        return {
          _id: student._id.toString(),
          fullName: student.fullName || student.name || 'Unknown',
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
          attendanceCount: 0
        };
      }
    });
    console.log('Attendance counts calculated for', studentsWithAttendance.length, 'students');

    // Sort by attendance count (highest first), then by name
    studentsWithAttendance.sort((a, b) => {
      if (b.attendanceCount !== a.attendanceCount) {
        return b.attendanceCount - a.attendanceCount;
      }
      return (a.fullName || '').localeCompare(b.fullName || '');
    });

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
    const { studentId, _id, email } = body;
    const lookupId = _id || studentId;

    if (!lookupId && !email) {
      return NextResponse.json(
        { success: false, message: 'Student ID or email is required' },
        { status: 400 }
      );
    }

    const studentsCollection = db.collection('students');
    const usersCollection = db.collection('users');
    let student = null;

    if (lookupId) {
      try {
        student = await studentsCollection.findOne({ _id: new ObjectId(lookupId) });
        if (!student) {
          student = await usersCollection.findOne({ _id: new ObjectId(lookupId), role: 'student' });
        }
      } catch (e) {}
    }
    if (!student && email) {
      const em = (email || '').toLowerCase();
      student = await studentsCollection.findOne({ email: em });
      if (!student) {
        student = await usersCollection.findOne({ email: em, role: 'student' });
      }
    }
    
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:3001';
    let attendanceRecords = [];
    let totalAttendance = 0;
    let lastAttendance = null;

    try {
      const attendanceResponse = await fetch(`${backendUrl.replace(/\/$/, '')}/api/attendance/all-records?limit=5000&page=1`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json();
        if (attendanceData.success && attendanceData.records) {
          // Filter records for this specific student
          const studentEmail = (student.email || '').toLowerCase();
          const studentRecords = attendanceData.records.filter(record => {
            const recordEmail = (record.studentEmail || record.email || '').toLowerCase();
            const recordStudentId = record.studentId;
            const recordStudentName = (record.studentName || '').toLowerCase();
            const studentName = (student.fullName || student.name || '').toLowerCase();
            
            // Match by email, student ID, or name
            const emailMatch = recordEmail === studentEmail;
            const idMatch = recordStudentId === student.studentId && student.studentId !== 'N/A';
            const nameMatch = recordStudentName && studentName && recordStudentName.includes(studentName);
            
            return emailMatch || idMatch || nameMatch;
          });

          // Sort by scan time (newest first) - return all records for full history
          attendanceRecords = studentRecords
            .sort((a, b) => new Date(b.scanTime || b.checkInTime) - new Date(a.scanTime || a.checkInTime));
          
          totalAttendance = studentRecords.length;
          lastAttendance = attendanceRecords.length > 0 ? {
            ...attendanceRecords[0],
            checkInTime: attendanceRecords[0].scanTime || attendanceRecords[0].checkInTime
          } : null;
        }
      }
    } catch (backendError) {
      console.error('Error fetching detailed attendance from backend:', backendError);
    }

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
