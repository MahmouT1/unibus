import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portal';
const MONGODB_DB = 'student-portal';

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function getMongoDB() {
  const client = await clientPromise;
  return client.db(MONGODB_DB);
}

export default clientPromise;
