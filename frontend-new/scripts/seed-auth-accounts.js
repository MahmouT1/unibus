const { MongoClient } = require('mongodb');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('student-portal');
    
    // Clear existing admin/supervisor accounts
    await db.collection('users').deleteMany({ role: { $in: ['admin', 'supervisor'] } });
    
    // Create fresh admin account
    await db.collection('users').insertOne({
      email: 'admin@unibus.local',
      password: '123456',
      role: 'admin',
      fullName: 'System Administrator',
      isActive: true,
      createdAt: new Date()
    });
    
    // Create fresh supervisor account
    await db.collection('users').insertOne({
      email: 'supervisor@unibus.local',
      password: '123456',
      role: 'supervisor', 
      fullName: 'System Supervisor',
      isActive: true,
      createdAt: new Date()
    });
    
    // Verify accounts
    const adminUser = await db.collection('users').findOne({ email: 'admin@unibus.local' });
    const supervisorUser = await db.collection('users').findOne({ email: 'supervisor@unibus.local' });
    
    console.log('✅ Admin account:', adminUser ? 'CREATED' : 'FAILED');
    console.log('✅ Supervisor account:', supervisorUser ? 'CREATED' : 'FAILED');
    
    await client.close();
    console.log('🎉 Database seeding completed!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seedDatabase();