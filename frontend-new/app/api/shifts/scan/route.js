import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('🔄 Proxying QR scan request to backend...');
    
    // Forward request to backend
    const backendResponse = await fetch('http://localhost:3001/api/shifts/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await backendResponse.json();
    
    console.log('📡 Backend QR scan response:', backendResponse.status, data);
    
    return NextResponse.json(data, { status: backendResponse.status });
    
  } catch (error) {
    console.error('❌ QR scan proxy error:', error);
    return NextResponse.json({
      success: false,
      message: 'QR scan proxy server error'
    }, { status: 500 });
  }
}