import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Test API route working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      message: 'Test POST working',
      receivedData: body
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Test POST failed',
      error: error.message
    }, { status: 500 });
  }
}
