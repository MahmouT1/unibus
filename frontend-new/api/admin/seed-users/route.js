import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portal';

export async function POST(request) {
  try {
    const client = new MongoClient(uri);
    
    try {
      await client.connect();
      console.log('Connected to MongoDB');
      
      const db = client.db('student-portal');
      const usersCollection = db.collection('users');
      
      // Check if admin users already exist
      const existingAdmin = await usersCollection.findOne({ role: 'admin' });
      if (existingAdmin) {
        return NextResponse.json({
          success: true,
          message: 'Admin users already exist',
          warning: 'Admin users are already seeded in the database'
        });
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
      
      return NextResponse.json({
        success: true,
        message: 'Admin users created successfully',
        data: {
          admin: {
            email: adminUser.email,
            id: adminResult.insertedId.toString()
          },
          supervisor: {
            email: supervisorUser.email,
            id: supervisorResult.insertedId.toString()
          }
        },
        credentials: {
          admin: {
            email: 'admin@university.edu',
            password: 'admin123'
          },
          supervisor: {
            email: 'supervisor@university.edu',
            password: 'supervisor123'
          }
        }
      });
      
    } finally {
      await client.close();
    }
    
  } catch (error) {
    console.error('Error seeding admin users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to seed admin users', error: error.message },
      { status: 500 }
    );
  }
}
