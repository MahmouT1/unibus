import { connectToDatabase } from './mongodb';

export class Attendance {
  static async create(attendanceData) {
    const { db } = await connectToDatabase();
    const result = await db.collection('attendance').insertOne({
      ...attendanceData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return result;
  }

  static async findByStudentId(studentId) {
    const { db } = await connectToDatabase();
    return await db.collection('attendance').find({ studentId }).toArray();
  }

  static async findByDate(date) {
    const { db } = await connectToDatabase();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await db.collection('attendance').find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).toArray();
  }

  static async findAll() {
    const { db } = await connectToDatabase();
    return await db.collection('attendance').find({}).sort({ createdAt: -1 }).toArray();
  }

  static async deleteById(id) {
    const { db } = await connectToDatabase();
    const { ObjectId } = require('mongodb');
    return await db.collection('attendance').deleteOne({ _id: new ObjectId(id) });
  }
}