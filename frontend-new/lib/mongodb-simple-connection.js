import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portal';

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDatabase() {
  const client = await clientPromise;
  return client.db('student-portal');
}

export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db('student-portal');
  return { client, db };
}