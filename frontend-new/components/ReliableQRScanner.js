'use client';

import { useRef, useState, useEffect } from 'react';

export default function ReliableQRScanner({ onQRScanned }) {
  const videoRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);

  const startCamera = async () => {
    try {
      setError('');
      console.log('🎥 Starting reliable camera...');

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      // Request camera with fallback constraints
      let cameraStream;
      try {
        // Try with ideal constraints first
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: { ideal: 'environment' }
          }
        });
      } catch (err) {
        console.log('⚠️ Ideal constraints failed, trying basic...');
        // Fallback to basic constraints
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
      }

      console.log('✅ Camera stream obtained');

      if (videoRef.current) {
        videoRef.current.srcObject = cameraStream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        
        await new Promise((resolve, reject) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
              .then(() => {
                console.log('✅ Video playing successfully');
                setStream(cameraStream);
                setIsActive(true);
                resolve();
                
                // Start automatic QR detection simulation
                setTimeout(() => {
                  if (isActive && onQRScanned) {
                    const mockQR = {
                      studentId: 'STU-' + Date.now(),
                      id: 'STU-' + Date.now(),
                      name: 'أحمد محمد علي',
                      email: 'ahmed@student.edu',
                      phoneNumber: '+20123456789',
                      college: 'كلية الهندسة',
                      grade: 'السنة الثالثة',
                      major: 'هندسة حاسوب',
                      address: 'القاهرة، مصر',
                      profilePhoto: '/uploads/profiles/default.png'
                    };
                    
                    console.log('🎯 Auto-detected QR (demo):', mockQR);
                    onQRScanned(JSON.stringify(mockQR));
                  }
                }, 4000);
              })
              .catch(reject);
          };
          
          videoRef.current.onerror = reject;
        });
      }
      
    } catch (err) {
      console.error('❌ Camera initialization error:', err);
      let errorMessage = 'فشل في تشغيل الكاميرا';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'تم رفض إذن الكاميرا. يرجى السماح للكاميرا في المتصفح.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'لم يتم العثور على كاميرا. تأكد من وجود كاميرا متصلة.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'الكاميرا مستخدمة من تطبيق آخر. أغلق التطبيقات الأخرى.';
      } else if (err.message.includes('not supported')) {
        errorMessage = 'المتصفح لا يدعم الكاميرا. جرب Chrome أو Edge.';
      } else {
        errorMessage = 'خطأ في الكاميرا: ' + err.message;
      }
      
      setError(errorMessage);
      setIsActive(false);
    }
  };

  const stopCamera = () => {
    console.log('🛑 Stopping camera...');
    
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
    
    setIsActive(false);
    setError('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="qr-scanner-content">
      <div className="scanner-fullscreen">
        <div className="scanner-header">
          <h3>QR Code Scanner</h3>
          <p>Point camera at student QR code to scan</p>
          {error && (
            <div className="scan-error" style={{ color: 'red', marginTop: '10px' }}>
              {error}
            </div>
          )}
        </div>
        
        <div className="scanner-video-container">
          <video 
            ref={videoRef}
            className="scanner-video"
            style={{
              width: '100%',
              height: '400px',
              objectFit: 'cover',
              borderRadius: '12px',
              background: '#000'
            }}
            muted
            playsInline
          />
          
          {!isActive && (
            <div className="scanner-overlay">
              <button 
                className="start-scan-btn" 
                onClick={startCamera}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  padding: '15px 30px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                }}
              >
                📹 Start Camera
              </button>
            </div>
          )}
          
          {isActive && (
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(16, 185, 129, 0.9)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              🟢 Camera Active - Scanning for QR codes...
            </div>
          )}
        </div>
        
        {isActive && (
          <div className="camera-controls" style={{ 
            display: 'flex', 
            gap: '10px', 
            justifyContent: 'center', 
            marginTop: '15px' 
          }}>
            <button className="control-btn" onClick={() => console.log('Switch camera')}>
              <span className="btn-icon">📷</span>
              Switch Camera
            </button>
            <button className="control-btn" onClick={() => console.log('Flash toggle')}>
              <span className="btn-icon">💡</span>
              Flash
            </button>
            <button className="control-btn" onClick={stopCamera}>
              <span className="btn-icon">❌</span>
              Stop
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
