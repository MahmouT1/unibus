'use client';

import { useRef, useEffect, useState } from 'react';

export default function SimpleQRScanner({ onScan, onError }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState(null);

  const startCamera = async () => {
    try {
      console.log('🎥 Starting simple camera...');
      
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Request camera with basic constraints
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'environment'
        }
      });

      console.log('✅ Camera stream obtained');
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play();
        setStream(newStream);
        setIsScanning(true);
        
        console.log('✅ Video started playing');
        
        // Start QR detection
        scanForQR();
      }
      
    } catch (error) {
      console.error('❌ Camera error:', error);
      if (onError) {
        onError('Failed to start camera: ' + error.message);
      }
    }
  };

  const scanForQR = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simple QR detection (you can enhance this)
      // For now, we'll simulate detection after 3 seconds
      setTimeout(() => {
        if (isScanning && onScan) {
          const mockQRData = {
            studentId: 'STU-' + Date.now(),
            id: 'STU-' + Date.now(),
            name: 'أحمد محمد علي',
            email: 'ahmed.student@university.edu',
            phoneNumber: '+20123456789',
            college: 'كلية الهندسة',
            grade: 'السنة الثالثة',
            major: 'هندسة حاسوب',
            address: 'القاهرة، مصر'
          };
          
          console.log('🎯 QR Code detected (simulated):', mockQRData);
          onScan(JSON.stringify(mockQRData));
        }
      }, 3000);
    }

    // Continue scanning
    if (isScanning) {
      requestAnimationFrame(scanForQR);
    }
  };

  const stopCamera = () => {
    console.log('🛑 Stopping camera...');
    setIsScanning(false);
    
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('📹 Camera track stopped');
      });
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopCamera();
    };
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        position: 'relative', 
        display: 'inline-block',
        border: '2px solid #3b82f6',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        <video
          ref={videoRef}
          style={{
            width: '640px',
            height: '480px',
            maxWidth: '100%',
            display: 'block'
          }}
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
        
        {isScanning && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '200px',
            height: '200px',
            border: '3px solid #10b981',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.1)'
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#10b981',
              fontWeight: 'bold',
              fontSize: '14px',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '8px 12px',
              borderRadius: '6px'
            }}>
              📱 Position QR Code Here
            </div>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {!isScanning ? (
          <button
            onClick={startCamera}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px'
            }}
          >
            📹 Start Camera
          </button>
        ) : (
          <button
            onClick={stopCamera}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px'
            }}
          >
            ⏹️ Stop Camera
          </button>
        )}
      </div>
    </div>
  );
}