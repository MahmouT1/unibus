const { MongoClient } = require('mongodb');

async function seedAllUsers() {
  try {
    console.log('🌱 Creating all user accounts...');
    
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('student-portal');
    
    // Clear existing test accounts
    await db.collection('users').deleteMany({ 
      email: { $in: [
        'admin@unibus.local',
        'supervisor@unibus.local', 
        'student@unibus.local'
      ]}
    });
    
    // Create admin account
    const adminResult = await db.collection('users').insertOne({
      email: 'admin@unibus.local',
      password: '123456',
      role: 'admin',
      fullName: 'System Administrator',
      isActive: true,
      createdAt: new Date(),
      permissions: ['all']
    });
    
    // Create supervisor account
    const supervisorResult = await db.collection('users').insertOne({
      email: 'supervisor@unibus.local',
      password: '123456',
      role: 'supervisor',
      fullName: 'System Supervisor',
      isActive: true,
      createdAt: new Date(),
      permissions: ['attendance', 'reports']
    });
    
    // Create student account
    const studentResult = await db.collection('users').insertOne({
      email: 'student@unibus.local',
      password: '123456',
      role: 'student',
      fullName: 'Test Student',
      studentId: 'STU2025001',
      college: 'Engineering',
      grade: 'third-year',
      major: 'Computer Science',
      isActive: true,
      createdAt: new Date()
    });
    
    // Also create in students collection for compatibility
    await db.collection('students').insertOne({
      email: 'student@unibus.local',
      password: '123456',
      fullName: 'Test Student',
      studentId: 'STU2025001',
      college: 'Engineering',
      grade: 'third-year',
      major: 'Computer Science',
      isActive: true,
      createdAt: new Date()
    });
    
    console.log('✅ Admin account created:', adminResult.insertedId);
    console.log('✅ Supervisor account created:', supervisorResult.insertedId);
    console.log('✅ Student account created:', studentResult.insertedId);
    
    // Verify all accounts
    const adminCheck = await db.collection('users').findOne({ email: 'admin@unibus.local' });
    const supervisorCheck = await db.collection('users').findOne({ email: 'supervisor@unibus.local' });
    const studentCheck = await db.collection('users').findOne({ email: 'student@unibus.local' });
    
    console.log('🔍 Verification:');
    console.log('  Admin:', adminCheck ? '✅ EXISTS' : '❌ MISSING');
    console.log('  Supervisor:', supervisorCheck ? '✅ EXISTS' : '❌ MISSING');
    console.log('  Student:', studentCheck ? '✅ EXISTS' : '❌ MISSING');
    
    await client.close();
    console.log('🎉 All user accounts created successfully!');
    
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('Admin: admin@unibus.local / 123456');
    console.log('Supervisor: supervisor@unibus.local / 123456');
    console.log('Student: student@unibus.local / 123456');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  }
}

seedAllUsers();