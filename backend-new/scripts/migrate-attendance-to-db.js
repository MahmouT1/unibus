import { readFile } from 'fs/promises';
import { join } from 'path';
import connectDB from '../lib/mongodb.js';
import Attendance from '../lib/Attendance.js';

const DATA_DIR = join(process.cwd(), 'data');
const ATTENDANCE_FILE = join(DATA_DIR, 'attendance.json');

async function migrateAttendanceToDatabase() {
  try {
    console.log('Starting attendance migration to database...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');
    
    // Read attendance data from JSON file
    const attendanceData = await readFile(ATTENDANCE_FILE, 'utf8');
    const attendanceRecords = JSON.parse(attendanceData);
    
    console.log(`Found ${attendanceRecords.length} attendance records to migrate`);
    
    if (attendanceRecords.length === 0) {
      console.log('No attendance records to migrate');
      return;
    }
    
    // Clear existing attendance records in database
    await Attendance.deleteMany({});
    console.log('Cleared existing attendance records in database');
    
    // Clean the attendance records for database insertion
    const cleanedRecords = attendanceRecords.map(record => {
      const { _id, ...cleanRecord } = record;
      return cleanRecord;
    });
    
    // Insert attendance records into database
    const insertedRecords = await Attendance.insertMany(cleanedRecords);
    console.log(`Successfully migrated ${insertedRecords.length} attendance records to database`);
    
    // Show sample of migrated data
    console.log('\nSample migrated records:');
    insertedRecords.slice(0, 3).forEach((record, index) => {
      console.log(`${index + 1}. ${record.studentName} (${record.studentEmail}) - ${record.date}`);
    });
    
    console.log('\nMigration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration
migrateAttendanceToDatabase();
