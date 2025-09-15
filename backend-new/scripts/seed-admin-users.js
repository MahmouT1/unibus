import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portal';

async function seedAdminUsers() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('student-portal');
    const usersCollection = db.collection('users');
    
    // Check if admin users already exist
    const existingAdmin = await usersCollection.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin users already exist, skipping seed...');
      return;
    }
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = {
      email: 'admin@university.edu',
      password: adminPassword,
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Create supervisor user
    const supervisorPassword = await bcrypt.hash('supervisor123', 12);
    const supervisorUser = {
      email: 'supervisor@university.edu',
      password: supervisorPassword,
      role: 'supervisor',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert users
    const adminResult = await usersCollection.insertOne(adminUser);
    const supervisorResult = await usersCollection.insertOne(supervisorUser);
    
    console.log('Admin users created successfully:');
    console.log('- Admin:', adminUser.email, '(ID:', adminResult.insertedId, ')');
    console.log('- Supervisor:', supervisorUser.email, '(ID:', supervisorResult.insertedId, ')');
    console.log('\nDefault passwords:');
    console.log('- Admin: admin123');
    console.log('- Supervisor: supervisor123');
    console.log('\nPlease change these passwords after first login!');
    
  } catch (error) {
    console.error('Error seeding admin users:', error);
  } finally {
    await client.close();
  }
}

// Run the seed function
seedAdminUsers();
