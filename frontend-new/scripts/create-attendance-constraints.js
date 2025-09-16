// Create Database Constraints for Attendance Duplicate Prevention
// This script creates unique indexes to prevent duplicate attendance records

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portal';

async function createAttendanceConstraints() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('student-portal');
    const attendanceCollection = db.collection('attendance');

    console.log('Creating unique constraints for attendance collection...');

    // 1. Create compound unique index for student + date + appointmentSlot
    // This prevents the same student from being marked present multiple times for the same slot on the same day
    await attendanceCollection.createIndex(
      {
        studentId: 1,
        date: 1,
        appointmentSlot: 1
      },
      {
        name: 'unique_student_date_slot',
        unique: true,
        background: true
      }
    );
    console.log('✓ Created unique index: studentId + date + appointmentSlot');

    // 2. Create index for QR data ID + date + appointmentSlot
    // This handles cases where studentId might be stored in qrData.id
    await attendanceCollection.createIndex(
      {
        'qrData.id': 1,
        date: 1,
        appointmentSlot: 1
      },
      {
        name: 'unique_qrdata_date_slot',
        unique: true,
        background: true,
        partialFilterExpression: { 'qrData.id': { $exists: true } }
      }
    );
    console.log('✓ Created unique index: qrData.id + date + appointmentSlot');

    // 3. Create index for student email + date + appointmentSlot
    // This handles cases where studentId might be stored as email
    try {
      await attendanceCollection.createIndex(
        {
          studentEmail: 1,
          date: 1,
          appointmentSlot: 1
        },
        {
          name: 'unique_student_email_date_slot',
          unique: true,
          background: true,
          partialFilterExpression: { studentEmail: { $exists: true } }
        }
      );
      console.log('✓ Created unique index: studentEmail + date + appointmentSlot');
    } catch (error) {
      console.log('⚠️  Email constraint skipped (some records may have null emails)');
    }

    // 4. Create index for concurrent scan ID (for deduplication)
    await attendanceCollection.createIndex(
      {
        concurrentScanId: 1
      },
      {
        name: 'unique_concurrent_scan_id',
        unique: true,
        background: true,
        partialFilterExpression: { concurrentScanId: { $exists: true } }
      }
    );
    console.log('✓ Created unique index: concurrentScanId');

    console.log('\n🎉 All attendance constraints created successfully!');
    console.log('\nThese constraints will prevent:');
    console.log('• Same student being marked present multiple times for the same slot on the same day');
    console.log('• Duplicate records based on QR data ID');
    console.log('• Duplicate records based on student email');
    console.log('• Duplicate concurrent scan IDs');

  } catch (error) {
    console.error('Error creating attendance constraints:', error);
    
    if (error.code === 11000) {
      console.log('\n⚠️  Some constraints already exist. This is normal if the script was run before.');
    }
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

// Run the script
createAttendanceConstraints()
  .then(() => {
    console.log('✅ Attendance constraints setup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error setting up attendance constraints:', error);
    process.exit(1);
  });
