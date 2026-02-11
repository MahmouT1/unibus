#!/usr/bin/env node
/**
 * Migration Script: student-portal → student_portal
 * 
 * ينسخ كل المستخدمين والسجلات من student-portal إلى student_portal
 * يشغّل مرة واحدة على السيرفر إذا كانت البيانات في student-portal
 * 
 * Usage: MONGODB_URI=mongodb://127.0.0.1:27017 node scripts/migrate-to-student-portal.js
 */

const { MongoClient } = require('mongodb');

const SOURCE_DB = 'student-portal';
const TARGET_DB = 'student_portal';
const COLLECTIONS_TO_MIGRATE = ['users', 'students', 'subscriptions', 'attendance', 'shifts', 'transportation'];

async function migrate() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const sourceDb = client.db(SOURCE_DB);
    const targetDb = client.db(TARGET_DB);

    // Check if source has data
    const sourceCollections = await sourceDb.listCollections().toArray();
    const sourceNames = sourceCollections.map(c => c.name);
    
    console.log(`📂 Source DB (${SOURCE_DB}) collections:`, sourceNames.join(', ') || '(empty)');
    console.log('');

    for (const colName of COLLECTIONS_TO_MIGRATE) {
      if (!sourceNames.includes(colName)) continue;

      const sourceCol = sourceDb.collection(colName);
      const targetCol = targetDb.collection(colName);
      const count = await sourceCol.countDocuments();

      if (count === 0) {
        console.log(`⏭️  ${colName}: skip (empty)`);
        continue;
      }

      const docs = await sourceCol.find({}).toArray();
      let inserted = 0, skipped = 0;

      for (const doc of docs) {
        const key = colName === 'users' ? { email: doc.email?.toLowerCase?.() || doc.email } 
          : colName === 'students' ? { email: doc.email?.toLowerCase?.() || doc.email, studentId: doc.studentId }
          : { _id: doc._id };

        const exists = await targetCol.findOne(key);
        if (!exists) {
          await targetCol.insertOne({ ...doc }); // Keep original _id for references
          inserted++;
        } else {
          skipped++;
        }
      }

      console.log(`✅ ${colName}: ${inserted} inserted, ${skipped} skipped (duplicates)`);
    }

    console.log('\n✅ Migration complete! System uses only: ' + TARGET_DB);
    console.log('   يمكنك الآن التأكد من تسجيل الدخول');

  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrate();
