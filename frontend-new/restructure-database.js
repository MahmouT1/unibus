const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function restructureDatabase() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('student-portal');
    
    console.log('\n🗑️ STEP 1: Cleaning old user accounts...');
    
    // Delete all existing user accounts from all collections
    const deleteResults = await Promise.all([
      db.collection('users').deleteMany({}),
      db.collection('admins').deleteMany({}),
      db.collection('supervisors').deleteMany({})
    ]);
    
    console.log(`✅ Deleted ${deleteResults[0].deletedCount} users`);
    console.log(`✅ Deleted ${deleteResults[1].deletedCount} admins`);
    console.log(`✅ Deleted ${deleteResults[2].deletedCount} supervisors`);
    
    console.log('\n👥 STEP 2: Creating unified user accounts...');
    
    // Create unified user accounts with roles
    const unifiedUsers = [
      // Admin accounts
      {
        email: 'admin@unibus.edu',
        password: await bcrypt.hash('admin123', 12),
        fullName: 'System Administrator',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        permissions: ['all']
      },
      {
        email: 'roo2admin@gmail.com',
        password: await bcrypt.hash('admin123', 12),
        fullName: 'Root Administrator',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        permissions: ['all']
      },
      
      // Supervisor accounts
      {
        email: 'supervisor@unibus.edu',
        password: await bcrypt.hash('supervisor123', 12),
        fullName: 'Main Supervisor',
        role: 'supervisor',
        isActive: true,
        createdAt: new Date(),
        permissions: ['attendance', 'qr-scan', 'reports']
      },
      {
        email: 'ahmedazab@gmail.com',
        password: await bcrypt.hash('supervisor123', 12),
        fullName: 'أحمد عزب',
        role: 'supervisor',
        isActive: true,
        createdAt: new Date(),
        permissions: ['attendance', 'qr-scan', 'reports']
      },
      
      // Student accounts
      {
        email: 'student@unibus.edu',
        password: await bcrypt.hash('student123', 12),
        fullName: 'Test Student',
        role: 'student',
        isActive: true,
        createdAt: new Date(),
        studentId: 'STU-001',
        college: 'Engineering',
        grade: 'Year 3',
        major: 'Computer Science'
      },
      {
        email: 'ahmed@student.edu',
        password: await bcrypt.hash('student123', 12),
        fullName: 'أحمد محمد علي',
        role: 'student',
        isActive: true,
        createdAt: new Date(),
        studentId: 'STU-002',
        college: 'كلية الهندسة',
        grade: 'السنة الثالثة',
        major: 'هندسة حاسوب'
      }
    ];
    
    // Insert all unified users
    const insertResult = await db.collection('users').insertMany(unifiedUsers);
    console.log(`✅ Created ${insertResult.insertedCount} unified user accounts`);
    
    console.log('\n📊 STEP 3: Verifying database structure...');
    
    // Verify other collections remain intact
    const collections = ['students', 'attendance', 'subscriptions', 'support-tickets', 'transportation'];
    
    for (const collectionName of collections) {
      try {
        const count = await db.collection(collectionName).countDocuments();
        console.log(`✅ ${collectionName}: ${count} records preserved`);
      } catch (error) {
        console.log(`ℹ️ ${collectionName}: Collection doesn't exist (normal)`);
      }
    }
    
    console.log('\n🎯 STEP 4: Creating indexes for performance...');
    
    // Create indexes for better performance
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ email: 1, role: 1 });
    
    console.log('✅ Created database indexes');
    
    console.log('\n✅ DATABASE RESTRUCTURING COMPLETE!');
    console.log('\n📋 UNIFIED USER ACCOUNTS CREATED:');
    console.log('👨‍💼 ADMIN ACCOUNTS:');
    console.log('  - admin@unibus.edu / admin123');
    console.log('  - roo2admin@gmail.com / admin123');
    console.log('\n👨‍🏫 SUPERVISOR ACCOUNTS:');
    console.log('  - supervisor@unibus.edu / supervisor123');
    console.log('  - ahmedazab@gmail.com / supervisor123');
    console.log('\n🎓 STUDENT ACCOUNTS:');
    console.log('  - student@unibus.edu / student123');
    console.log('  - ahmed@student.edu / student123');
    
  } catch (error) {
    console.error('❌ Database restructuring error:', error);
  } finally {
    await client.close();
  }
}

restructureDatabase();
