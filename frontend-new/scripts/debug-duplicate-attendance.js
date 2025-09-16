// Debug script to check for duplicate attendance records
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portal';

async function debugDuplicateAttendance() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('student-portal');
    const attendanceCollection = db.collection('attendance');

    // Get today's attendance records
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('Checking attendance records for today:', startOfDay.toISOString(), 'to', endOfDay.toISOString());

    // Get all attendance records for today
    const todayRecords = await attendanceCollection.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).toArray();

    console.log(`\nTotal attendance records today: ${todayRecords.length}`);

    // Group by student to find duplicates
    const studentGroups = {};
    
    todayRecords.forEach(record => {
      const studentId = record.studentId || record.qrData?.id || record.studentEmail;
      const studentName = record.studentName || record.qrData?.fullName;
      
      if (!studentGroups[studentId]) {
        studentGroups[studentId] = [];
      }
      
      studentGroups[studentId].push({
        id: record._id,
        studentId: record.studentId,
        studentName: studentName,
        supervisorId: record.supervisorId,
        supervisorName: record.supervisorName,
        appointmentSlot: record.appointmentSlot,
        checkInTime: record.checkInTime,
        date: record.date,
        qrData: record.qrData
      });
    });

    // Find duplicates
    const duplicates = [];
    Object.keys(studentGroups).forEach(studentId => {
      if (studentGroups[studentId].length > 1) {
        duplicates.push({
          studentId: studentId,
          studentName: studentGroups[studentId][0].studentName,
          records: studentGroups[studentId]
        });
      }
    });

    if (duplicates.length > 0) {
      console.log(`\n🚨 FOUND ${duplicates.length} STUDENTS WITH DUPLICATE ATTENDANCE:`);
      
      duplicates.forEach((duplicate, index) => {
        console.log(`\n${index + 1}. Student: ${duplicate.studentName} (ID: ${duplicate.studentId})`);
        console.log(`   Records: ${duplicate.records.length}`);
        
        duplicate.records.forEach((record, recordIndex) => {
          console.log(`   ${recordIndex + 1}. Supervisor: ${record.supervisorName} (${record.supervisorId})`);
          console.log(`      Slot: ${record.appointmentSlot}`);
          console.log(`      Time: ${record.checkInTime}`);
          console.log(`      Record ID: ${record.id}`);
        });
      });
    } else {
      console.log('\n✅ No duplicate attendance records found for today');
    }

    // Show recent records
    console.log('\n📋 Recent attendance records (last 10):');
    const recentRecords = await attendanceCollection.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort({ checkInTime: -1 }).limit(10).toArray();

    recentRecords.forEach((record, index) => {
      console.log(`${index + 1}. ${record.studentName} - ${record.supervisorName} - ${record.appointmentSlot} - ${record.checkInTime}`);
    });

  } catch (error) {
    console.error('Error debugging attendance:', error);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the debug script
debugDuplicateAttendance()
  .then(() => {
    console.log('✅ Debug completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });
