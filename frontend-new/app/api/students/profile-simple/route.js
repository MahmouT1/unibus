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
      // Return all students for admin view from both collections
      const usersCollection = db.collection('users');
      
      const [studentsFromStudents, studentsFromUsers] = await Promise.all([
        studentsCollection.find({}).toArray(),
        usersCollection.find({ role: 'student' }).toArray()
      ]);
      
      // Combine and deduplicate students
      const allStudents = [...studentsFromStudents, ...studentsFromUsers];
      const uniqueStudents = allStudents.filter((student, index, self) => 
        index === self.findIndex(s => s.email === student.email)
      );
      
      // Convert to object format for compatibility with existing frontend
      const studentsObject = {};
      uniqueStudents.forEach(student => {
        studentsObject[student.email] = {
          id: student._id.toString(),
          fullName: student.fullName || student.name || 'Unknown',
          studentId: student.studentId || `STU-${student._id.toString().slice(-6)}`,
          phoneNumber: student.phoneNumber || student.phone || '',
          college: student.college || '',
          grade: student.grade || student.academicYear || '',
          major: student.major || '',
          academicYear: student.academicYear || student.grade || '',
          address: student.address || '',
          profilePhoto: student.profilePhoto || '',
          qrCode: student.qrCode || `QR-${student._id.toString().slice(-6)}`,
          attendanceStats: student.attendanceStats || { totalScans: 0, lastScanDate: null },
          status: student.status || 'active',
          email: student.email,
          updatedAt: student.updatedAt || new Date()
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
      // Create new student record for registration
      console.log('Creating new student record for:', email);
      
      const newStudent = {
        email: email.toLowerCase(),
        fullName: fullName || '',
        phoneNumber: phoneNumber || '',
        college: college || '',
        grade: grade || '',
        major: major || '',
        address: address || '',
        profilePhoto: profilePhoto || '',
        studentId: `STU-${Date.now()}`, // Generate unique student ID
        qrCode: `QR-${Date.now()}`, // Generate QR code
        status: 'active',
        attendanceStats: {
          totalScans: 0,
          lastScanDate: null
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const insertResult = await studentsCollection.insertOne(newStudent);
      console.log('New student created with ID:', insertResult.insertedId);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Student profile created successfully',
        student: {
          id: insertResult.insertedId.toString(),
          fullName: newStudent.fullName,
          studentId: newStudent.studentId,
          phoneNumber: newStudent.phoneNumber,
          college: newStudent.college,
          grade: newStudent.grade,
          major: newStudent.major,
          academicYear: newStudent.grade,
          address: newStudent.address,
          profilePhoto: newStudent.profilePhoto,
          qrCode: newStudent.qrCode,
          attendanceStats: newStudent.attendanceStats,
          status: newStudent.status,
          email: newStudent.email,
          updatedAt: newStudent.updatedAt
        }
      });
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