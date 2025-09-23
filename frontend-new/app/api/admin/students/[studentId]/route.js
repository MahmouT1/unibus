import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { studentId } = params;
    
    console.log('🔄 Proxying student details request to backend...');
    
    // Forward request to backend
    const backendResponse = await fetch(`http://localhost:3001/api/admin/students/${studentId}`);
    const data = await backendResponse.json();
    
    console.log('📡 Backend student response:', backendResponse.status, data);
    
    return NextResponse.json(data, { status: backendResponse.status });
    
  } catch (error) {
    console.error('❌ Student details proxy error:', error);
    return NextResponse.json({
      success: false,
      message: 'Student details proxy server error'
    }, { status: 500 });
  }
}
