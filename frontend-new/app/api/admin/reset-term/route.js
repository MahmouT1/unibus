import { NextResponse } from 'next/server';

// Proxy to backend - في الإنتاج يوجه nginx مباشرة للـ backend
const getBackendUrl = () => {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
};

export async function POST() {
  try {
    const backendUrl = `${getBackendUrl().replace(/\/$/, '')}/api/admin/reset-term`;
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Reset term proxy error:', error);
    return NextResponse.json({
      success: false,
      message: 'فشل في الاتصال بالسيرفر'
    }, { status: 500 });
  }
}
