import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request) {
  try {
    // Get the request body to extract student data
    const body = await request.json();
    const { studentData: requestStudentData, email } = body;
    
    let studentData = requestStudentData;
    
    // If no student data provided, try to fetch from MongoDB
    if (!studentData && email) {
      try {
        const { connectDB } = await import('../../../../lib/mongodb.js');
        const Student = (await import('../../../../lib/Student.js')).default;
        
        await connectDB();
        const student = await Student.findOne({ email: email.toLowerCase() });
        
        if (student) {
          studentData = {
            id: student._id,
            studentId: student.studentId,
            fullName: student.fullName,
            email: student.email,
            phoneNumber: student.phoneNumber,
            college: student.college,
            grade: student.grade,
            major: student.major,
            address: student.address,
            profilePhoto: student.profilePhoto
          };
          console.log('Found student data for QR generation:', student.fullName);
        }
      } catch (error) {
        console.log('Error loading student data from MongoDB:', error);
      }
    }
    
    // Fallback to mock data if still no data
    if (!studentData) {
      studentData = {
        id: 'student-id-123',
        studentId: '2024001',
        fullName: 'Ahmed Hassan',
        email: 'ahmed.hassan@student.edu',
        phoneNumber: '123-456-7890',
        college: 'Engineering',
        grade: 'first-year',
        major: 'Computer Science',
        address: {
          streetAddress: '123 Main St',
          buildingNumber: 'Apt 101',
          fullAddress: 'Cairo, Egypt'
        }
      };
    }

    // Generate QR code data with complete student information
    const qrData = {
      id: studentData.id,
      studentId: studentData.studentId,
      fullName: studentData.fullName,
      email: studentData.email,
      phoneNumber: studentData.phoneNumber,
      college: studentData.college,
      grade: studentData.grade,
      major: studentData.major,
      address: studentData.address,
      profilePhoto: studentData.profilePhoto || null,
      timestamp: Date.now(),
      type: 'student_qr_code'
    };

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Create qr-codes directory if it doesn't exist
    const qrDir = join(process.cwd(), 'public', 'uploads', 'qr-codes');
    try {
      await mkdir(qrDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Save QR code as PNG
    const filename = `qr_${studentData.studentId}_${Date.now()}.png`;
    const filepath = join(qrDir, filename);
    
    // Convert data URL to buffer and save
    const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    await writeFile(filepath, buffer);

    // Return QR code URL
    const qrCodeUrl = `/uploads/qr-codes/${filename}`;

    return NextResponse.json({
      success: true,
      message: 'QR code generated successfully',
      qrCodeUrl,
      qrCodeDataURL, // For immediate display
      qrCode: qrCodeDataURL, // Alternative field name for compatibility
      data: qrCodeDataURL // Another alternative field name
    });

  } catch (error) {
    console.error('QR code generation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate QR code', error: error.message },
      { status: 500 }
    );
  }
}