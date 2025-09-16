import { MongoClient } from 'mongodb';
import crypto from 'crypto';

/**
 * Enhanced secure database connection with encryption and security features
 */

// Security configuration
const SECURITY_CONFIG = {
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key-here',
  ENCRYPTION_ALGORITHM: 'aes-256-gcm',
  CONNECTION_TIMEOUT: 30000, // 30 seconds
  MAX_POOL_SIZE: 10,
  MIN_POOL_SIZE: 2,
  MAX_IDLE_TIME: 30000, // 30 seconds
  RETRY_WRITES: true,
  RETRY_READS: true,
  READ_CONCERN: 'majority',
  WRITE_CONCERN: 'majority'
};

// Connection pool
let client = null;
let db = null;

/**
 * Create secure MongoDB connection
 */
export async function createSecureConnection() {
  try {
    if (client && db) {
      return { client, db };
    }

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    // Validate MongoDB URI format
    if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
      throw new Error('Invalid MongoDB URI format');
    }

    // Create secure connection options
    const options = {
      maxPoolSize: SECURITY_CONFIG.MAX_POOL_SIZE,
      minPoolSize: SECURITY_CONFIG.MIN_POOL_SIZE,
      maxIdleTimeMS: SECURITY_CONFIG.MAX_IDLE_TIME,
      serverSelectionTimeoutMS: SECURITY_CONFIG.CONNECTION_TIMEOUT,
      connectTimeoutMS: SECURITY_CONFIG.CONNECTION_TIMEOUT,
      socketTimeoutMS: SECURITY_CONFIG.CONNECTION_TIMEOUT,
      retryWrites: SECURITY_CONFIG.RETRY_WRITES,
      retryReads: SECURITY_CONFIG.RETRY_READS,
      readConcern: { level: SECURITY_CONFIG.READ_CONCERN },
      writeConcern: { w: SECURITY_CONFIG.WRITE_CONCERN },
      // Enable SSL/TLS
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      // Enable authentication
      authSource: 'admin',
      // Enable compression
      compressors: ['zlib'],
      // Enable monitoring
      monitorCommands: true
    };

    // Create client
    client = new MongoClient(mongoUri, options);
    
    // Connect to database
    await client.connect();
    
    // Test connection
    await client.db('admin').command({ ping: 1 });
    
    // Get database
    const dbName = process.env.DB_NAME || 'student-portal';
    db = client.db(dbName);
    
    // Create security indexes
    await createSecurityIndexes(db);
    
    console.info('Secure database connection established', { dbName });
    return { client, db };
    
  } catch (error) {
    console.error('Database connection failed', error);
    throw error;
  }
}

/**
 * Get secure database connection
 */
export async function getSecureDatabase() {
  try {
    if (!client || !db) {
      const connection = await createSecureConnection();
      return connection.db;
    }
    return db;
  } catch (error) {
    console.error('❌ Failed to get database connection:', error);
    throw error;
  }
}

/**
 * Create security indexes for data protection
 */
async function createSecurityIndexes(db) {
  try {
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true, background: true });
    await db.collection('users').createIndex({ role: 1 }, { background: true });
    await db.collection('users').createIndex({ isActive: 1 }, { background: true });
    await db.collection('users').createIndex({ createdAt: 1 }, { background: true });
    
    // Students collection indexes
    await db.collection('students').createIndex({ studentId: 1 }, { unique: true, background: true });
    await db.collection('students').createIndex({ email: 1 }, { unique: true, background: true });
    await db.collection('students').createIndex({ college: 1 }, { background: true });
    await db.collection('students').createIndex({ grade: 1 }, { background: true });
    
    // Attendance collection indexes
    await db.collection('attendance').createIndex({ studentId: 1, date: 1 }, { background: true });
    await db.collection('attendance').createIndex({ studentEmail: 1, date: 1 }, { background: true });
    await db.collection('attendance').createIndex({ supervisorId: 1, date: 1 }, { background: true });
    await db.collection('attendance').createIndex({ date: 1 }, { background: true });
    await db.collection('attendance').createIndex({ createdAt: 1 }, { background: true });
    
    // Subscriptions collection indexes
    await db.collection('subscriptions').createIndex({ studentEmail: 1 }, { unique: true, background: true });
    await db.collection('subscriptions').createIndex({ studentId: 1 }, { background: true });
    await db.collection('subscriptions').createIndex({ status: 1 }, { background: true });
    await db.collection('subscriptions').createIndex({ createdAt: 1 }, { background: true });
    
    // Transportation collection indexes
    await db.collection('transportation').createIndex({ routeName: 1 }, { background: true });
    await db.collection('transportation').createIndex({ departureTime: 1 }, { background: true });
    await db.collection('transportation').createIndex({ createdAt: 1 }, { background: true });
    
    // Shifts collection indexes
    await db.collection('shifts').createIndex({ supervisorId: 1, date: 1 }, { background: true });
    await db.collection('shifts').createIndex({ status: 1 }, { background: true });
    await db.collection('shifts').createIndex({ date: 1 }, { background: true });
    
    // Support tickets collection indexes
    await db.collection('support_tickets').createIndex({ studentEmail: 1 }, { background: true });
    await db.collection('support_tickets').createIndex({ status: 1 }, { background: true });
    await db.collection('support_tickets').createIndex({ createdAt: 1 }, { background: true });
    
    console.log('✅ Security indexes created successfully');
    
  } catch (error) {
    console.error('❌ Failed to create security indexes:', error);
    throw error;
  }
}

