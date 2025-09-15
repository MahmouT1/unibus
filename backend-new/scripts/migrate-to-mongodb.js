const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portal';

// Define schemas
const studentSchema = new mongoose.Schema({
  userId: String,
  studentId: { type: String, default: 'Not assigned' },
  fullName: String,
  email: { type: String, required: true, unique: true, lowercase: true },
  phoneNumber: String,
  college: String,
  grade: String,
  major: String,
  academicYear: { type: String, default: '2024-2025' },
  address: {
    streetAddress: String,
    buildingNumber: String,
    fullAddress: String
  },
  profilePhoto: String,
  qrCode: String,
  attendanceStats: {
    daysRegistered: { type: Number, default: 0 },
    remainingDays: { type: Number, default: 180 },
    attendanceRate: { type: Number, default: 0 }
  },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

const subscriptionSchema = new mongoose.Schema({
  studentId: String,
  studentEmail: { type: String, required: true, lowercase: true },
  totalPaid: { type: Number, default: 0 },
  status: { type: String, enum: ['inactive', 'partial', 'active', 'expired'], default: 'inactive' },
  confirmationDate: Date,
  renewalDate: Date,
  lastPaymentDate: Date,
  payments: [{
    id: String,
    amount: Number,
    paymentMethod: String,
    paymentDate: Date,
    confirmationDate: Date,
    renewalDate: Date,
    installmentType: { type: String, enum: ['full', 'partial'] }
  }]
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);

async function migrateToMongoDB() {
  try {
    console.log('🔄 Starting migration to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data
    await Student.deleteMany({});
    await Subscription.deleteMany({});
    console.log('🗑️  Cleared existing data');
    
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
    
    // Migrate students
    let studentsMigrated = 0;
    for (const [email, studentData] of Object.entries(studentsData)) {
      try {
        const student = new Student({
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
          status: studentData.status || 'Active'
        });
        
        await student.save();
        studentsMigrated++;
        console.log(`✅ Migrated student: ${email}`);
      } catch (error) {
        console.error(`❌ Failed to migrate student ${email}:`, error.message);
      }
    }
    
    // Migrate subscriptions
    let subscriptionsMigrated = 0;
    for (const [key, subscriptionData] of Object.entries(subscriptionsData)) {
      try {
        const subscription = new Subscription({
          studentId: subscriptionData.studentId,
          studentEmail: subscriptionData.studentEmail.toLowerCase(),
          totalPaid: subscriptionData.totalPaid || 0,
          status: subscriptionData.status || 'inactive',
          confirmationDate: subscriptionData.confirmationDate ? new Date(subscriptionData.confirmationDate) : null,
          renewalDate: subscriptionData.renewalDate ? new Date(subscriptionData.renewalDate) : null,
          lastPaymentDate: subscriptionData.lastPaymentDate ? new Date(subscriptionData.lastPaymentDate) : null,
          payments: subscriptionData.payments || []
        });
        
        await subscription.save();
        subscriptionsMigrated++;
        console.log(`✅ Migrated subscription: ${subscriptionData.studentEmail}`);
      } catch (error) {
        console.error(`❌ Failed to migrate subscription ${key}:`, error.message);
      }
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log(`✅ Students migrated: ${studentsMigrated}`);
    console.log(`✅ Subscriptions migrated: ${subscriptionsMigrated}`);
    console.log('📁 Data is now stored in MongoDB collections');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run migration
migrateToMongoDB();
