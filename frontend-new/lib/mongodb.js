import mongoose from 'mongoose';

// Use same DB as backend (student_portal) - MONGODB_URI in Docker may not include db name
const baseUri = (process.env.MONGODB_URI || 'mongodb://localhost:27017').replace(/\/$/, '');
const dbName = process.env.MONGODB_DB || process.env.DB_NAME || 'student_portal';
const hasDbInUri = baseUri.split('/').length >= 4; // e.g. mongodb://host:27017/dbname
const MONGODB_URI = hasDbInUri ? baseUri : `${baseUri}/${dbName}`;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

// Additional helper functions
export async function getDatabase() {
  const connection = await connectDB();
  return connection.connection.db;
}

export async function connectToDatabase() {
  const connection = await connectDB();
  return {
    client: connection.connection.getClient(),
    db: connection.connection.db
  };
}