/**
 * Encrypt sensitive data
 */
export function encryptData(data) {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(SECURITY_CONFIG.ENCRYPTION_ALGORITHM, SECURITY_CONFIG.ENCRYPTION_KEY);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex')
    };
  } catch (error) {
    console.error('❌ Encryption failed:', error);
    throw error;
  }
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData, iv) {
  try {
    const decipher = crypto.createDecipher(SECURITY_CONFIG.ENCRYPTION_ALGORITHM, SECURITY_CONFIG.ENCRYPTION_KEY);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('❌ Decryption failed:', error);
    throw error;
  }
}

/**
 * Hash sensitive data
 */
export function hashData(data) {
  try {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(data));
    return hash.digest('hex');
  } catch (error) {
    console.error('❌ Hashing failed:', error);
    throw error;
  }
}

/**
 * Sanitize database query
 */
export function sanitizeQuery(query) {
  try {
    // Remove potentially dangerous operators
    const sanitized = { ...query };
    
    // Remove $where operators
    delete sanitized.$where;
    
    // Remove $regex with dangerous patterns
    if (sanitized.$regex) {
      const regex = sanitized.$regex;
      if (typeof regex === 'string') {
        // Remove dangerous regex patterns
        if (regex.includes('.*') || regex.includes('^') || regex.includes('$')) {
          delete sanitized.$regex;
        }
      }
    }
    
    // Remove $expr operators
    delete sanitized.$expr;
    
    // Remove $text operators
    delete sanitized.$text;
    
    return sanitized;
  } catch (error) {
    console.error('❌ Query sanitization failed:', error);
    throw error;
  }
}

/**
 * Secure database operation with error handling
 */
export async function secureDatabaseOperation(operation, collectionName, ...args) {
  try {
    const db = await getSecureDatabase();
    const collection = db.collection(collectionName);
    
    // Log operation for security monitoring
    console.log(`🔍 Database operation: ${operation} on ${collectionName}`);
    
    // Execute operation
    const result = await collection[operation](...args);
    
    // Log successful operation
    console.log(`✅ Database operation successful: ${operation} on ${collectionName}`);
    
    return result;
    
  } catch (error) {
    console.error(`❌ Database operation failed: ${operation} on ${collectionName}`, error);
    throw error;
  }
}

/**
 * Secure find operation
 */
export async function secureFind(collectionName, query = {}, options = {}) {
  try {
    // Sanitize query
    const sanitizedQuery = sanitizeQuery(query);
    
    // Add security options
    const secureOptions = {
      ...options,
      readConcern: { level: 'majority' },
      readPreference: 'primary'
    };
    
    return await secureDatabaseOperation('find', collectionName, sanitizedQuery, secureOptions);
    
  } catch (error) {
    console.error('❌ Secure find operation failed:', error);
    throw error;
  }
}

/**
 * Secure findOne operation
 */
export async function secureFindOne(collectionName, query = {}, options = {}) {
  try {
    // Sanitize query
    const sanitizedQuery = sanitizeQuery(query);
    
    // Add security options
    const secureOptions = {
      ...options,
      readConcern: { level: 'majority' },
      readPreference: 'primary'
    };
    
    return await secureDatabaseOperation('findOne', collectionName, sanitizedQuery, secureOptions);
    
  } catch (error) {
    console.error('❌ Secure findOne operation failed:', error);
    throw error;
  }
}

