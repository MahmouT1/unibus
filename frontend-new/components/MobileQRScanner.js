'use client';

import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';

const MobileQRScanner = ({ onScanSuccess, onScanError, supervisorId, supervisorName }) => {
  const [cameraState, setCameraState] = useState('stopped');
  const [message, setMessage] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('environment');
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanTimeoutRef = useRef(null);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                           window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
      console.log('📱 Mobile device detected:', isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      stopCamera();
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraState('requesting');
      setMessage('🔍 Starting camera for mobile scanning...');
      console.log('📱 Starting mobile camera...');
      
      // Mobile-optimized camera constraints
      const constraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: isMobile ? 720 : 1280, min: 320 },
          height: { ideal: isMobile ? 480 : 720, min: 240 },
          frameRate: { ideal: isMobile ? 15 : 30, min: 10 }
        },
        audio: false
      };
      
      console.log('📷 Camera constraints:', constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Camera stream obtained for mobile');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Mobile-specific video settings
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
        
        await videoRef.current.play();
        setCameraState('active');
        setMessage('✅ Camera active on mobile! Point at student QR code and tap "Scan QR".');
        
        console.log('✅ Mobile camera is now active');
      }
      
    } catch (error) {
      console.error('❌ Mobile camera error:', error);
      setCameraState('error');
      
      let errorMsg = '';
      switch (error.name) {
        case 'NotAllowedError':
          errorMsg = '🚫 Camera permission denied. Please allow camera access in your mobile browser settings.';
          break;
        case 'NotFoundError':
          errorMsg = '📷 No camera found. Please make sure your mobile device camera is working.';
          break;
        case 'NotReadableError':
          errorMsg = '⚠️ Camera is being used by another app. Please close other camera apps.';
          break;
        case 'OverconstrainedError':
          errorMsg = '⚙️ Camera settings not supported. Trying basic settings...';
          // Try with basic settings
          setTimeout(() => {
            setCameraFacing('user');
            startCamera();
          }, 1000);
          return;
        default:
          errorMsg = `❌ Camera error: ${error.message}`;
      }
      
      setMessage(errorMsg);
      onScanError?.(errorMsg);
    }
  };

  const stopCamera = () => {
    console.log('🛑 Stopping mobile camera...');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('📹 Mobile camera track stopped');
      });
      streamRef.current = null;
    }
    
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    
    setCameraState('stopped');
    setMessage('');
    console.log('✅ Mobile camera stopped');
  };

  const switchCamera = async () => {
    if (!isMobile) return;
    
    const newFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(newFacing);
    
    if (cameraState === 'active') {
      stopCamera();
      setTimeout(() => {
        startCamera();
      }, 500);
    }
  };

  const scanQRCode = () => {
    if (cameraState !== 'active') {
      setMessage('❌ Please start the camera first before scanning.');
      return;
    }
    
    console.log('🎯 Mobile QR scan initiated...');
    setMessage('🔄 Scanning QR code...');
    
    // Real QR scanning implementation
    const scanInterval = setInterval(() => {
      if (videoRef.current && cameraState === 'active') {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        
        if (code) {
          clearInterval(scanInterval);
          console.log('✅ QR Code detected:', code.data);
          
          try {
            // Try to parse the QR code data
            let qrData = code.data;
            
            // If it's JSON, parse it
            if (qrData.startsWith('{') && qrData.endsWith('}')) {
              qrData = JSON.parse(qrData);
            }
            
            // Format the data for the callback
            const studentData = {
              id: qrData.id || qrData.studentId,
              studentId: qrData.studentId || qrData.id,
              fullName: qrData.fullName || qrData.name,
              name: qrData.fullName || qrData.name,
              email: qrData.email,
              phoneNumber: qrData.phoneNumber,
              college: qrData.college,
              grade: qrData.grade,
              major: qrData.major,
              address: qrData.address,
              profilePhoto: qrData.profilePhoto
            };
            
            setScanCount(prev => prev + 1);
            setMessage(`✅ QR scanned on mobile! Student: ${studentData.fullName || studentData.name}`);
            
            console.log('✅ Mobile QR scan completed:', studentData);
            
            if (onScanSuccess) {
              onScanSuccess(studentData);
            }
          } catch (error) {
            console.error('❌ Error parsing QR data:', error);
            setMessage('❌ Invalid QR code format. Please try again.');
            onScanError?.('Invalid QR code format');
          }
        } else {
          // Update progress message
          setMessage('🔄 Scanning QR code... Please hold steady...');
        }
      }
    }, 500); // Scan every 500ms
    
    // Stop scanning after 30 seconds
    setTimeout(() => {
      clearInterval(scanInterval);
      if (cameraState === 'active') {
        setMessage('⏰ Scan timeout. Please try again.');
      }
    }, 30000);
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: isMobile ? '12px' : '16px',
      padding: isMobile ? '16px' : '24px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      maxWidth: '100%',
      margin: '0 auto',
      minHeight: isMobile ? 'auto' : '500px'
    }}>
      {/* Mobile-Optimized Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: isMobile ? '16px' : '24px'
      }}>
        <div style={{ fontSize: isMobile ? '36px' : '48px', marginBottom: '8px' }}>📱</div>
        <h3 style={{
          color: '#2d3748',
          margin: '0 0 8px 0',
          fontSize: isMobile ? '20px' : '24px',
          fontWeight: '600'
        }}>
          {isMobile ? 'Mobile QR Scanner' : 'QR Code Scanner'}
        </h3>
        <div style={{
          color: cameraState === 'active' ? '#48bb78' : '#e53e3e',
          fontSize: '12px',
          fontWeight: '500',
          padding: '6px 12px',
          background: '#f7fafc',
          borderRadius: '16px',
          display: 'inline-block'
        }}>
          {cameraState === 'active' ? '🟢 Camera Active' : 
           cameraState === 'requesting' ? '🟡 Starting...' : '🔴 Camera Stopped'}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: isMobile ? '12px' : '16px',
          borderRadius: '8px',
          marginBottom: '16px',
          background: message.includes('✅') ? '#f0fff4' : message.includes('🔍') || message.includes('🔄') ? '#f0f9ff' : '#fed7d7',
          color: message.includes('✅') ? '#22543d' : message.includes('🔍') || message.includes('🔄') ? '#1e40af' : '#742a2a',
          border: `2px solid ${message.includes('✅') ? '#48bb78' : message.includes('🔍') || message.includes('🔄') ? '#3b82f6' : '#e53e3e'}`,
          fontSize: isMobile ? '12px' : '14px',
          fontWeight: '500',
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          {message}
        </div>
      )}

      {/* Mobile Video Container */}
      <div style={{
        position: 'relative',
        background: '#000',
        borderRadius: isMobile ? '8px' : '12px',
        overflow: 'hidden',
        marginBottom: isMobile ? '16px' : '20px',
        aspectRatio: isMobile ? '16/12' : '4/3',
        maxWidth: isMobile ? '100%' : '500px',
        margin: '0 auto',
        border: cameraState === 'active' ? '3px solid #48bb78' : '2px solid #e2e8f0',
        touchAction: 'manipulation' // Optimize for mobile touch
      }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          autoPlay
          playsInline
          muted
          webkit-playsinline="true"
        />
        
        {/* Mobile Camera Placeholder */}
        {cameraState !== 'active' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: isMobile ? '48px' : '64px', 
                marginBottom: '12px'
              }}>
                {cameraState === 'requesting' ? '⏳' : cameraState === 'error' ? '❌' : '📷'}
              </div>
              <div style={{ fontSize: isMobile ? '14px' : '16px' }}>
                {cameraState === 'requesting' ? 'Starting Camera...' : 
                 cameraState === 'error' ? 'Camera Error' : 'Ready for Mobile'}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Scanning Frame */}
        {cameraState === 'active' && (
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            right: '10%',
            bottom: '10%',
            border: '3px solid #48bb78',
            borderRadius: '8px',
            pointerEvents: 'none'
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '0',
              right: '0',
              height: '2px',
              background: '#48bb78',
              animation: 'scanLine 2s ease-in-out infinite'
            }}></div>
          </div>
        )}
      </div>

      {/* Mobile-Optimized Controls */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '8px' : '12px',
        justifyContent: 'center',
        marginBottom: isMobile ? '16px' : '20px'
      }}>
        <button
          onClick={cameraState === 'active' ? stopCamera : startCamera}
          disabled={cameraState === 'requesting'}
          style={{
            padding: isMobile ? '14px 20px' : '16px 32px',
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '600',
            background: cameraState === 'active' ? '#e53e3e' : '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: isMobile ? '8px' : '12px',
            cursor: cameraState === 'requesting' ? 'not-allowed' : 'pointer',
            opacity: cameraState === 'requesting' ? 0.5 : 1,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.3s',
            width: isMobile ? '100%' : 'auto',
            touchAction: 'manipulation'
          }}
        >
          {cameraState === 'requesting' ? '⏳ Starting...' :
           cameraState === 'active' ? '⏹️ Stop Camera' : '📹 Start Camera'}
        </button>

        <button
          onClick={scanQRCode}
          disabled={cameraState !== 'active'}
          style={{
            padding: isMobile ? '14px 20px' : '16px 32px',
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '600',
            background: cameraState !== 'active' ? '#a0aec0' : '#48bb78',
            color: 'white',
            border: 'none',
            borderRadius: isMobile ? '8px' : '12px',
            cursor: cameraState !== 'active' ? 'not-allowed' : 'pointer',
            opacity: cameraState !== 'active' ? 0.5 : 1,
            boxShadow: '0 4px 12px rgba(72, 187, 120, 0.4)',
            transition: 'all 0.3s',
            width: isMobile ? '100%' : 'auto',
            touchAction: 'manipulation'
          }}
        >
          🎯 Scan QR Code
        </button>

        {isMobile && (
          <button
            onClick={switchCamera}
            disabled={cameraState !== 'active'}
            style={{
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '600',
              background: cameraState !== 'active' ? '#a0aec0' : '#6b46c1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: cameraState !== 'active' ? 'not-allowed' : 'pointer',
              opacity: cameraState !== 'active' ? 0.5 : 1,
              width: '100%',
              touchAction: 'manipulation'
            }}
          >
            📷 Switch Camera ({cameraFacing === 'environment' ? 'Back' : 'Front'})
          </button>
        )}
      </div>

      {/* Mobile Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: isMobile ? '8px' : '12px',
        background: '#f7fafc',
        borderRadius: '8px',
        padding: isMobile ? '12px' : '16px',
        marginBottom: '16px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: isMobile ? '16px' : '20px', marginBottom: '4px' }}>👨‍🏫</div>
          <div style={{ fontSize: isMobile ? '10px' : '12px', fontWeight: '600', color: '#2d3748' }}>Supervisor</div>
          <div style={{ fontSize: isMobile ? '8px' : '10px', color: '#718096' }}>
            {supervisorName.length > 15 ? supervisorName.slice(0, 15) + '...' : supervisorName}
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: isMobile ? '16px' : '20px', marginBottom: '4px' }}>📊</div>
          <div style={{ fontSize: isMobile ? '10px' : '12px', fontWeight: '600', color: '#2d3748' }}>Scans</div>
          <div style={{ fontSize: isMobile ? '8px' : '10px', color: '#718096' }}>{scanCount}</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: isMobile ? '16px' : '20px', marginBottom: '4px' }}>📱</div>
          <div style={{ fontSize: isMobile ? '10px' : '12px', fontWeight: '600', color: '#2d3748' }}>Device</div>
          <div style={{ fontSize: isMobile ? '8px' : '10px', color: '#718096' }}>
            {isMobile ? 'Mobile' : 'Desktop'}
          </div>
        </div>
      </div>

      {/* Mobile Instructions */}
      <div style={{
        background: '#e6fffa',
        borderRadius: '8px',
        padding: isMobile ? '12px' : '16px',
        textAlign: 'center'
      }}>
        <h4 style={{ 
          color: '#234e52', 
          margin: '0 0 8px 0', 
          fontSize: isMobile ? '14px' : '16px' 
        }}>
          📖 Mobile Instructions
        </h4>
        <p style={{ 
          color: '#2c7a7b', 
          fontSize: isMobile ? '11px' : '14px', 
          margin: '0',
          lineHeight: '1.4'
        }}>
          {isMobile ? (
            <>
              <strong>Mobile Mode Detected!</strong><br/>
              1. Tap "📹 Start Camera" → Allow camera access<br/>
              2. Point at student QR code<br/>
              3. Tap "🎯 Scan QR Code" when ready<br/>
              4. Use "📷 Switch Camera" for front/back camera
            </>
          ) : (
            <>
              1. Click "📹 Start Camera" → Allow camera access<br/>
              2. Point at student QR code<br/>
              3. Click "🎯 Scan QR Code" when ready
            </>
          )}
        </p>
      </div>

      <style jsx>{`
        @keyframes scanLine {
          0% { top: 20%; }
          50% { top: 80%; }
          100% { top: 20%; }
        }
      `}</style>
    </div>
  );
};

export default MobileQRScanner;
