import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb-simple-connection';
import { requireAuth } from '../../../lib/next-auth-middleware.js';
import { ObjectId } from 'mongodb';

// GET user by ID
export const GET = requireAuth(async (request, { params }) => {
  try {
    const { id } = params;
    const user = request.user;

    // Connect to database
    const db = await getDatabase();
    const usersCollection = db.collection('users');

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Find user
    const foundUser = await usersCollection.findOne({ 
      _id: new ObjectId(id) 
    });

    if (!foundUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check permissions - users can only view their own profile unless they're admin/supervisor
    if (user.role !== 'admin' && user.role !== 'supervisor' && foundUser._id.toString() !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Format user data (exclude sensitive fields)
    const userData = {
      id: foundUser._id.toString(),
      email: foundUser.email,
      role: foundUser.role,
      isActive: foundUser.isActive,
      emailVerified: foundUser.emailVerified || false,
      profile: foundUser.profile || {},
      lastLogin: foundUser.lastLogin,
      createdAt: foundUser.createdAt,
      updatedAt: foundUser.updatedAt
    };

    // Include additional fields for admin/supervisor
    if (user.role === 'admin' || user.role === 'supervisor') {
      userData.loginAttempts = foundUser.loginAttempts || 0;
      userData.isLocked = foundUser.lockUntil && foundUser.lockUntil > Date.now();
      userData.lockUntil = foundUser.lockUntil;
    }

    return NextResponse.json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get user', error: error.message },
      { status: 500 }
    );
  }
});

// UPDATE user
export const PUT = requireAuth(async (request, { params }) => {
  try {
    const { id } = params;
    const user = request.user;
    const body = await request.json();

    // Connect to database
    const db = await getDatabase();
    const usersCollection = db.collection('users');

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Find user
    const foundUser = await usersCollection.findOne({ 
      _id: new ObjectId(id) 
    });

    if (!foundUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (user.role !== 'admin' && user.role !== 'supervisor' && foundUser._id.toString() !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData = {
      updatedAt: new Date()
    };

    // Allow profile updates for all users
    if (body.profile) {
      updateData.profile = {
        ...foundUser.profile,
        ...body.profile
      };
    }

    // Only admin/supervisor can update these fields
    if (user.role === 'admin' || user.role === 'supervisor') {
      if (body.role !== undefined) {
        updateData.role = body.role;
      }
      if (body.isActive !== undefined) {
        updateData.isActive = body.isActive;
      }
      if (body.emailVerified !== undefined) {
        updateData.emailVerified = body.emailVerified;
      }
    }

    // Update user
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'No changes made' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update user', error: error.message },
      { status: 500 }
    );
  }
});

// DELETE user (soft delete)
export const DELETE = requireAuth(async (request, { params }) => {
  try {
    const { id } = params;
    const user = request.user;

    // Only admin can delete users
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Connect to database
    const db = await getDatabase();
    const usersCollection = db.collection('users');

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Prevent admin from deleting themselves
    if (id === user.userId) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Soft delete - set isActive to false
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          isActive: false,
          updatedAt: new Date()
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete user', error: error.message },
      { status: 500 }
    );
  }
});
