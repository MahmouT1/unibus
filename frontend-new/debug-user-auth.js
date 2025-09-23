// Debug User Authentication - Run with: node debug-user-auth.js [email]

const { MongoClient } = require('mongodb');

async function debugUserAuth(email) {
  if (!email) {
    console.log('❌ Usage: node debug-user-auth.js [email]');
    console.log('   Example: node debug-user-auth.js m.raaaay2@gmail.com');
    return;
  }

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db('student-portal');
    
    console.log('🔍 DEBUG: User Authentication Analysis');
    console.log('=' .repeat(50));
    console.log(`📧 Searching for: ${email}`);
    console.log('');

    // Find user by email (case insensitive)
    const user = await db.collection('users').findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      console.log('❌ USER NOT FOUND');
      console.log('');
      console.log('🔧 SOLUTIONS:');
      console.log('1. Check if email is correct');
      console.log('2. Register the user first');
      console.log('3. Check database connection');
      
      // Show all users for reference
      const allUsers = await db.collection('users').find({}).toArray();
      console.log('');
      console.log('📋 ALL USERS IN DATABASE:');
      allUsers.forEach((u, index) => {
        console.log(`${index + 1}. ${u.email} (${u.role}) - ${u.fullName || 'No name'}`);
      });
      
    } else {
      console.log('✅ USER FOUND!');
      console.log('');
      console.log('👤 USER DETAILS:');
      console.log(`   ID: ${user._id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Full Name: ${user.fullName || 'Not set'}`);
      console.log(`   Active: ${user.isActive !== false ? 'Yes' : 'No'}`);
      console.log(`   Password Type: ${user.password?.startsWith('$2b$') ? 'Hashed' : 'Plain Text'}`);
      console.log(`   Created: ${user.createdAt || 'Unknown'}`);
      console.log('');
      
      console.log('🔧 AUTH STATUS:');
      console.log('   ✅ Email exists in database');
      console.log(`   ✅ Role: ${user.role}`);
      console.log(`   ✅ Password: ${user.password ? 'Set' : 'Missing'}`);
      console.log(`   ✅ Active: ${user.isActive !== false ? 'Yes' : 'No'}`);
      
      if (user.role) {
        console.log('');
        console.log('🎯 EXPECTED REDIRECT:');
        switch (user.role.toLowerCase()) {
          case 'admin':
            console.log('   → /admin/dashboard');
            break;
          case 'supervisor':
            console.log('   → /admin/supervisor-dashboard (desktop)');
            console.log('   → /admin/supervisor-mobile (mobile)');
            break;
          case 'student':
            console.log('   → /student/portal');
            break;
          default:
            console.log('   → / (homepage)');
        }
      }
      
      console.log('');
      console.log('✅ USER SHOULD BE ABLE TO LOGIN');
    }

    await client.close();
    
  } catch (error) {
    console.error('❌ DEBUG ERROR:', error);
  }
}

// Get email from command line arguments
const email = process.argv[2];
debugUserAuth(email);
