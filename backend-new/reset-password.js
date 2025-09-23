const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

async function resetPassword() {
  try {
    const mongoUri = 'mongodb://localhost:27017';
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db('student-portal');
    
    const email = 'm.raaaaay2@gmail.com';
    const newPassword = 'supervisor123';
    
    console.log('🔧 RESETTING PASSWORD...');
    console.log(`Email: ${email}`);
    console.log(`New Password: ${newPassword}`);
    console.log('');
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update the user's password
    const result = await db.collection('users').updateOne(
      { email: email },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount > 0) {
      console.log('✅ PASSWORD RESET SUCCESSFUL!');
      console.log('');
      console.log('🎯 LOGIN CREDENTIALS:');
      console.log(`Email: ${email}`);
      console.log(`Password: ${newPassword}`);
      console.log(`Role: supervisor`);
      console.log('');
      console.log('🚀 You can now login at: http://localhost:3000/auth');
    } else {
      console.log('❌ Password reset failed - user not found');
    }
    
    await client.close();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

resetPassword();
