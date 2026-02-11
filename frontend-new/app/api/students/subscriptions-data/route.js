import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-simple-connection';

export async function GET(request) {
  try {
    console.log('📊 Fetching subscription data from subscriptions collection...');
    const db = await getDatabase();
    
    const { searchParams } = new URL(request.url);
    const adminView = searchParams.get('admin') === 'true';
    
    if (!adminView) {
      return NextResponse.json({
        success: false,
        message: 'Admin access required'
      }, { status: 403 });
    }
    
    // Get data from subscriptions collection (where your real data is)
    const subscriptionsCollection = db.collection('subscriptions');
    
    // Get all subscription records
    const subscriptionRecords = await subscriptionsCollection.find({}).toArray();
    console.log(`📋 Found ${subscriptionRecords.length} subscription records`);
    
    // Convert subscription records to student format expected by frontend
    const studentsObject = {};
    
    subscriptionRecords.forEach((record, index) => {
      if (record.studentEmail) {
        // Extract student info from subscription record
        const studentEmail = record.studentEmail;
        
        studentsObject[studentEmail] = {
          id: record._id.toString(),
          fullName: record.studentName || `Student ${index + 1}`,
          studentId: record.studentId || `STU-${record._id.toString().slice(-6)}`,
          phoneNumber: record.phoneNumber || '',
          college: record.college || '',
          grade: record.grade || '',
          major: record.major || '',
          academicYear: record.academicYear || record.grade || '',
          address: record.address || '',
          profilePhoto: record.profilePhoto || '',
          qrCode: record.qrCode || `QR-${record._id.toString().slice(-6)}`,
          attendanceStats: { totalScans: 0, lastScanDate: null },
          status: record.status || 'active',
          email: studentEmail,
          updatedAt: record.updatedAt || new Date(),
          
          // Subscription specific fields from your data
          subscriptionStatus: record.status || 'active',
          subscriptionType: record.subscriptionType || 'monthly',
          subscriptionExpiry: record.renewalDate || null,
          totalPaid: record.totalPaid || 0,
          renewalDate: record.renewalDate || null,
          confirmationDate: record.confirmationDate || null,
          lastPaymentDate: record.lastPaymentDate || null,
          
          // Additional fields from your subscription data
          payments: record.payments || [],
          createdAt: record.createdAt || new Date()
        };
      }
    });
    
    console.log(`✅ Converted ${Object.keys(studentsObject).length} subscription records to student format`);
    console.log('📋 Student emails found:', Object.keys(studentsObject));
    
    // Add some sample data if no subscriptions found (for testing)
    if (Object.keys(studentsObject).length === 0) {
      console.log('⚠️ No subscription data found, adding sample data for testing');
      studentsObject['test@example.com'] = {
        id: 'test123',
        fullName: 'Test Student',
        studentId: 'STU-TEST',
        phoneNumber: '1234567890',
        college: 'Test College',
        grade: 'Test Grade',
        major: 'Test Major',
        email: 'test@example.com',
        subscriptionStatus: 'inactive',
        subscriptionType: 'none',
        totalPaid: 0,
        status: 'active'
      };
    }
    
    return NextResponse.json({
      success: true,
      students: studentsObject,
      debug: {
        totalSubscriptionRecords: subscriptionRecords.length,
        studentsConverted: Object.keys(studentsObject).length,
        sampleRecord: subscriptionRecords[0] || null
      }
    });

  } catch (error) {
    console.error('❌ Error fetching subscription data:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch subscription data',
      error: error.message
    }, { status: 500 });
  }
}
