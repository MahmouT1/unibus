#!/usr/bin/env node
/**
 * اختبار: مسحة واحدة للطالب/يوم + عد الأيام الصحيح
 * يشغّل على السيرفر: node scripts/test-attendance-scan.js
 */
const http = require('http');

const BASE = process.env.BACKEND_URL || 'http://127.0.0.1:3001';
const FRONTEND = process.env.FRONTEND_URL || 'https://unibus.online';

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);
    const req = http.request(opts, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(buf || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, data: buf });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('=== اختبار مسحة الحضور وعد الأيام ===\n');
  console.log('Backend:', BASE, '\n');

  // 1. الحصول على وردية مفتوحة أو إنشاؤها
  const shiftsRes = await req('GET', '/api/shifts?status=open&limit=5');
  if (!shiftsRes.data.success || !shiftsRes.data.shifts?.length) {
    console.log('لا توجد وردية مفتوحة. جاري إنشاء وردية تجريبية...');
    const supervisors = await req('GET', '/api/admin/users/list').catch(() => ({ data: {} }));
    const supId = supervisors.data?.users?.[0]?._id || '68e1086b77d60ea14c1ddef2';
    const createRes = await req('POST', '/api/shifts', {
      supervisorId: supId,
      supervisorName: 'Test',
      supervisorEmail: 'test@test.com'
    });
    if (!createRes.data.success) {
      console.log('❌ فشل إنشاء وردية:', createRes.data);
      return;
    }
    console.log('✅ تم إنشاء وردية');
  }

  const shiftsRes2 = await req('GET', '/api/shifts?status=open&limit=5');
  const shifts = shiftsRes2.data.shifts || [];
  if (!shifts.length) {
    console.log('❌ لا توجد وردية مفتوحة');
    return;
  }
  const shiftId = shifts[0]._id || shifts[0].id;
  console.log('الوردية المستخدمة:', shiftId);

  // 2. طالب للتجربة (من الحسابات المعروفة)
  const testStudent = {
    email: 'test.student@unibus.online',
    studentId: 'STU-TEST-001',
    fullName: 'Test Student'
  };
  const qrPayload = JSON.stringify(testStudent);

  // 3. المسحة الأولى
  console.log('\n--- المسحة الأولى ---');
  const scan1 = await req('POST', '/api/shifts/scan', {
    qrCodeData: qrPayload,
    shiftId,
    supervisorId: shifts[0].supervisorId
  });
  if (scan1.status === 200 && scan1.data.success) {
    console.log('✅ المسحة الأولى نجحت');
  } else if (scan1.status === 409) {
    console.log('⚠️ الطالب مسجل حضور اليوم مسبقاً (متوقع إذا كان الاختبار يعاد)');
  } else {
    console.log('نتيجة المسحة الأولى:', scan1.status, scan1.data);
  }

  // 4. المسحة الثانية (نفس الطالب، نفس اليوم) - يجب أن تفشل
  console.log('\n--- المسحة الثانية (نفس الطالب، نفس اليوم) - يجب أن تُرفض ---');
  const scan2 = await req('POST', '/api/shifts/scan', {
    qrCodeData: qrPayload,
    shiftId,
    supervisorId: shifts[0].supervisorId
  });
  if (scan2.status === 409) {
    console.log('✅ تم رفض المسحة المكررة بشكل صحيح');
  } else if (scan2.status === 200 && scan2.data.success) {
    console.log('❌ خطأ: تم قبول المسحة المكررة (يجب رفضها)');
  } else {
    console.log('نتيجة:', scan2.status, scan2.data);
  }

  // 5. التحقق من عدد الأيام في Student Search
  console.log('\n--- التحقق من عدد الأيام في Student Search ---');
  const searchUrl = `${FRONTEND}/api/students/search?search=test.student&limit=5`;
  let searchData = null;
  try {
    const searchRes = await new Promise((res, rej) => {
      const u = new URL(searchUrl);
      const opts = { hostname: u.hostname, path: u.pathname + u.search, method: 'GET' };
      const r = require('https').request(opts, resp => {
        let buf = '';
        resp.on('data', c => buf += c);
        resp.on('end', () => { try { res({ ok: resp.statusCode === 200, data: JSON.parse(buf) }); } catch (e) { res({ ok: false }); } });
      });
      r.on('error', rej);
      r.end();
    });
    if (searchRes.ok && searchRes.data) searchData = searchRes.data;
  } catch (e) {}
  if (searchData) {
    const students = (searchData.data && searchData.data.students) || [];
    const found = students.find(s => (s.email || '').toLowerCase().includes('test.student'));
    if (found) {
      console.log(`الطالب: ${found.fullName}, أيام الحضور: ${found.attendanceCount ?? 0}`);
      if ((found.attendanceCount ?? 0) >= 1) {
        console.log('✅ عد الأيام يعمل بشكل صحيح');
      } else {
        console.log('⚠️ عد الأيام قد يكون غير مكتمل (تحقق يدوياً)');
      }
    } else {
      console.log('لم يُعثر على الطالب في نتائج البحث');
    }
  } else {
    console.log('(تخطي فحص Student Search)');
  }

  console.log('\n=== نهاية الاختبار ===');
}

main().catch(e => {
  console.error('خطأ:', e.message);
  process.exit(1);
});
