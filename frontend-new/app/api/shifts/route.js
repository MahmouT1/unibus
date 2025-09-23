import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    // Forward all relevant filters (not only supervisorId/status)
    const supervisorId = searchParams.get('supervisorId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const shiftId = searchParams.get('shiftId');
    const limit = searchParams.get('limit');
    
    console.log('🔄 Proxying shifts GET request to backend...');
    
    // Build backend URL with only provided params
    const qs = new URLSearchParams();
    if (supervisorId) qs.set('supervisorId', supervisorId);
    if (status) qs.set('status', status);
    if (date) qs.set('date', date);
    if (shiftId) qs.set('shiftId', shiftId);
    if (limit) qs.set('limit', limit);
    const backendUrl = `http://localhost:3001/api/shifts${qs.toString() ? `?${qs.toString()}` : ''}`;
    const backendResponse = await fetch(backendUrl);
    const data = await backendResponse.json();
    
    console.log('📡 Backend shifts response:', backendResponse.status, data);
    
    return NextResponse.json(data, { status: backendResponse.status });
    
  } catch (error) {
    console.error('❌ Shifts proxy error:', error);
    return NextResponse.json({
      success: false,
      message: 'Shifts proxy server error'
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('🔄 Proxying shifts POST request to backend...');
    
    // Forward request to backend
    const backendResponse = await fetch('http://localhost:3001/api/shifts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await backendResponse.json();
    
    console.log('📡 Backend shifts response:', backendResponse.status, data);
    
    return NextResponse.json(data, { status: backendResponse.status });
    
  } catch (error) {
    console.error('❌ Shifts proxy error:', error);
    return NextResponse.json({
      success: false,
      message: 'Shifts proxy server error'
    }, { status: 500 });
  }
}