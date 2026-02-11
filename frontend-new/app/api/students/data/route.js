import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb.js';
import Student from '../../../../lib/models/Student.js';
import User from '../../../../lib/models/User.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const studentId = searchParams.get('studentId');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search');
    const college = searchParams.get('college');
    const grade = searchParams.get('grade');
    const status = searchParams.get('status');

    await connectDB();

    // Build query
    let query = {};

    if (email) {
      query.email = email;
    }

    if (studentId) {
      query.studentId = studentId;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } },
        { major: { $regex: search, $options: 'i' } }
      ];
    }

    if (college) {
      query.college = { $regex: college, $options: 'i' };
    }

    if (grade) {
      query.grade = grade;
    }

    if (status) {
      query.status = status;
    }

    // Get total count for pagination
    const total = await Student.countDocuments(query);

    // Get students with pagination
    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-password');

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      success: true,
      students,
      pagination: {
        current: page,
        total: totalPages,
        count: students.length,
        totalStudents: total,
        hasNext,
        hasPrev,
        limit
      }
    });

  } catch (error) {
    console.error('Students data error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch students data',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      studentId, 
      fullName, 
      email, 
      phoneNumber, 
      college, 
      major, 
      grade, 
      address,
      profilePhoto 
    } = body;

    // Validate required fields
    if (!studentId || !fullName || !email || !phoneNumber || !college || !major || !grade) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [
        { studentId },
        { email }
      ]
    });

    if (existingStudent) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Student with this ID or email already exists' 
        },
        { status: 409 }
      );
    }

    // Create new student
    const student = new Student({
      studentId,
      fullName,
      email: email.toLowerCase(),
      phoneNumber,
      college,
      major,
      grade,
      address: address || '',
      profilePhoto: profilePhoto || null,
      status: 'active'
    });

    await student.save();

    return NextResponse.json({
      success: true,
      message: 'Student created successfully',
      student: {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        phoneNumber: student.phoneNumber,
        college: student.college,
        major: student.major,
        grade: student.grade,
        status: student.status,
        createdAt: student.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Student creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create student',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { 
      id,
      studentId, 
      fullName, 
      email, 
      phoneNumber, 
      college, 
      major, 
      grade, 
      address,
      profilePhoto,
      status 
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Student ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find and update student
    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (studentId) student.studentId = studentId;
    if (fullName) student.fullName = fullName;
    if (email) student.email = email.toLowerCase();
    if (phoneNumber) student.phoneNumber = phoneNumber;
    if (college) student.college = college;
    if (major) student.major = major;
    if (grade) student.grade = grade;
    if (address !== undefined) student.address = address;
    if (profilePhoto !== undefined) student.profilePhoto = profilePhoto;
    if (status) student.status = status;

    await student.save();

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully',
      student: {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        phoneNumber: student.phoneNumber,
        college: student.college,
        major: student.major,
        grade: student.grade,
        address: student.address,
        profilePhoto: student.profilePhoto,
        status: student.status,
        updatedAt: student.updatedAt
      }
    });

  } catch (error) {
    console.error('Student update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update student',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Student ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find and delete student
    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    // Also delete related user account if exists
    await User.findOneAndDelete({ email: student.email });

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully',
      deletedStudent: {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email
      }
    });

  } catch (error) {
    console.error('Student deletion error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete student',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
