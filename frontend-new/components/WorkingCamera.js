'use client';

import { useRef, useState } from 'react';

export default function WorkingCamera({ onQRDetected }) {
  const videoRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState('');

  const startCamera = async () => {
    try {
      setError('');
      console.log('🎥 Starting working camera...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsActive(true);
        console.log('✅ Camera working successfully!');
        
        // Simulate QR detection after 3 seconds for testing
        setTimeout(() => {
          if (isActive && onQRDetected) {
            const mockStudent = {
              studentId: 'STU-001',
              id: 'STU-001',
              name: 'أحمد محمد علي',
              email: 'ahmed@student.edu',
              college: 'كلية الهندسة',
              grade: 'السنة الثالثة'
            };
            console.log('🎯 Mock QR detected:', mockStudent);
            onQRDetected(JSON.stringify(mockStudent));
          }
        }, 3000);
      }
    } catch (err) {
      console.error('❌ Camera error:', err);
      setError('فشل في تشغيل الكاميرا: ' + err.message);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    console.log('🛑 Camera stopped');
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h3>كاميرا مسح QR</h3>
      <p>اضغط "تشغيل الكاميرا" لبدء المسح</p>
      
      {error && (
        <div style={{ 
          color: 'red', 
          background: '#fee', 
          padding: '10px', 
          borderRadius: '8px', 
          margin: '10px 0' 
        }}>
          {error}
        </div>
      )}
      
      <div style={{ 
        border: '3px solid #3b82f6', 
        borderRadius: '12px', 
        overflow: 'hidden',
        margin: '20px auto',
        width: '640px',
        height: '480px',
        maxWidth: '100%',
        position: 'relative',
        background: '#f0f0f0'
      }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          muted
          playsInline
        />
        
        {isActive && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '200px',
            height: '200px',
            border: '3px solid #10b981',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#10b981'
            }}>
              📱 ضع QR هنا
            </div>
          </div>
        )}
        
        {!isActive && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '48px',
            color: '#9ca3af'
          }}>
            📹
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        {!isActive ? (
          <button
            onClick={startCamera}
            style={{
              padding: '15px 30px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            📹 تشغيل الكاميرا
          </button>
        ) : (
          <button
            onClick={stopCamera}
            style={{
              padding: '15px 30px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            ⏹️ إيقاف الكاميرا
          </button>
        )}
      </div>
      
      {isActive && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: '#e0f2fe',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#0369a1'
        }}>
          ✅ الكاميرا تعمل - سيتم اكتشاف QR تلقائياً خلال 3 ثوانٍ للاختبار
        </div>
      )}
    </div>
  );
}
