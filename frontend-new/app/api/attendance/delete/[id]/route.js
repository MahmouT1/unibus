import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    console.log('🔄 Proxying delete attendance request to backend...');
    
    // Forward request to backend
    const backendResponse = await fetch(`http://localhost:3001/api/attendance/delete/${id}`, {
      method: 'DELETE'
    });
    const data = await backendResponse.json();
    
    console.log('📡 Backend delete attendance response:', backendResponse.status, data);
    
    return NextResponse.json(data, { status: backendResponse.status });
    
  } catch (error) {
    console.error('❌ Delete attendance proxy error:', error);
    return NextResponse.json({
      success: false,
      message: 'Delete attendance proxy server error'
    }, { status: 500 });
  }
}