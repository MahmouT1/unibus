const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

async function seedAdminAccounts() {
  try {
    console.log('🌱 Starting admin account seeding...');
    
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_portal');
    await client.connect();
    const db = client.db();
    
    // Sample admin accounts
    const adminAccounts = [
      {
        email: 'admin@university.edu',
        password: await bcrypt.hash('admin123', 10),
        name: 'System Administrator',
        role: 'admin',
        permissions: ['all'],
        status: 'active',
        createdAt: new Date(),
        createdBy: 'system'
      },
      {
        email: 'superadmin@university.edu',
        password: await bcrypt.hash('superadmin123', 10),
        name: 'Super Administrator',
        role: 'admin',
        permissions: ['all'],
        status: 'active',
        createdAt: new Date(),
        createdBy: 'system'
      }
    ];

    // Sample supervisor accounts
    const supervisorAccounts = [
      {
        email: 'supervisor1@university.edu',
        password: await bcrypt.hash('supervisor123', 10),
        name: 'John Supervisor',
        role: 'supervisor',
        permissions: ['attendance', 'reports', 'qr_scan'],
        status: 'active',
        department: 'Transportation',
        createdAt: new Date(),
        createdBy: 'system'
      },
      {
        email: 'supervisor2@university.edu',
        password: await bcrypt.hash('supervisor123', 10),
        name: 'Jane Supervisor',
        role: 'supervisor',
        permissions: ['attendance', 'reports', 'qr_scan'],
        status: 'active',
        department: 'Transportation',
        createdAt: new Date(),
        createdBy: 'system'
      }
    ];

    // Clear existing admin accounts
    await db.collection('admins').deleteMany({});
    console.log('✅ Cleared existing admin accounts');

    // Clear existing supervisor accounts
    await db.collection('supervisors').deleteMany({});
    console.log('✅ Cleared existing supervisor accounts');

    // Insert admin accounts
    const adminResult = await db.collection('admins').insertMany(adminAccounts);
    console.log(`✅ Inserted ${adminResult.insertedCount} admin accounts`);

    // Insert supervisor accounts
    const supervisorResult = await db.collection('supervisors').insertMany(supervisorAccounts);
    console.log(`✅ Inserted ${supervisorResult.insertedCount} supervisor accounts`);

    console.log('\n🎉 Admin account seeding completed successfully!');
    console.log('\n📋 Default Admin Accounts:');
    console.log('Email: admin@university.edu | Password: admin123');
    console.log('Email: superadmin@university.edu | Password: superadmin123');
    
    console.log('\n📋 Default Supervisor Accounts:');
    console.log('Email: supervisor1@university.edu | Password: supervisor123');
    console.log('Email: supervisor2@university.edu | Password: supervisor123');
    
    console.log('\n🔐 Please change these passwords after first login!');
    
    await client.close();

  } catch (error) {
    console.error('❌ Error seeding admin accounts:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedAdminAccounts();
