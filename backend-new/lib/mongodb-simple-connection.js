// Lightweight MongoDB connection helper (singleton)
// Supports both CommonJS (require) and ESM (import) usage

const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function getDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017';
  const dbName = process.env.MONGODB_DB || process.env.DB_NAME || 'student_portal';

  if (!cachedClient) {
    cachedClient = new MongoClient(uri, {
      // modern connection options
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    await cachedClient.connect();
  }

  cachedDb = cachedClient.db(dbName);
  return cachedDb;
}

module.exports = { getDatabase };
module.exports.default = getDatabase;


