const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
MongoClient.connect(uri).then(async client => {
  const db = client.db('student_portal');
  const users = await db.collection('users').countDocuments();
  const students = await db.collection('students').countDocuments();
  console.log('student_portal.users:', users);
  console.log('student_portal.students:', students);
  await client.close();
});
