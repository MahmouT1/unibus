import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    const backendUrl = (process.env.BACKEND_URL || 'http://127.0.0.1:3001').replace(/\/$/, '');
    const url = `${backendUrl}/api/auth/login`;
    
    const backendResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    
    const text = await backendResponse.text();
    let data;
    try {
      data = text ? JSON.parse(text) : { success: false, message: 'Empty response' };
    } catch (_) {
      console.error('Backend returned non-JSON:', text?.slice(0, 200));
      return NextResponse.json({
        success: false,
        message: 'Invalid response from auth service'
      }, { status: 502 });
    }
    
    return NextResponse.json(data, { status: backendResponse.status });
    
  } catch (error) {
    const msg = error.name === 'TimeoutError' ? 'Auth service timeout' 
      : error.cause?.code === 'ECONNREFUSED' ? 'Cannot reach auth service' 
      : 'Proxy server error';
    console.error('Proxy error:', error.message || error);
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