/**
 * Secure insertOne operation
 */
export async function secureInsertOne(collectionName, document, options = {}) {
  try {
    // Add security metadata
    const secureDocument = {
      ...document,
      createdAt: new Date(),
      updatedAt: new Date(),
      _security: {
        version: 1,
        encrypted: false,
        checksum: hashData(document)
      }
    };
    
    // Add security options
    const secureOptions = {
      ...options,
      writeConcern: { w: 'majority', j: true }
    };
    
    return await secureDatabaseOperation('insertOne', collectionName, secureDocument, secureOptions);
    
  } catch (error) {
    console.error('❌ Secure insertOne operation failed:', error);
    throw error;
  }
}

/**
 * Secure updateOne operation
 */
export async function secureUpdateOne(collectionName, filter, update, options = {}) {
  try {
    // Sanitize filter
    const sanitizedFilter = sanitizeQuery(filter);
    
    // Add security metadata to update
    const secureUpdate = {
      ...update,
      $set: {
        ...update.$set,
        updatedAt: new Date()
      }
    };
    
    // Add security options
    const secureOptions = {
      ...options,
      writeConcern: { w: 'majority', j: true }
    };
    
    return await secureDatabaseOperation('updateOne', collectionName, sanitizedFilter, secureUpdate, secureOptions);
    
  } catch (error) {
    console.error('❌ Secure updateOne operation failed:', error);
    throw error;
  }
}

/**
 * Secure deleteOne operation
 */
export async function secureDeleteOne(collectionName, filter, options = {}) {
  try {
    // Sanitize filter
    const sanitizedFilter = sanitizeQuery(filter);
    
    // Add security options
    const secureOptions = {
      ...options,
      writeConcern: { w: 'majority', j: true }
    };
    
    return await secureDatabaseOperation('deleteOne', collectionName, sanitizedFilter, secureOptions);
    
  } catch (error) {
    console.error('❌ Secure deleteOne operation failed:', error);
    throw error;
  }
}

/**
 * Secure aggregate operation
 */
export async function secureAggregate(collectionName, pipeline, options = {}) {
  try {
    // Sanitize pipeline
    const sanitizedPipeline = pipeline.map(stage => {
      if (stage.$match) {
        return { ...stage, $match: sanitizeQuery(stage.$match) };
      }
      return stage;
    });
    
    // Add security options
    const secureOptions = {
      ...options,
      readConcern: { level: 'majority' },
      readPreference: 'primary'
    };
    
    return await secureDatabaseOperation('aggregate', collectionName, sanitizedPipeline, secureOptions);
    
  } catch (error) {
    console.error('❌ Secure aggregate operation failed:', error);
    throw error;
  }
}

/**
 * Close secure database connection
 */
export async function closeSecureConnection() {
  try {
    if (client) {
      await client.close();
      client = null;
      db = null;
      console.log('✅ Secure database connection closed');
    }
  } catch (error) {
    console.error('❌ Failed to close database connection:', error);
    throw error;
  }
}

/**
 * Get database health status
 */
export async function getDatabaseHealth() {
  try {
    if (!client || !db) {
      return {
        status: 'disconnected',
        message: 'Database not connected'
      };
    }
    
    // Test connection
    await client.db('admin').command({ ping: 1 });
    
    // Get database stats
    const stats = await db.stats();
    
    return {
      status: 'connected',
      message: 'Database connection healthy',
      stats: {
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize
      }
    };
    
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return {
      status: 'error',
      message: error.message
    };
  }
}

/**
 * Create database backup
 */
export async function createDatabaseBackup() {
  try {
    const db = await getSecureDatabase();
    const collections = await db.listCollections().toArray();
    const backup = {};
    
    for (const collection of collections) {
      const name = collection.name;
      const data = await db.collection(name).find({}).toArray();
      backup[name] = data;
    }
    
    return backup;
    
  } catch (error) {
    console.error('❌ Database backup failed:', error);
    throw error;
  }
}

/**
 * Restore database from backup
 */
export async function restoreDatabaseBackup(backup) {
  try {
    const db = await getSecureDatabase();
    
    for (const [collectionName, data] of Object.entries(backup)) {
      if (data.length > 0) {
        await db.collection(collectionName).insertMany(data);
      }
    }
    
    console.log('✅ Database restored from backup');
    
  } catch (error) {
    console.error('❌ Database restore failed:', error);
    throw error;
  }
}

export { SECURITY_CONFIG };
