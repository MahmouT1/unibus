import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Get authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    console.log('🔄 Proxying QR scan request to backend...');
    console.log('Request body:', JSON.stringify(body, null, 2));
    console.log('Auth header present:', !!authHeader);
    console.log('Auth header value:', authHeader ? authHeader.substring(0, 20) + '...' : 'none');
    
    // Forward request to backend with all necessary headers
    const backendResponse = await fetch('http://localhost:3001/api/shifts/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '', // Forward the auth header
      },
      body: JSON.stringify(body),
    });
    
    let data;
    try {
      data = await backendResponse.json();
    } catch (jsonError) {
      console.error('Failed to parse backend JSON response:', jsonError);
      const textResponse = await backendResponse.text();
      console.log('Raw backend response:', textResponse);
      data = { 
        success: false, 
        message: 'Invalid backend response format',
        rawResponse: textResponse
      };
    }
    
    console.log('📡 Backend QR scan response:', backendResponse.status, data);
    
    return NextResponse.json(data, { status: backendResponse.status });
    
  } catch (error) {
    console.error('❌ QR scan proxy error:', error);
    return NextResponse.json({
      success: false,
      message: 'QR scan proxy server error',
      error: error.message
    }, { status: 500 });
  }
}