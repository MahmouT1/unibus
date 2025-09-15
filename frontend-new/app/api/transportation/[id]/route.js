import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-simple-connection';
import { ObjectId } from 'mongodb';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Transportation schedule ID is required' },
        { status: 400 }
      );
    }
    
    const db = await getDatabase();
    const transportationCollection = db.collection('transportation');
    
    const result = await transportationCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Transportation schedule not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Transportation schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transportation schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete transportation schedule' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, time, location, parking, capacity, status } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Transportation schedule ID is required' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!name || !time || !location || !parking || !capacity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const db = await getDatabase();
    const transportationCollection = db.collection('transportation');
    
    const updateData = {
      name,
      time,
      location,
      parking,
      capacity: parseInt(capacity),
      status: status || 'Active',
      updatedAt: new Date()
    };
    
    const result = await transportationCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Transportation schedule not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Transportation schedule updated successfully'
    });
  } catch (error) {
    console.error('Error updating transportation schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update transportation schedule' },
      { status: 500 }
    );
  }
}
