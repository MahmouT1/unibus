// Run on server: node scripts/test-logins-server.js
// Tests backend directly at 127.0.0.1:3001
const http = require('http');

const credentials = {
  supervisors: [
    { email: 'sasasona@gmail.com', password: 'Sons123' },
    { email: 'vodojoe123@gmail.com', password: 'Vodx123' },
    { email: 'zoma144@gmail.com', password: 'Mezo001' },
    { email: 'islam123@gmail.com', password: 'islamzero123' },
    { email: 'abuzaid123@gmail.com', password: 'Abuz002' },
    { email: 'omarredatuning@gmail.com', password: 'omarReda123' }
  ],
  admins: [
    { email: 'azabuni123@gmail.com', password: 'Unibus00444' },
    { email: 'sonauni333@gmail.com', password: 'Mostafuni0707' }
  ]
};

function testLogin(email, password, role) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ email, password, role });
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          resolve(j.success ? 'OK' : (j.message || 'FAIL'));
        } catch (e) {
          resolve('PARSE_ERR');
        }
      });
    });
    req.on('error', e => resolve('ERR: ' + e.message));
    req.write(body);
    req.end();
  });
}

(async () => {
  console.log('=== Test from server (127.0.0.1:3001) ===\n');
  console.log('Supervisors (6):');
  for (const s of credentials.supervisors) {
    const r = await testLogin(s.email, s.password, 'supervisor');
    console.log('  ' + s.email + ': ' + r);
  }
  console.log('\nAdmins (2):');
  for (const a of credentials.admins) {
    const r = await testLogin(a.email, a.password, 'admin');
    console.log('  ' + a.email + ': ' + r);
  }
})();
