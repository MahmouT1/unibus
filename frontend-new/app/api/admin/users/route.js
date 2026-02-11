import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb.js';
import User from '../../../../lib/models/User.js';
import Student from '../../../../lib/models/Student.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search');

    await connectDB();

    // Build query
    let query = {};

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await User.countDocuments(query);

    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .populate('studentId', 'studentId fullName college major grade')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: users.length,
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        limit
      }
    });

  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch users',
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
      email, 
      password, 
      fullName, 
      role, 
      studentData 
    } = body;

    // Validate required fields
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { success: false, message: 'Email, password, full name, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'supervisor', 'student'].includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    let studentId = null;

    // If creating a student user, create student record first
    if (role === 'student' && studentData) {
      const student = new Student({
        studentId: studentData.studentId,
        fullName: fullName,
        email: email.toLowerCase(),
        phoneNumber: studentData.phoneNumber,
        college: studentData.college,
        major: studentData.major,
        grade: studentData.grade,
        address: studentData.address || ''
      });

      await student.save();
      studentId = student._id;
    }

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password, // Will be hashed by pre-save middleware
      fullName,
      role,
      studentId,
      status: 'active'
    });

    await user.save();

    // Return user without password
    const userResponse = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      permissions: user.permissions,
      studentId: user.studentId,
      createdAt: user.createdAt
    };

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: userResponse
    }, { status: 201 });

  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create user',
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
      fullName, 
      role, 
      status,
      permissions 
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (role) user.role = role;
    if (status) user.status = status;
    if (permissions) user.permissions = { ...user.permissions, ...permissions };

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        permissions: user.permissions,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update user',
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
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // If user was a student, also delete student record
    if (user.studentId) {
      await Student.findByIdAndDelete(user.studentId);
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      deletedUser: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });

  } catch (error) {
    console.error('User deletion error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete user',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
