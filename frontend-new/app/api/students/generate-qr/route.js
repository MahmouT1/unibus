import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import connectDB from '../../../../lib/mongodb.js';
import Student from '../../../../lib/models/Student.js';

export async function POST(request) {
  try {
    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find student
    const student = await Student.findOne({ 
      $or: [
        { studentId: studentId },
        { _id: studentId }
      ]
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    // Create QR code data with comprehensive student information
    const qrData = {
      id: student._id.toString(),
      studentId: student.studentId,
      fullName: student.fullName,
      email: student.email,
      phoneNumber: student.phoneNumber,
      college: student.college,
      major: student.major,
      grade: student.grade,
      address: student.address,
      profilePhoto: student.profilePhoto,
      timestamp: new Date().toISOString(),
      version: '2.0'
    };

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });

    // Update student with QR code
    await Student.findByIdAndUpdate(student._id, {
      qrCode: qrCodeDataURL,
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'QR code generated successfully',
      qrCode: qrCodeDataURL,
      student: {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        college: student.college,
        major: student.major,
        grade: student.grade
      },
      qrData: qrData
    });

  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to generate QR code',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'Student ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const student = await Student.findOne({ 
      $or: [
        { studentId: studentId },
        { _id: studentId }
      ]
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    if (!student.qrCode) {
      return NextResponse.json(
        { success: false, message: 'QR code not generated for this student' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      qrCode: student.qrCode,
      student: {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        college: student.college,
        major: student.major,
        grade: student.grade
      }
    });

  } catch (error) {
    console.error('QR retrieval error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to retrieve QR code',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
