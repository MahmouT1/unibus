import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb-simple-connection';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const db = await getDatabase();
    const collection = db.collection('transportation');
    
    const transportationData = await collection.find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({
      success: true,
      data: transportationData
    });
  } catch (error) {
    console.error('Error fetching transportation data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch transportation data', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { routeName, stations, firstAppointmentTime, secondAppointmentTime } = body;
    
    // Validate required fields
    if (!routeName || !stations || !Array.isArray(stations) || stations.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Route name and stations are required' },
        { status: 400 }
      );
    }
    
    // Validate station data
    for (const station of stations) {
      if (!station.name || !station.location || !station.googleMapsLink) {
        return NextResponse.json(
          { success: false, message: 'Each station must have name, location, and Google Maps link' },
          { status: 400 }
        );
      }
    }
    
    const db = await getDatabase();
    const collection = db.collection('transportation');
    
    const transportationData = {
      routeName,
      stations: stations.map(station => ({
        name: station.name,
        location: station.location,
        googleMapsLink: station.googleMapsLink,
        parkingInfo: station.parkingInfo || '',
        capacity: parseInt(station.capacity) || 50,
        status: station.status || 'active'
      })),
      schedule: {
        firstAppointment: {
          time: firstAppointmentTime || '08:00 AM',
          capacity: parseInt(body.firstAppointmentCapacity) || 50
        },
        secondAppointment: {
          time: secondAppointmentTime || '02:00 PM',
          capacity: parseInt(body.secondAppointmentCapacity) || 50
        }
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(transportationData);
    
    return NextResponse.json({
      success: true,
      message: 'Transportation schedule created successfully',
      data: { _id: result.insertedId, ...transportationData }
    });
  } catch (error) {
    console.error('Error creating transportation data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create transportation data', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Transportation ID is required' },
        { status: 400 }
      );
    }
    
    const db = await getDatabase();
    const collection = db.collection('transportation');
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date() 
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Transportation schedule not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Transportation schedule updated successfully'
    });
  } catch (error) {
    console.error('Error updating transportation data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update transportation data', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Transportation ID is required' },
        { status: 400 }
      );
    }
    
    const db = await getDatabase();
    const collection = db.collection('transportation');
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Transportation schedule not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Transportation schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transportation data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete transportation data', error: error.message },
      { status: 500 }
    );
  }
}