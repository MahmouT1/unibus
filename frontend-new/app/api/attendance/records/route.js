import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const qs = url.searchParams.toString();

    const backendUrl = `http://localhost:3001/api/attendance/records${qs ? `?${qs}` : ''}`;
    const authHeader = request.headers.get('authorization') || '';

    const resp = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Proxy error (records):', error);
    return NextResponse.json({ success: false, message: 'Proxy failed', error: error.message }, { status: 500 });
  }
}