import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-simple-connection';

export async function GET() {
  try {
    const db = await getDatabase();
    const transportationCollection = db.collection('transportation');
    
    const transportationData = await transportationCollection.find({}).toArray();
    
    return NextResponse.json(transportationData);
  } catch (error) {
    console.error('Error fetching transportation data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transportation data' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, time, location, parking, capacity, status } = body;
    
    // Validate required fields
    if (!name || !time || !location || !parking || !capacity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const db = await getDatabase();
    const transportationCollection = db.collection('transportation');
    
    const newTransportation = {
      name,
      time,
      location,
      parking,
      capacity: parseInt(capacity),
      status: status || 'Active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await transportationCollection.insertOne(newTransportation);
    
    return NextResponse.json({
      success: true,
      message: 'Transportation schedule added successfully',
      id: result.insertedId
    });
  } catch (error) {
    console.error('Error adding transportation schedule:', error);
    return NextResponse.json(
      { error: 'Failed to add transportation schedule' },
      { status: 500 }
    );
  }
}
