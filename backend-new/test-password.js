const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

async function testPassword() {
  try {
    const mongoUri = 'mongodb://localhost:27017';
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db('student-portal');
    
    const user = await db.collection('users').findOne({
      email: 'm.raaaaay2@gmail.com'
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ Testing password for:', user.email);
    console.log('Stored hash:', user.password);
    console.log('');
    
    // Test common passwords
    const testPasswords = [
      'mohamed1234',
      'supervisor123', 
      'password',
      '123456',
      'admin123',
      'mohamedtarek',
      'supervisor',
      'admin',
      'student',
      'password123',
      '12345678',
      'qwerty',
      'abc123',
      'test123',
      'user123',
      'pass123'
    ];
    
    console.log('🧪 TESTING PASSWORDS:');
    
    for (const testPass of testPasswords) {
      try {
        const isValid = await bcrypt.compare(testPass, user.password);
        if (isValid) {
          console.log(`🎉 CORRECT PASSWORD FOUND: "${testPass}"`);
          console.log('');
          console.log('✅ Use this to login:');
          console.log(`Email: ${user.email}`);
          console.log(`Password: ${testPass}`);
          console.log(`Role: ${user.role}`);
          await client.close();
          return;
        } else {
          console.log(`❌ "${testPass}" - No match`);
        }
      } catch (error) {
        console.log(`❌ "${testPass}" - Error testing`);
      }
    }
    
    console.log('');
    console.log('❌ None of the common passwords matched.');
    console.log('💡 The password might be something custom that was set when the account was created.');
    
    await client.close();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testPassword();
