'use client';

import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';

const RealQRScanner = ({ onScanSuccess, onScanError, supervisorId, supervisorName }) => {
  const [cameraState, setCameraState] = useState('stopped');
  const [message, setMessage] = useState('Click "Start Camera" to begin scanning');
  const [scanCount, setScanCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('environment');
  const [isScanning, setIsScanning] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Image enhancement for better QR detection
  const enhanceImageContrast = (imageData) => {
    const data = new Uint8ClampedArray(imageData.data);
    
    // Increase contrast for better QR detection
    for (let i = 0; i < data.length; i += 4) {
      // Get RGB values
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Convert to grayscale and enhance contrast
      const gray = (r + g + b) / 3;
      const enhanced = gray > 128 ? 255 : 0; // High contrast black/white
      
      data[i] = enhanced;     // R
      data[i + 1] = enhanced; // G
      data[i + 2] = enhanced; // B
      // Alpha stays the same
    }
    
    return new ImageData(data, imageData.width, imageData.height);
  };

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
      setCameraState('starting');
      setMessage('🔄 Starting camera...');
      
      console.log('📹 Requesting camera access...');
      
      const constraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        setCameraState('active');
        setMessage('📱 Camera active! Point at student QR code to scan');
        
        console.log('✅ Camera started successfully');
      }
      
    } catch (error) {
      console.error('❌ Camera error:', error);
      setCameraState('error');
      
      let errorMessage = 'Camera access failed';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is being used by another application.';
      }
      
      setMessage(`❌ ${errorMessage}`);
      
      if (onScanError) {
        onScanError(errorMessage);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    setCameraState('stopped');
    setIsScanning(false);
    setMessage('Camera stopped');
    
    console.log('📹 Camera stopped');
  };

  const switchCamera = async () => {
    if (cameraState === 'active') {
      const newFacing = cameraFacing === 'environment' ? 'user' : 'environment';
      setCameraFacing(newFacing);
      
      // Restart camera with new facing mode
      stopCamera();
      setTimeout(() => {
        startCamera();
      }, 500);
    }
  };

  const startScanning = () => {
    if (cameraState !== 'active') {
      setMessage('❌ Please start the camera first');
      return;
    }
    
    setIsScanning(true);
    setMessage('🔍 SCANNING ACTIVE - Point camera at QR code');
    
    console.log('🎯 Starting real QR detection...');
    
    // Start continuous QR detection immediately
    detectQRCode();
  };

  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    setIsScanning(false);
    setMessage('📱 Camera active - ready to scan');
  };

  const detectQRCode = () => {
    const video = videoRef.current;
    
    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
      if (isScanning && cameraState === 'active') {
        requestAnimationFrame(detectQRCode);
      }
      return;
    }
    
    // Create or get canvas
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }
    
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Debug: Log detection attempts (only every 30 frames to avoid spam)
    if (Math.random() < 0.03) { // ~3% chance to log
      console.log('🔍 Scanning for QR code...', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        isScanning,
        cameraState,
        videoReadyState: video.readyState
      });
    }
    
    // Detect QR code with enhanced options for better detection
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
      // Add more detection options for better sensitivity
    });
    
    // Also try with different image processing
    if (!qrCode) {
      // Try with contrast enhancement
      const enhancedImageData = enhanceImageContrast(imageData);
      const enhancedQrCode = jsQR(enhancedImageData.data, enhancedImageData.width, enhancedImageData.height, {
        inversionAttempts: 'attemptBoth'
      });
      
      if (enhancedQrCode && enhancedQrCode.data) {
        console.log('🎯 QR Code detected with enhancement:', enhancedQrCode.data);
        handleQRDetection(enhancedQrCode.data);
        return;
      }
    }
    
    if (qrCode && qrCode.data) {
      console.log('🎯 QR Code detected:', qrCode.data);
      handleQRDetection(qrCode.data);
      return;
    }
    
    // Continue scanning
    if (isScanning && cameraState === 'active') {
      requestAnimationFrame(detectQRCode);
    }
  };

  const handleQRDetection = (qrData) => {
    try {
      console.log('🎯 QR CODE DETECTED!');
      console.log('📱 Raw QR data:', qrData);
      console.log('📏 QR data length:', qrData.length);
      console.log('📋 QR data type:', typeof qrData);
      
      // Stop scanning immediately
      stopScanning();
      
      // Show immediate feedback
      setMessage(`🎉 QR Code detected! Processing data...`);
      
      let studentData;
      
      // Try different parsing methods
      try {
        // Method 1: Parse as JSON
        studentData = JSON.parse(qrData);
        console.log('✅ Successfully parsed as JSON:', studentData);
        setMessage(`✅ JSON QR Code! Student: ${studentData.fullName || studentData.name}`);
      } catch (jsonError) {
        console.log('⚠️ Not JSON format, trying other methods...');
        
        // Method 2: Check if it's a URL with studentId
        if (qrData.includes('studentId=')) {
          const studentId = qrData.split('studentId=')[1].split('&')[0];
          studentData = {
            studentId: studentId,
            id: studentId,
            fullName: `Student ${studentId}`,
            name: `Student ${studentId}`,
            email: `${studentId}@unibus.edu`,
            phoneNumber: 'Not provided',
            college: 'Unknown College',
            grade: 'Unknown Grade',
            major: 'Unknown Major',
            address: 'Unknown Address',
            qrSource: 'URL'
          };
          console.log('✅ Extracted from URL:', studentData);
          setMessage(`✅ URL QR Code! Student ID: ${studentId}`);
        } 
        // Method 3: Check if it's just a student ID pattern
        else if (/^STU-\d+$/.test(qrData) || /^\d+$/.test(qrData)) {
          studentData = {
            studentId: qrData,
            id: qrData,
            fullName: `Student ${qrData}`,
            name: `Student ${qrData}`,
            email: `${qrData}@unibus.edu`,
            phoneNumber: 'Not provided',
            college: 'Unknown College',
            grade: 'Unknown Grade',
            major: 'Unknown Major',
            address: 'Unknown Address',
            qrSource: 'ID'
          };
          console.log('✅ Treated as student ID:', studentData);
          setMessage(`✅ Student ID QR Code! ID: ${qrData}`);
        }
        // Method 4: Any other text - create generic student
        else {
          studentData = {
            studentId: qrData.substring(0, 20), // Limit length
            id: qrData.substring(0, 20),
            fullName: `QR Student: ${qrData.substring(0, 30)}`,
            name: `QR Student: ${qrData.substring(0, 30)}`,
            email: 'qr-student@unibus.edu',
            phoneNumber: 'Not provided',
            college: 'QR Detected',
            grade: 'Unknown',
            major: 'Unknown',
            address: 'Unknown',
            qrSource: 'Text',
            originalQRData: qrData
          };
          console.log('✅ Created from text QR:', studentData);
          setMessage(`✅ Text QR Code detected! Data: ${qrData.substring(0, 30)}...`);
        }
      }
      
      // Always create valid student data
      if (!studentData) {
        studentData = {
          studentId: 'QR-DETECTED',
          id: 'QR-DETECTED',
          fullName: 'QR Code Detected',
          name: 'QR Code Detected',
          email: 'detected@unibus.edu',
          qrSource: 'Generic',
          originalQRData: qrData
        };
      }
      
      setScanCount(prev => prev + 1);
      
      console.log('🎉 Final processed student data:', studentData);
      
      // Always call success callback - any QR detection is successful
      if (onScanSuccess) {
        console.log('📞 Calling onScanSuccess with:', studentData);
        onScanSuccess(studentData);
      } else {
        console.log('⚠️ No onScanSuccess callback provided');
      }
      
    } catch (error) {
      console.error('❌ QR processing error:', error);
      setMessage(`❌ Error processing QR code: ${error.message}`);
      if (onScanError) {
        onScanError(`Error processing QR code: ${error.message}`);
      }
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: isMobile ? '12px' : '16px',
      padding: isMobile ? '16px' : '24px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      marginBottom: isMobile ? '16px' : '24px'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{
          margin: '0 0 8px 0',
          fontSize: isMobile ? '20px' : '24px',
          fontWeight: '600',
          color: '#2d3748'
        }}>
          📱 QR Code Scanner
        </h2>
        <p style={{
          margin: '0',
          fontSize: isMobile ? '12px' : '14px',
          color: '#718096'
        }}>
          Point camera at student QR code to scan attendance
        </p>
      </div>

      {/* Camera Video - Professional Size */}
      <div style={{
        position: 'relative',
        background: '#000',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '16px',
        width: isMobile ? '100%' : '400px',
        height: isMobile ? '250px' : '300px',
        margin: '0 auto 16px auto',
        border: '3px solid #4299e1'
      }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            cursor: cameraState === 'active' ? 'pointer' : 'default'
          }}
          playsInline
          muted
          onClick={() => {
            if (cameraState === 'active' && !isScanning) {
              console.log('📱 Video clicked - starting QR scan');
              startScanning();
            }
          }}
          onLoadedMetadata={() => {
            console.log('📹 Video loaded, auto-starting QR detection');
            setTimeout(() => {
              if (cameraState === 'active') {
                console.log('🎯 Auto-starting QR scanning like old scanner...');
                startScanning();
              }
            }, 500);
          }}
        />
        
        {/* Old Scanner Style Overlay - Yellow Dashed */}
        {isScanning && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '200px',
            height: '200px',
            border: '3px dashed #ffd700',
            borderRadius: '12px',
            background: 'rgba(255, 215, 0, 0.1)',
            animation: 'pulse 1.5s infinite',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
          }}>
            {/* Corner brackets like old scanner */}
            <div style={{
              position: 'absolute',
              top: '-3px',
              left: '-3px',
              width: '25px',
              height: '25px',
              borderTop: '4px solid #ffd700',
              borderLeft: '4px solid #ffd700',
              borderRadius: '4px 0 0 0'
            }}></div>
            <div style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '25px',
              height: '25px',
              borderTop: '4px solid #ffd700',
              borderRight: '4px solid #ffd700',
              borderRadius: '0 4px 0 0'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '-3px',
              left: '-3px',
              width: '25px',
              height: '25px',
              borderBottom: '4px solid #ffd700',
              borderLeft: '4px solid #ffd700',
              borderRadius: '0 0 0 4px'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '-3px',
              right: '-3px',
              width: '25px',
              height: '25px',
              borderBottom: '4px solid #ffd700',
              borderRight: '4px solid #ffd700',
              borderRadius: '0 0 4px 0'
            }}></div>
            
            {/* Scanning message like old scanner */}
            <div style={{
              position: 'absolute',
              top: '-40px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
              color: '#1a202c',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '700',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)',
              border: '2px solid #ffd700'
            }}>
              🔍 SCANNING ACTIVE
            </div>
          </div>
        )}
        
        {/* Camera state indicator */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: cameraState === 'active' ? '#48bb78' : '#e53e3e',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '10px',
          fontWeight: '600'
        }}>
          {cameraState === 'active' ? '🟢 Active' : '🔴 Inactive'}
        </div>
      </div>

      {/* Hidden canvas for QR detection */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Status Message */}
      <div style={{
        background: isScanning ? '#f0fff4' : '#f7fafc',
        border: `2px solid ${isScanning ? '#48bb78' : '#e2e8f0'}`,
        borderRadius: '8px',
        padding: isMobile ? '12px' : '16px',
        marginBottom: '16px',
        textAlign: 'center',
        fontSize: isMobile ? '14px' : '16px',
        fontWeight: '500',
        color: isScanning ? '#22543d' : '#2d3748'
      }}>
        {isScanning ? '🔍 SCANNING ACTIVE - Point at QR code' : message}
      </div>

      {/* Debug Info */}
      <div style={{
        background: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px',
        fontSize: '12px',
        color: '#0369a1'
      }}>
        <strong>Debug Info:</strong><br/>
        Camera: {cameraState} | Scanning: {isScanning ? 'Yes' : 'No'}<br/>
        Scan Count: {scanCount} | Mobile: {isMobile ? 'Yes' : 'No'}<br/>
        <button 
          onClick={() => {
            console.log('🔍 Manual scan trigger');
            if (cameraState === 'active' && !isScanning) {
              startScanning();
            }
          }}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '10px',
            cursor: 'pointer',
            marginTop: '4px'
          }}
        >
          🔍 Force Scan
        </button>
      </div>

      {/* Camera Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: isMobile ? '8px' : '12px',
        marginBottom: '16px'
      }}>
        {cameraState !== 'active' ? (
          <button
            onClick={startCamera}
            disabled={cameraState === 'starting'}
            style={{
              padding: isMobile ? '14px' : '16px',
              background: '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '600',
              cursor: cameraState === 'starting' ? 'not-allowed' : 'pointer',
              opacity: cameraState === 'starting' ? 0.7 : 1,
              transition: 'all 0.3s'
            }}
          >
            {cameraState === 'starting' ? '⏳ Starting...' : '📹 Start Camera'}
          </button>
        ) : (
          <button
            onClick={stopCamera}
            style={{
              padding: isMobile ? '14px' : '16px',
              background: '#e53e3e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            ⏹️ Stop Camera
          </button>
        )}
        
        {cameraState === 'active' && (
          <button
            onClick={switchCamera}
            style={{
              padding: isMobile ? '14px' : '16px',
              background: '#805ad5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            🔄 Switch Camera
          </button>
        )}
      </div>

      {/* Professional Scan Controls */}
      {cameraState === 'active' && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px'
        }}>
          {!isScanning ? (
            <button
              onClick={startScanning}
              style={{
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(72, 187, 120, 0.4)',
                minWidth: '160px'
              }}
            >
              🎯 Scan QR Code
            </button>
          ) : (
            <button
              onClick={stopScanning}
              style={{
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(237, 137, 54, 0.4)',
                minWidth: '160px'
              }}
            >
              ⏸️ Stop Scanning
            </button>
          )}
        </div>
      )}

      {/* Scan Statistics */}
      {scanCount > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#f0fff4',
          border: '2px solid #48bb78',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: isMobile ? '14px' : '16px',
          color: '#22543d'
        }}>
          📊 QR Codes Scanned: {scanCount}
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(72, 187, 120, 0); }
          100% { box-shadow: 0 0 0 0 rgba(72, 187, 120, 0); }
        }
      `}</style>
    </div>
  );
};

export default RealQRScanner;
