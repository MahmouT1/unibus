'use client';

import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
// ZXing (robust QR reader)
import { BrowserMultiFormatReader } from '@zxing/browser';

const AccurateQRScanner = ({ onScanSuccess, onScanError, supervisorId, supervisorName }) => {
  const [cameraState, setCameraState] = useState('stopped');
  const [message, setMessage] = useState('Click "Start Camera" to begin scanning');
  const [scanCount, setScanCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const animationFrameRef = useRef(null);
  const zxingReaderRef = useRef(null); // ZXing reader

  // Enhanced image processing for better QR detection
  const enhanceImageForQR = (imageData) => {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;
    
    // Create multiple enhanced versions
    const enhanced = new Uint8ClampedArray(data.length);
    const grayscale = new Uint8ClampedArray(data.length);
    
    // Convert to grayscale and enhance contrast
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = data[i + 3];
      
      // Grayscale conversion
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      grayscale[i] = gray;
      grayscale[i + 1] = gray;
      grayscale[i + 2] = gray;
      grayscale[i + 3] = alpha;
      
      // High contrast enhancement
      const enhancedGray = gray > 128 ? 255 : 0;
      enhanced[i] = enhancedGray;
      enhanced[i + 1] = enhancedGray;
      enhanced[i + 2] = enhancedGray;
      enhanced[i + 3] = alpha;
    }
    
    return {
      original: new ImageData(data, width, height),
      grayscale: new ImageData(grayscale, width, height),
      enhanced: new ImageData(enhanced, width, height)
    };
  };

  // Multiple QR detection attempts with different settings
  const detectQRWithMultipleMethods = (imageData) => {
    const enhanced = enhanceImageForQR(imageData);
    
    // Method 1: Original image with attemptBoth
    let qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth'
    });
    
    if (qrCode && qrCode.data) {
      console.log('✅ QR detected with original image (attemptBoth)');
      return qrCode;
    }
    
    // Method 2: Original image with dontInvert
    qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    });
    
    if (qrCode && qrCode.data) {
      console.log('✅ QR detected with original image (dontInvert)');
      return qrCode;
    }
    
    // Method 3: Original image with invertFirst
    qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'invertFirst'
    });
    
    if (qrCode && qrCode.data) {
      console.log('✅ QR detected with original image (invertFirst)');
      return qrCode;
    }
    
    // Method 4: Grayscale with attemptBoth
    qrCode = jsQR(enhanced.grayscale.data, enhanced.grayscale.width, enhanced.grayscale.height, {
      inversionAttempts: 'attemptBoth'
    });
    
    if (qrCode && qrCode.data) {
      console.log('✅ QR detected with grayscale (attemptBoth)');
      return qrCode;
    }
    
    // Method 5: Grayscale with dontInvert
    qrCode = jsQR(enhanced.grayscale.data, enhanced.grayscale.width, enhanced.grayscale.height, {
      inversionAttempts: 'dontInvert'
    });
    
    if (qrCode && qrCode.data) {
      console.log('✅ QR detected with grayscale (dontInvert)');
      return qrCode;
    }
    
    // Method 6: Enhanced contrast with attemptBoth
    qrCode = jsQR(enhanced.enhanced.data, enhanced.enhanced.width, enhanced.enhanced.height, {
      inversionAttempts: 'attemptBoth'
    });
    
    if (qrCode && qrCode.data) {
      console.log('✅ QR detected with enhanced contrast (attemptBoth)');
      return qrCode;
    }
    
    // Method 7: Enhanced contrast with dontInvert
    qrCode = jsQR(enhanced.enhanced.data, enhanced.enhanced.width, enhanced.enhanced.height, {
      inversionAttempts: 'dontInvert'
    });
    
    if (qrCode && qrCode.data) {
      console.log('✅ QR detected with enhanced contrast (dontInvert)');
      return qrCode;
    }
    
    // Method 8: Try with different image sizes (scaled down)
    const scaledCanvas = document.createElement('canvas');
    const scaledContext = scaledCanvas.getContext('2d');
    scaledCanvas.width = imageData.width / 2;
    scaledCanvas.height = imageData.height / 2;
    scaledContext.drawImage(canvasRef.current, 0, 0, scaledCanvas.width, scaledCanvas.height);
    const scaledImageData = scaledContext.getImageData(0, 0, scaledCanvas.width, scaledCanvas.height);
    
    qrCode = jsQR(scaledImageData.data, scaledImageData.width, scaledImageData.height, {
      inversionAttempts: 'attemptBoth'
    });
    
    if (qrCode && qrCode.data) {
      console.log('✅ QR detected with scaled image');
      return qrCode;
    }
    
    return null;
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
      window.removeEventListener('resize', checkMobile);
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraState('starting');
      setMessage('🔄 Starting camera...');
      
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30, max: 60 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setCameraState('active');
      setMessage('📱 Camera active! Point at QR code to scan');
      
      // Auto-start scanning after camera is ready
      setTimeout(() => {
        startScanning();
      }, 300);
      
    } catch (error) {
      console.error('❌ Camera error:', error);
      setCameraState('error');
      setMessage('❌ Camera access denied or not available');
      if (onScanError) {
        onScanError(error);
      }
    }
  };

  const stopZxing = () => {
    try {
      if (zxingReaderRef.current) {
        zxingReaderRef.current.reset();
        zxingReaderRef.current = null;
      }
    } catch (_) {}
  };

  const stopCamera = () => {
    stopZxing();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    stopScanning();
    setCameraState('stopped');
    setMessage('📱 Camera stopped');
  };

  const startZxing = () => {
    if (!videoRef.current) return false;
    try {
      if (!zxingReaderRef.current) {
        zxingReaderRef.current = new BrowserMultiFormatReader();
      }
      const reader = zxingReaderRef.current;
      reader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
        if (result && result.getText) {
          handleQRDetection(result.getText());
        }
        // ignore errors while scanning; keep looping
      });
      return true;
    } catch (e) {
      console.warn('ZXing init failed, falling back:', e);
      return false;
    }
  };

  const startScanning = () => {
    if (cameraState !== 'active') {
      console.log('❌ Camera not active, cannot start scanning');
      return;
    }
    
    setIsScanning(true);
    setMessage('🔍 SCANNING ACTIVE - Point camera at QR code');
    console.log('🎯 Starting accurate QR detection...');
    
    // Prefer ZXing first
    const zxingStarted = startZxing();
    if (!zxingStarted) {
      // Start our canvas/jsQR pipeline as a fallback
      scanForQR();
    }
  };

  const stopScanning = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    stopZxing();
    
    setIsScanning(false);
    setMessage('📱 Camera active - ready to scan');
  };

  const scanForQR = () => {
    const video = videoRef.current;
    
    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA || !isScanning) {
      if (isScanning && cameraState === 'active') {
        animationFrameRef.current = requestAnimationFrame(scanForQR);
      }
      return;
    }
    
    // Try native BarcodeDetector first (if supported)
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        // @ts-ignore
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        detector.detect(video).then((codes) => {
          if (codes && codes.length > 0 && codes[0].rawValue) {
            handleQRDetection(codes[0].rawValue);
            return;
          }
          // Fallback to jsQR if nothing detected
          continueWithCanvas();
        }).catch(() => continueWithCanvas());
        return;
      } catch (_) {
        // continue to canvas/jsQR
      }
    }
    
    const continueWithCanvas = () => {
      // Create canvas for processing
      let canvas = canvasRef.current;
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvasRef.current = canvas;
      }
      
      const context = canvas.getContext('2d', { willReadFrequently: true });
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Improve contrast by drawing a centered crop around the overlay box
      const cropSize = Math.min(canvas.width, canvas.height) * 0.7;
      const sx = (canvas.width - cropSize) / 2;
      const sy = (canvas.height - cropSize) / 2;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(sx, sy, cropSize, cropSize);
      
      
      // Try multiple detection methods
      const qrCode = detectQRWithMultipleMethods(imageData);
      
      if (qrCode && qrCode.data) {
        console.log('🎯 QR CODE DETECTED!', qrCode.data);
        handleQRDetection(qrCode.data);
        return;
      }
      
      // Continue scanning
      if (isScanning && cameraState === 'active') {
        animationFrameRef.current = requestAnimationFrame(scanForQR);
      }
    };

    // If we got here without BarcodeDetector hit, fallback to canvas/jsQR
    continueWithCanvas();
  };

  const handleQRDetection = (qrData) => {
    try {
      // Prevent duplicate scans within 1.2 seconds
      const now = Date.now();
      if (now - lastScanTime < 1200) {
        console.log('⏭️ Duplicate scan prevented');
        return;
      }
      setLastScanTime(now);
      
      console.log('🎯 QR CODE DETECTED!');
      console.log('📱 Raw QR data:', qrData);
      console.log('📏 QR data length:', qrData.length);
      console.log('📋 QR data type:', typeof qrData);
      
      // Stop scanning immediately
      stopScanning();
      setScanCount(prev => prev + 1);
      
      // Show immediate feedback
      setMessage(`🎉 QR Code detected! Processing data...`);
      
      let studentData;
      
      // Try different parsing methods
      try {
        // Method 1: Try JSON parsing
        studentData = JSON.parse(qrData);
        console.log('✅ Successfully parsed as JSON:', studentData);
        setMessage(`✅ JSON QR Code! Student: ${studentData.fullName || studentData.name || 'Unknown'}`);
      } catch (jsonError) {
        console.log('⚠️ Not JSON format, trying other methods...');
        
        // Method 2: Try URL parsing
        if (qrData.includes('studentId=')) {
          const urlParams = new URLSearchParams(qrData.split('?')[1]);
          studentData = {
            studentId: urlParams.get('studentId'),
            fullName: urlParams.get('name') || urlParams.get('fullName'),
            email: urlParams.get('email')
          };
          console.log('✅ Successfully parsed as URL:', studentData);
          setMessage(`✅ URL QR Code! Student: ${studentData.fullName || 'Unknown'}`);
        }
        // Method 3: Try student ID format
        else if (/^STU-\d+$/.test(qrData) || /^\d+$/.test(qrData)) {
          studentData = {
            studentId: qrData,
            fullName: 'Student',
            email: ''
          };
          console.log('✅ Successfully parsed as Student ID:', studentData);
          setMessage(`✅ Student ID QR Code! ID: ${qrData}`);
        }
        // Method 4: Generic text
        else {
          studentData = {
            studentId: qrData,
            fullName: 'Student',
            email: '',
            rawData: qrData
          };
          console.log('✅ Successfully parsed as generic text:', studentData);
          setMessage(`✅ Text QR Code! Data: ${qrData}`);
        }
      }
      
      // Call success callback
      if (onScanSuccess) {
        onScanSuccess(studentData);
      }
      
      // Reset after 3 seconds
      setTimeout(() => {
        setMessage('📱 Camera active! Point at QR code to scan');
        if (cameraState === 'active') {
          startScanning();
        }
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error processing QR code:', error);
      setMessage('❌ Error processing QR code');
      if (onScanError) {
        onScanError(error);
      }
      
      // Reset after 2 seconds
      setTimeout(() => {
        setMessage('📱 Camera active! Point at QR code to scan');
        if (cameraState === 'active') {
          startScanning();
        }
      }, 2000);
    }
  };

  // Manual single capture from current frame (helps على اللابتوب)
  const captureFrameOnce = () => {
    if (cameraState !== 'active') return;
    setIsScanning(true);
    setTimeout(() => scanForQR(), 50);
  };

  // Read QR from uploaded image (fallback)
  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      let canvas = canvasRef.current;
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvasRef.current = canvas;
      }
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qr = detectQRWithMultipleMethods(data);
      if (qr && qr.data) {
        handleQRDetection(qr.data);
      } else {
        setMessage('❌ لم يتم التعرف على الكود في الصورة. جرّب صورة أوضح/أقرب');
      }
    };
    img.onerror = () => setMessage('❌ تعذّر فتح الصورة');
    img.src = URL.createObjectURL(file);
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      background: '#f8fafc',
      borderRadius: '12px',
      border: '2px solid #e2e8f0'
    }}>
      <h2 style={{
        textAlign: 'center',
        marginBottom: '20px',
        color: '#2d3748',
        fontSize: '24px',
        fontWeight: '600'
      }}>
        🔍 Accurate QR Scanner
      </h2>
      
      {/* Camera Video */}
      <div style={{
        position: 'relative',
        background: '#000',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '16px',
        width: isMobile ? '100%' : '500px',
        height: isMobile ? '300px' : '400px',
        margin: '0 auto 16px auto',
        border: '3px solid #4299e1'
      }}>
        <video 
          ref={videoRef}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover' 
          }} 
          playsInline 
          muted
          onLoadedMetadata={() => {
            console.log('📹 Video loaded, auto-starting QR detection');
            if (cameraState === 'active' && !isScanning) {
              setTimeout(() => {
                startScanning();
              }, 500);
            }
          }}
        />
        
        {/* Scanning Overlay */}
        {isScanning && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '200px',
            height: '200px',
            border: '3px dashed #48bb78',
            borderRadius: '12px',
            background: 'rgba(72, 187, 120, 0.1)',
            animation: 'pulse 1.5s infinite'
          }}>
            {/* Corner brackets */}
            <div style={{
              position: 'absolute',
              top: '-3px',
              left: '-3px',
              width: '30px',
              height: '30px',
              borderTop: '6px solid #48bb78',
              borderLeft: '6px solid #48bb78'
            }}></div>
            <div style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '30px',
              height: '30px',
              borderTop: '6px solid #48bb78',
              borderRight: '6px solid #48bb78'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '-3px',
              left: '-3px',
              width: '30px',
              height: '30px',
              borderBottom: '6px solid #48bb78',
              borderLeft: '6px solid #48bb78'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '-3px',
              right: '-3px',
              width: '30px',
              height: '30px',
              borderBottom: '6px solid #48bb78',
              borderRight: '6px solid #48bb78'
            }}></div>
            
            {/* Scanning message */}
            <div style={{
              position: 'absolute',
              top: '-50px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#48bb78',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}>
              🔍 SCANNING ACTIVE
            </div>
          </div>
        )}
        
        {/* Camera Status Indicator */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: cameraState === 'active' ? '#48bb78' : '#e53e3e',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '16px',
          fontSize: '12px',
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
              transition: 'all 0.3s'
            }}
          >
            📷 Start Camera
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
            🛑 Stop Camera
          </button>
        )}
        
        {cameraState === 'active' && (
          <button
            onClick={isScanning ? stopScanning : startScanning}
            style={{
              padding: isMobile ? '14px' : '16px',
              background: isScanning ? '#e53e3e' : '#48bb78',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            {isScanning ? '⏹️ Stop Scan' : '🔍 Start Scan'}
          </button>
        )}
      </div>

      {/* Upload image fallback */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <label style={{
          display: 'inline-block',
          background: '#7c3aed',
          color: 'white',
          padding: '10px 14px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 600
        }}>
          🖼️ Upload QR Image
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
        </label>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AccurateQRScanner;
