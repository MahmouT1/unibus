const { MongoClient } = require('mongodb');

async function checkPassword() {
  try {
    const mongoUri = 'mongodb://localhost:27017';
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db('student-portal');
    
    const user = await db.collection('users').findOne({
      email: 'm.raaaaay2@gmail.com'
    });
    
    if (user) {
      console.log('✅ USER FOUND:');
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Name:', user.fullName);
      console.log('Password type:', user.password.startsWith('$2b$') ? 'Hashed' : 'Plain text');
      console.log('Actual password:', user.password);
      console.log('');
      
      // Test different common passwords
      const testPasswords = [
        'mohamed1234',
        'supervisor123',
        'password',
        '123456',
        'admin123',
        user.fullName,
        user.fullName.toLowerCase()
      ];
      
      console.log('🧪 TESTING COMMON PASSWORDS:');
      for (const testPass of testPasswords) {
        if (user.password === testPass) {
          console.log(`✅ CORRECT PASSWORD FOUND: "${testPass}"`);
          break;
        } else {
          console.log(`❌ "${testPass}" - No match`);
        }
      }
    } else {
      console.log('❌ User not found');
    }
    
    await client.close();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkPassword();
