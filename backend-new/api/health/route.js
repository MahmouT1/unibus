import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';

export async function GET() {
  try {
    await connectDB();
    
    return NextResponse.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
