// routes/reset-term.js - بدء تيرم جديد (تصفير أيام الحضور فقط)
const express = require('express');
const router = express.Router();
const { getDatabase } = require('../lib/mongodb-simple-connection');

// POST /api/admin/reset-term - تصفير أيام الحضور لبدء تيرم جديد
// لا يحذف الحسابات أو الطلاب أو الاشتراكات - فقط بيانات الحضور
router.post('/reset-term', async (req, res) => {
  try {
    const db = await getDatabase();
    const attendanceCollection = db.collection('attendance');
    const shiftsCollection = db.collection('shifts');
    const studentsCollection = db.collection('students');
    const usersCollection = db.collection('users');

    // 1. حذف جميع سجلات الحضور
    const attendanceResult = await attendanceCollection.deleteMany({});
    console.log('🗑️ Deleted attendance records:', attendanceResult.deletedCount);

    // 2. تصفير attendanceRecords و totalScans في جميع الورديات
    const shiftsResult = await shiftsCollection.updateMany(
      {},
      {
        $set: {
          attendanceRecords: [],
          totalScans: 0,
          updatedAt: new Date()
        }
      }
    );
    console.log('📋 Reset shifts:', shiftsResult.modifiedCount);

    // 3. تصفير attendanceStats لجميع الطلاب في collection students
    const studentsResetFields = {
      'attendanceStats.daysRegistered': 0,
      'attendanceStats.remainingDays': 180,
      'attendanceStats.attendanceRate': 0,
      'attendanceStats.totalScans': 0,
      'attendanceStats.totalAttendance': 0,
      'attendanceStats.lastScanDate': null,
      updatedAt: new Date()
    };
    const studentsResult = await studentsCollection.updateMany({}, { $set: studentsResetFields });
    console.log('👥 Reset students attendance:', studentsResult.modifiedCount);

    // 4. تصفير attendanceStats للطلاب في collection users
    const usersResult = await usersCollection.updateMany(
      { role: 'student' },
      { $set: studentsResetFields }
    );
    console.log('👤 Reset users (students) attendance:', usersResult.modifiedCount);

    return res.json({
      success: true,
      message: 'تم بدء التيرم الجديد بنجاح. تم تصفير أيام الحضور فقط.',
      details: {
        attendanceRecordsDeleted: attendanceResult.deletedCount,
        shiftsReset: shiftsResult.modifiedCount,
        studentsReset: studentsResult.modifiedCount,
        usersReset: usersResult.modifiedCount
      }
    });
  } catch (error) {
    console.error('❌ Reset term error:', error);
    return res.status(500).json({
      success: false,
      message: 'فشل في بدء التيرم الجديد',
      error: error.message
    });
  }
});

module.exports = router;
