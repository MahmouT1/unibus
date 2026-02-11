import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const backendUrl = (process.env.BACKEND_URL || 'http://127.0.0.1:3001').replace(/\/$/, '');
    const backendResponse = await fetch(`${backendUrl}/api/auth/check-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await backendResponse.text();
    let data;
    try {
      data = text ? JSON.parse(text) : { success: false, message: 'Empty response' };
    } catch (_) {
      return NextResponse.json({ success: false, message: 'Invalid response' }, { status: 502 });
    }
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Proxy server error' }, { status: 500 });
  }
}
