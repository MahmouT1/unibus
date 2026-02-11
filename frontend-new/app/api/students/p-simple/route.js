import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-simple-connection';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    console.log('📚 Fetching students for subscription management...');
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const db = await getDatabase();
    const studentsCollection = db.collection('students');
    const usersCollection = db.collection('users');

    // Build search query
    let query = {};
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    // Add subscription status filter if provided
    if (status && status !== 'All Status') {
      if (status === 'active') {
        query.subscriptionStatus = 'active';
      } else if (status === 'inactive') {
        query.$or = [
          { subscriptionStatus: 'inactive' },
          { subscriptionStatus: { $exists: false } }
        ];
      } else if (status === 'expired') {
        query.subscriptionStatus = 'expired';
      }
    }

    // Get total count for pagination
    const totalStudents = await studentsCollection.countDocuments(query);
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalStudents / limit);

    // Fetch students with pagination
    let students = await studentsCollection.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Also search users collection and combine results
    console.log('📝 Checking users collection for additional students...');
    const usersQuery = { ...query };
    if (usersQuery.$or) {
      // Modify the $or query for users collection
      usersQuery.$or = usersQuery.$or.map(condition => {
        const newCondition = { ...condition };
        if (newCondition.fullName) {
          newCondition.name = newCondition.fullName;
          delete newCondition.fullName;
        }
        return newCondition;
      });
    }
    
    const usersAsStudents = await usersCollection.find({
      ...usersQuery,
      $or: [
        { role: { $in: ['student', 'user'] } },
        { role: { $exists: false } },
        ...(usersQuery.$or || [])
      ]
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
    
    // Combine and deduplicate students
    const allStudents = [...students, ...usersAsStudents];
    const uniqueStudents = allStudents.filter((student, index, self) => 
      index === self.findIndex(s => s.email === student.email)
    );
    
    students = uniqueStudents.slice(0, limit);

    // Format students data for subscription management
    const formattedStudents = students.map(student => ({
      _id: student._id.toString(),
      fullName: student.fullName || student.name || 'Unknown',
      email: student.email || '',
      studentId: student.studentId || 'N/A',
      college: student.college || 'N/A',
      major: student.major || 'N/A',
      grade: student.grade || 'N/A',
      phoneNumber: student.phoneNumber || 'N/A',
      subscriptionStatus: student.subscriptionStatus || 'inactive',
      subscriptionType: student.subscriptionType || 'none',
      subscriptionExpiry: student.subscriptionExpiry || null,
      lastPayment: student.lastPayment || null,
      totalPaid: student.totalPaid || 0,
      createdAt: student.createdAt || new Date(),
      profilePhoto: student.profilePhoto || null
    }));

    console.log(`✅ Found ${formattedStudents.length} students for subscription management`);

    return NextResponse.json({
      success: true,
      data: {
        students: formattedStudents,
        pagination: {
          currentPage: page,
          totalPages,
          totalStudents,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        stats: {
          total: totalStudents,
          active: formattedStudents.filter(s => s.subscriptionStatus === 'active').length,
          inactive: formattedStudents.filter(s => s.subscriptionStatus === 'inactive').length,
          expired: formattedStudents.filter(s => s.subscriptionStatus === 'expired').length
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching students for subscription management:', error);
    return NextResponse.json({
      success: true, // Return success with empty data to prevent UI crashes
      data: {
        students: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalStudents: 0,
          hasNextPage: false,
          hasPrevPage: false
        },
        stats: {
          total: 0,
          active: 0,
          inactive: 0,
          expired: 0
        }
      }
    });
  }
}

// POST - Update student subscription
export async function POST(request) {
  try {
    const body = await request.json();
    const { studentId, subscriptionType, subscriptionStatus, amount, paymentMethod } = body;

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'Student ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const studentsCollection = db.collection('students');
    const usersCollection = db.collection('users');

    // Calculate subscription expiry based on type
    let subscriptionExpiry = null;
    if (subscriptionType === 'monthly') {
      subscriptionExpiry = new Date();
      subscriptionExpiry.setMonth(subscriptionExpiry.getMonth() + 1);
    } else if (subscriptionType === 'yearly') {
      subscriptionExpiry = new Date();
      subscriptionExpiry.setFullYear(subscriptionExpiry.getFullYear() + 1);
    }

    const updateData = {
      subscriptionType: subscriptionType || 'none',
      subscriptionStatus: subscriptionStatus || 'inactive',
      subscriptionExpiry,
      lastPayment: amount ? {
        amount: parseFloat(amount),
        method: paymentMethod || 'cash',
        date: new Date()
      } : null,
      updatedAt: new Date()
    };

    // Try to update in students collection first
    let result = await studentsCollection.updateOne(
      { _id: new ObjectId(studentId) },
      { $set: updateData }
    );

    // If not found, try users collection
    if (result.matchedCount === 0) {
      result = await usersCollection.updateOne(
        { _id: new ObjectId(studentId) },
        { $set: updateData }
      );
    }

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Updated subscription for student ${studentId}`);

    return NextResponse.json({
      success: true,
      message: 'Subscription updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating subscription:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update subscription', error: error.message },
      { status: 500 }
    );
  }
}
