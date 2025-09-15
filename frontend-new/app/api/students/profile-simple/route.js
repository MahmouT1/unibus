import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-simple-connection';

export async function GET(request) {
  try {
    const db = await getDatabase();
    const studentsCollection = db.collection('students');
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const adminView = searchParams.get('admin') === 'true';

    if (adminView) {
      // Return all students for admin view
      const allStudents = await studentsCollection.find({}).toArray();
      
      // Convert to object format for compatibility with existing frontend
      const studentsObject = {};
      allStudents.forEach(student => {
        studentsObject[student.email] = {
          id: student._id.toString(),
          fullName: student.fullName,
          studentId: student.studentId,
          phoneNumber: student.phoneNumber,
          college: student.college,
          grade: student.grade,
          major: student.major,
          academicYear: student.academicYear,
          address: student.address,
          profilePhoto: student.profilePhoto,
          qrCode: student.qrCode,
          attendanceStats: student.attendanceStats,
          status: student.status,
          email: student.email,
          updatedAt: student.updatedAt
        };
      });
      
      return NextResponse.json({ 
        success: true, 
        students: studentsObject 
      });
    } else if (email) {
      // Return specific student by email
      const student = await studentsCollection.findOne({ email: email.toLowerCase() });
      
      if (student) {
        return NextResponse.json({ 
          success: true, 
          student: {
            id: student._id.toString(),
            fullName: student.fullName,
            studentId: student.studentId,
            phoneNumber: student.phoneNumber,
            college: student.college,
            grade: student.grade,
            major: student.major,
            academicYear: student.academicYear,
            address: student.address,
            profilePhoto: student.profilePhoto,
            qrCode: student.qrCode,
            attendanceStats: student.attendanceStats,
            status: student.status,
            email: student.email,
            updatedAt: student.updatedAt
          }
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          message: 'Student not found' 
        }, { status: 404 });
      }
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Email or admin parameter is required' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch student profile', 
      error: error.message 
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const db = await getDatabase();
    const studentsCollection = db.collection('students');
    
    const body = await request.json();
    const { email, fullName, phoneNumber, college, grade, major, address, profilePhoto } = body;

    console.log('=== DEBUG: Profile update API called ===');
    console.log('Request body:', body);
    console.log('Profile photo URL:', profilePhoto);

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email is required' 
      }, { status: 400 });
    }

    // Check if student exists
    const existingStudent = await studentsCollection.findOne({ email: email.toLowerCase() });
    
    if (!existingStudent) {
      return NextResponse.json({ 
        success: false, 
        message: 'Student not found' 
      }, { status: 404 });
    }

    // Prepare update data
    const updateData = {
      updatedAt: new Date()
    };

    if (fullName) updateData.fullName = fullName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (college) updateData.college = college;
    if (grade) updateData.grade = grade;
    if (major) updateData.major = major;
    if (address) updateData.address = address;
    if (profilePhoto) updateData.profilePhoto = profilePhoto;

    console.log('Update data to be saved:', updateData);

    // Update student profile
    const result = await studentsCollection.updateOne(
      { email: email.toLowerCase() },
      { $set: updateData }
    );

    console.log('Database update result:', result);

    if (result.modifiedCount > 0) {
      // Fetch updated student data
      const updatedStudent = await studentsCollection.findOne({ email: email.toLowerCase() });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Student profile updated successfully',
        student: {
          id: updatedStudent._id.toString(),
          fullName: updatedStudent.fullName,
          studentId: updatedStudent.studentId,
          phoneNumber: updatedStudent.phoneNumber,
          college: updatedStudent.college,
          grade: updatedStudent.grade,
          major: updatedStudent.major,
          academicYear: updatedStudent.academicYear,
          address: updatedStudent.address,
          profilePhoto: updatedStudent.profilePhoto,
          qrCode: updatedStudent.qrCode,
          attendanceStats: updatedStudent.attendanceStats,
          status: updatedStudent.status,
          email: updatedStudent.email,
          updatedAt: updatedStudent.updatedAt
        }
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'No changes were made to the student profile' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating student profile:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update student profile', 
      error: error.message 
    }, { status: 500 });
  }
}