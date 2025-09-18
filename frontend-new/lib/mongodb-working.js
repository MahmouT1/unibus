import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portal';
let client = null;
let db = null;

export async function connectToDatabase() {
  try {
    if (!client) {
      client = new MongoClient(uri);
      await client.connect();
      db = client.db('student-portal');
      console.log('✅ Connected to MongoDB');
    }
    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

export async function getDatabase() {
  const { db } = await connectToDatabase();
  return db;
}

export default connectToDatabase;