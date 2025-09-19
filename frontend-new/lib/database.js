import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portal';
let client = null;
let db = null;

export async function connectDB() {
  try {
    if (!client) {
      client = new MongoClient(uri);
      await client.connect();
      db = client.db('student-portal');
      console.log('✅ Database connected successfully');
    }
    return db;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export default connectDB;