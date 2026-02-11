/**
 * Test script for Student Search attendance modal API
 * Tests: GET students -> POST with _id -> verify attendance records
 */
const BASE = process.env.FRONTEND_URL || 'http://localhost:3002';

async function test() {
  console.log('=== Testing Student Search & Attendance Modal API ===\n');
  console.log('Frontend URL:', BASE);

  try {
    // 1. GET students to get a student _id
    console.log('\n1. Fetching students list...');
    const listRes = await fetch(`${BASE}/api/students/search?search=&page=1&limit=5`);
    const listData = await listRes.json();
    
    if (!listData.success || !listData.data?.students?.length) {
      console.log('   No students found. Ensure DB has students.');
      console.log('   Response:', JSON.stringify(listData, null, 2).slice(0, 500));
      return;
    }
    const student = listData.data.students[0];
    console.log('   OK. First student:', student.fullName, '| _id:', student._id);

    // 2. POST to get attendance records for this student
    console.log('\n2. Fetching attendance for student _id:', student._id);
    const postRes = await fetch(`${BASE}/api/students/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: student._id, email: student.email })
    });
    const postData = await postRes.json();

    if (!postData.success) {
      console.log('   FAIL:', postData.message || postData);
      return;
    }
    const records = postData.data?.attendance?.records || [];
    console.log('   OK. Attendance records count:', records.length);
    if (records.length > 0) {
      const r = records[0];
      console.log('   Sample record:', {
        studentName: r.studentName,
        college: r.college,
        scanTime: r.scanTime || r.checkInTime,
        status: r.status
      });
    }
    console.log('\n=== All API tests passed! ===');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
