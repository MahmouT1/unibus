const { MongoClient } = require('mongodb');

async function checkUsers() {
  try {
    const mongoUri = 'mongodb://localhost:27017';
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db('student-portal');
    
    console.log('🔍 ALL USERS IN DATABASE:');
    console.log('=' .repeat(50));
    
    const users = await db.collection('users').find({}).toArray();
    
    if (users.length === 0) {
      console.log('❌ NO USERS FOUND IN DATABASE');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.role}) - ${user.fullName || 'No name'}`);
      });
    }
    
    console.log('');
    console.log('🔍 SEARCHING FOR SIMILAR EMAILS:');
    const searchEmail = 'm.raaaay2@gmail.com';
    console.log(`Looking for: ${searchEmail}`);
    
    // Search for similar emails
    const similarUsers = await db.collection('users').find({
      email: { $regex: 'm\\.r.*@gmail\\.com', $options: 'i' }
    }).toArray();
    
    if (similarUsers.length > 0) {
      console.log('📧 SIMILAR EMAILS FOUND:');
      similarUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.role}) - ${user.fullName || 'No name'}`);
        if (user.email === searchEmail) {
          console.log('   ✅ EXACT MATCH FOUND!');
        }
      });
    } else {
      console.log('❌ NO SIMILAR EMAILS FOUND');
    }
    
    await client.close();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUsers();
