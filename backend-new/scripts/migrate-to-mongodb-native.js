const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portal';

async function migrateToMongoDBNative() {
  let client;
  
  try {
    console.log('🔄 Starting JSON to MongoDB migration using native driver...');
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('student-portal');
    
    // Read JSON files
    const studentsDataPath = path.join(__dirname, '..', 'data', 'students.json');
    const subscriptionsDataPath = path.join(__dirname, '..', 'data', 'subscriptions.json');
    
    let studentsData = {};
    let subscriptionsData = {};
    
    try {
      studentsData = JSON.parse(fs.readFileSync(studentsDataPath, 'utf8'));
      console.log(`📊 Found ${Object.keys(studentsData).length} student records`);
    } catch (error) {
      console.log('⚠️  No students.json file found, skipping students migration');
    }
    
    try {
      subscriptionsData = JSON.parse(fs.readFileSync(subscriptionsDataPath, 'utf8'));
      console.log(`📊 Found ${Object.keys(subscriptionsData).length} subscription records`);
    } catch (error) {
      console.log('⚠️  No subscriptions.json file found, skipping subscriptions migration');
    }
    
    // Clear existing collections
    console.log('🗑️  Clearing existing collections...');
    await db.collection('students').deleteMany({});
    await db.collection('subscriptions').deleteMany({});
    console.log('✅ Collections cleared');
    
    // Migrate students
    let studentsMigrated = 0;
    const studentsToInsert = [];
    
    for (const [email, studentData] of Object.entries(studentsData)) {
      try {
        const student = {
          userId: studentData._id || studentData.id || `user-${Date.now()}`,
          studentId: studentData.studentId || 'Not assigned',
          fullName: studentData.fullName,
          email: email.toLowerCase(),
          phoneNumber: studentData.phoneNumber,
          college: studentData.college,
          grade: studentData.grade,
          major: studentData.major,
          academicYear: studentData.academicYear || '2024-2025',
          address: studentData.address || {},
          profilePhoto: studentData.profilePhoto,
          qrCode: studentData.qrCode,
          attendanceStats: studentData.attendanceStats || {
            daysRegistered: 0,
            remainingDays: 180,
            attendanceRate: 0
          },
          status: studentData.status || 'Active',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        studentsToInsert.push(student);
        studentsMigrated++;
        console.log(`✅ Prepared student: ${email}`);
      } catch (error) {
        console.error(`❌ Failed to prepare student ${email}:`, error.message);
      }
    }
    
    // Insert all students at once
    if (studentsToInsert.length > 0) {
      await db.collection('students').insertMany(studentsToInsert);
      console.log(`✅ Inserted ${studentsToInsert.length} students into MongoDB`);
    }
    
    // Migrate subscriptions
    let subscriptionsMigrated = 0;
    const subscriptionsToInsert = [];
    
    for (const [key, subscriptionData] of Object.entries(subscriptionsData)) {
      try {
        const subscription = {
          studentId: subscriptionData.studentId,
          studentEmail: subscriptionData.studentEmail.toLowerCase(),
          totalPaid: subscriptionData.totalPaid || 0,
          status: subscriptionData.status || 'inactive',
          confirmationDate: subscriptionData.confirmationDate ? new Date(subscriptionData.confirmationDate) : null,
          renewalDate: subscriptionData.renewalDate ? new Date(subscriptionData.renewalDate) : null,
          lastPaymentDate: subscriptionData.lastPaymentDate ? new Date(subscriptionData.lastPaymentDate) : null,
          payments: subscriptionData.payments || [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        subscriptionsToInsert.push(subscription);
        subscriptionsMigrated++;
        console.log(`✅ Prepared subscription: ${subscriptionData.studentEmail}`);
      } catch (error) {
        console.error(`❌ Failed to prepare subscription ${key}:`, error.message);
      }
    }
    
    // Insert all subscriptions at once
    if (subscriptionsToInsert.length > 0) {
      await db.collection('subscriptions').insertMany(subscriptionsToInsert);
      console.log(`✅ Inserted ${subscriptionsToInsert.length} subscriptions into MongoDB`);
    }
    
    // Create indexes for better performance (ignore if they already exist)
    console.log('📊 Creating indexes...');
    try {
      await db.collection('students').createIndex({ email: 1 }, { unique: true });
      await db.collection('students').createIndex({ studentId: 1 });
      await db.collection('subscriptions').createIndex({ studentEmail: 1 });
      await db.collection('subscriptions').createIndex({ studentId: 1 });
      console.log('✅ Indexes created');
    } catch (indexError) {
      console.log('⚠️  Some indexes already exist, continuing...');
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log(`✅ Students migrated: ${studentsMigrated}`);
    console.log(`✅ Subscriptions migrated: ${subscriptionsMigrated}`);
    console.log('📁 All data is now stored in MongoDB collections');
    console.log('🚀 System is ready to use MongoDB exclusively');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run migration
migrateToMongoDBNative();
