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

async function testLogin(email, password, role, useAuthApi = false) {
  const url = useAuthApi ? 'https://unibus.online/auth-api/login' : 'https://unibus.online/api/proxy/auth/login';
  const body = useAuthApi ? { email, password } : { email, password, role };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return data.success ? 'OK' : (data.message || 'FAIL');
  } catch (e) {
    return 'ERROR: ' + e.message;
  }
}

(async () => {
  console.log('=== Via /api/proxy/auth/login ===');
  for (const s of credentials.supervisors) {
    const result = await testLogin(s.email, s.password, 'supervisor');
    console.log(`  ${s.email}: ${result}`);
  }
  for (const a of credentials.admins) {
    const result = await testLogin(a.email, a.password, 'admin');
    console.log(`  ${a.email}: ${result}`);
  }
  console.log('\n=== Via /auth-api/login (no role) ===');
  const r = await testLogin('vodojoe123@gmail.com', 'Vodx123', null, true);
  console.log(`  vodojoe123@gmail.com: ${r}`);
})();
