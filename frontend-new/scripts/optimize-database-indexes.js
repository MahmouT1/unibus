// Database Index Optimization for Concurrent QR Scanning
// This script creates optimized indexes for better performance with multiple supervisors

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portal';

async function optimizeDatabaseIndexes() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('student-portal');
    
    // Optimize attendance collection indexes
    const attendanceCollection = db.collection('attendance');
    
    console.log('Creating optimized indexes for attendance collection...');
    
    // 1. Compound index for duplicate checking (most important for concurrent scans)
    await attendanceCollection.createIndex(
      { 
        studentId: 1, 
        appointmentSlot: 1, 
        date: 1 
      },
      { 
        name: 'student_slot_date_idx',
        background: true 
      }
    );
    console.log('✓ Created student_slot_date_idx');
    
    // 2. Index for supervisor queries
    await attendanceCollection.createIndex(
      { 
        supervisorId: 1, 
        date: 1 
      },
      { 
        name: 'supervisor_date_idx',
        background: true 
      }
    );
    console.log('✓ Created supervisor_date_idx');
    
    // 3. Index for today's attendance queries
    await attendanceCollection.createIndex(
      { 
        date: 1, 
        status: 1 
      },
      { 
        name: 'date_status_idx',
        background: true 
      }
    );
    console.log('✓ Created date_status_idx');
    
    // 4. Index for scan timestamp (for recent activity)
    await attendanceCollection.createIndex(
      { 
        scanTimestamp: -1 
      },
      { 
        name: 'scan_timestamp_idx',
        background: true 
      }
    );
    console.log('✓ Created scan_timestamp_idx');
    
    // 5. Index for concurrent scan ID (for deduplication)
    await attendanceCollection.createIndex(
      { 
        concurrentScanId: 1 
      },
      { 
        name: 'concurrent_scan_id_idx',
        unique: true,
        background: true 
      }
    );
    console.log('✓ Created concurrent_scan_id_idx');
    
    // 6. Compound index for student email and ID lookups
    await attendanceCollection.createIndex(
      { 
        studentEmail: 1, 
        studentId: 1 
      },
      { 
        name: 'student_email_id_idx',
        background: true 
      }
    );
    console.log('✓ Created student_email_id_idx');
    
    // Optimize students collection indexes
    const studentsCollection = db.collection('students');
    
    console.log('Creating optimized indexes for students collection...');
    
    // 1. Index for email lookups
    await studentsCollection.createIndex(
      { 
        email: 1 
      },
      { 
        name: 'email_idx',
        unique: true,
        background: true 
      }
    );
    console.log('✓ Created email_idx');
    
    // 2. Index for student ID lookups
    await studentsCollection.createIndex(
      { 
        studentId: 1 
      },
      { 
        name: 'student_id_idx',
        background: true 
      }
    );
    console.log('✓ Created student_id_idx');
    
    // 3. Compound index for name and email searches
    await studentsCollection.createIndex(
      { 
        fullName: 'text', 
        email: 'text' 
      },
      { 
        name: 'name_email_text_idx',
        background: true 
      }
    );
    console.log('✓ Created name_email_text_idx');
    
    // Optimize users collection indexes
    const usersCollection = db.collection('users');
    
    console.log('Creating optimized indexes for users collection...');
    
    // 1. Index for email lookups (authentication)
    await usersCollection.createIndex(
      { 
        email: 1 
      },
      { 
        name: 'user_email_idx',
        unique: true,
        background: true 
      }
    );
    console.log('✓ Created user_email_idx');
    
    // 2. Index for role-based queries
    await usersCollection.createIndex(
      { 
        role: 1, 
        email: 1 
      },
      { 
        name: 'role_email_idx',
        background: true 
      }
    );
    console.log('✓ Created role_email_idx');
    
    // Get index statistics
    console.log('\n📊 Index Statistics:');
    
    const attendanceIndexes = await attendanceCollection.indexes();
    console.log(`Attendance collection: ${attendanceIndexes.length} indexes`);
    
    const studentsIndexes = await studentsCollection.indexes();
    console.log(`Students collection: ${studentsIndexes.length} indexes`);
    
    const usersIndexes = await usersCollection.indexes();
    console.log(`Users collection: ${usersIndexes.length} indexes`);
    
    console.log('\n✅ Database optimization completed successfully!');
    console.log('\n🚀 Performance improvements:');
    console.log('- Faster duplicate detection for concurrent scans');
    console.log('- Optimized supervisor queries');
    console.log('- Improved student lookups');
    console.log('- Better authentication performance');
    console.log('- Enhanced text search capabilities');
    
  } catch (error) {
    console.error('Error optimizing database indexes:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the optimization
if (require.main === module) {
  optimizeDatabaseIndexes().catch(console.error);
}

module.exports = { optimizeDatabaseIndexes };
