import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-simple-connection';

// GET - List all students for debugging
export async function GET(request) {
  try {
    const db = await getDatabase();
    const studentsCollection = db.collection('students');
    
    const students = await studentsCollection.find({}).limit(10).toArray();
    
    console.log('=== DEBUG: Students in database ===');
    console.log('Total students found:', students.length);
    console.log('Students:', students);

    return NextResponse.json({
      success: true,
      count: students.length,
      students: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    }, { status: 500 });
  }
}
