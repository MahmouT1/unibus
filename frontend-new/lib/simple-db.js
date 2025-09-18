import { MongoClient } from 'mongodb';

let client = null;
let db = null;

export async function getDatabase() {
  try {
    if (!db) {
      client = new MongoClient('mongodb://localhost:27017');
      await client.connect();
      db = client.db('student-portal');
      console.log('✅ MongoDB connected');
    }
    return db;
  } catch (error) {
    console.error('❌ MongoDB error:', error);
    throw error;
  }
}

export default getDatabase;