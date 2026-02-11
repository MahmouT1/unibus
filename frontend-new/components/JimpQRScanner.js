'use client';

import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';

const JimpQRScanner = ({ onScanSuccess, onScanError, supervisorId, supervisorName }) => {
  const [cameraState, setCameraState] = useState('stopped');
  const [message, setMessage] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                           window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Get available cameras
    getCameras();
    
    return () => {
      stopCamera();
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);
      
      if (videoDevices.length > 0 && !selectedCamera) {
        // Try to find back camera first, otherwise use first available
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );
        setSelectedCamera(backCamera ? backCamera.deviceId : videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Error getting cameras:', error);
    }
  };

  const startCamera = async () => {
    try {
      setCameraState('starting');
      setMessage('🔄 Starting camera...');

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: isMobile ? 'environment' : 'user'
        }
      };

      // Use selected camera if available
      if (selectedCamera) {
        constraints.video.deviceId = { exact: selectedCamera };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().then(resolve);
          };
        });

        setCameraState('active');
        setMessage('✅ Camera started successfully! Point camera at QR code.');
        
        // Start automatic scanning
        startAutomaticScanning();
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      setCameraState('error');
      setMessage(`❌ Camera error: ${error.message}`);
      
      if (onScanError) {
        onScanError(`Camera error: ${error.message}`);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    
    setCameraState('stopped');
    setIsScanning(false);
    setMessage('📷 Camera stopped');
  };

  const startAutomaticScanning = () => {
    if (isScanning) return;
    
    setIsScanning(true);
    
    const scanInterval = setInterval(() => {
      if (cameraState !== 'active' || !videoRef.current) {
        clearInterval(scanInterval);
        setIsScanning(false);
        return;
      }
      
      detectQRCode();
    }, 500); // Scan every 500ms
    
    // Store interval reference for cleanup
    scanTimeoutRef.current = scanInterval;
  };

  const detectQRCode = () => {
    if (!videoRef.current || !canvasRef.current || cameraState !== 'active') {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for QR detection
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Use jsQR to detect QR codes
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code) {
      console.log('🎯 QR Code detected:', code.data);
      handleQRScan(code.data);
    }
  };

  const handleQRScan = async (qrData) => {
    try {
      setMessage('🔄 Processing QR code...');
      
      let studentData = null;

      // Try to parse as JSON first
      try {
        studentData = JSON.parse(qrData);
        console.log('📋 Parsed JSON student data:', studentData);
      } catch (e) {
        // If not JSON, try URL parsing
        if (qrData.includes('?')) {
          const url = new URL(qrData);
          studentData = {
            studentId: url.searchParams.get('studentId'),
            fullName: url.searchParams.get('name') || url.searchParams.get('fullName'),
            email: url.searchParams.get('email'),
            college: url.searchParams.get('college'),
            major: url.searchParams.get('major'),
            grade: url.searchParams.get('grade')
          };
          console.log('🔗 Parsed URL student data:', studentData);
        } else {
          // Treat as simple student ID
          studentData = {
            studentId: qrData,
            fullName: 'Unknown Student',
            email: 'unknown@student.edu',
            college: 'Unknown',
            major: 'Unknown',
            grade: 'Unknown'
          };
          console.log('🆔 Simple ID student data:', studentData);
        }
      }

      // Validate required fields
      if (!studentData.studentId) {
        throw new Error('Invalid QR code: Student ID not found');
      }

      setScanCount(prev => prev + 1);
      setMessage('✅ QR code scanned successfully!');
      
      // Call success callback
      if (onScanSuccess) {
        await onScanSuccess(studentData);
      }

      // Continue scanning after a short delay
      setTimeout(() => {
        if (cameraState === 'active') {
          setMessage('📸 Ready to scan next QR code...');
        }
      }, 2000);

    } catch (error) {
      console.error('❌ QR scan error:', error);
      setMessage(`❌ Scan error: ${error.message}`);
      
      if (onScanError) {
        onScanError(error.message);
      }
      
      // Reset message after error
      setTimeout(() => {
        if (cameraState === 'active') {
          setMessage('📸 Ready to scan QR code...');
        }
      }, 3000);
    }
  };

  const manualScan = () => {
    if (cameraState !== 'active') {
      setMessage('❌ Please start the camera first');
      return;
    }
    
    setMessage('🔍 Manual scan initiated...');
    detectQRCode();
  };

  const switchCamera = async () => {
    if (cameras.length <= 1) {
      setMessage('⚠️ Only one camera available');
      return;
    }
    
    const currentIndex = cameras.findIndex(cam => cam.deviceId === selectedCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setSelectedCamera(cameras[nextIndex].deviceId);
    
    if (cameraState === 'active') {
      await startCamera();
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
      padding: '24px',
      color: 'white',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
            📱 Professional QR Scanner
          </h2>
          <p style={{ margin: '0', opacity: '0.9', fontSize: '16px' }}>
            Advanced QR code detection with real-time processing
          </p>
        </div>

        {/* Video Container */}
        <div style={{
          position: 'relative',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '20px',
          minHeight: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {cameraState === 'active' ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  borderRadius: '12px'
                }}
              />
              
              {/* Scanning overlay */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '200px',
                height: '200px',
                border: '3px solid #00ff88',
                borderRadius: '12px',
                animation: isScanning ? 'pulse 2s infinite' : 'none',
                pointerEvents: 'none'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0, 255, 136, 0.9)',
                  color: 'black',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  QR Scan Zone
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📷</div>
              <p style={{ margin: '0', fontSize: '18px', opacity: '0.8' }}>
                {cameraState === 'starting' ? 'Starting camera...' : 'Camera not active'}
              </p>
            </div>
          )}
        </div>

        {/* Hidden canvas for QR detection */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Status Message */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <p style={{ margin: '0', fontSize: '16px', fontWeight: '500' }}>
            {message || '📸 Ready to scan QR codes'}
          </p>
        </div>

        {/* Control Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {cameraState !== 'active' ? (
            <button
              onClick={startCamera}
              disabled={cameraState === 'starting'}
              style={{
                padding: '12px 24px',
                background: cameraState === 'starting' 
                  ? 'rgba(255, 255, 255, 0.3)' 
                  : 'linear-gradient(135deg, #00ff88, #00cc6a)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: cameraState === 'starting' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📹 {cameraState === 'starting' ? 'Starting...' : 'Start Camera'}
            </button>
          ) : (
            <>
              <button
                onClick={stopCamera}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #ff4757, #c44569)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ⏹️ Stop Camera
              </button>
              
              <button
                onClick={manualScan}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #ffa502, #ff6348)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🔍 Manual Scan
              </button>
              
              {cameras.length > 1 && (
                <button
                  onClick={switchCamera}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #3742fa, #2f3542)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  🔄 Switch Camera
                </button>
              )}
            </>
          )}
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{scanCount}</div>
            <div style={{ fontSize: '12px', opacity: '0.8' }}>Scans Today</div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{cameras.length}</div>
            <div style={{ fontSize: '12px', opacity: '0.8' }}>Cameras</div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {cameraState === 'active' ? '🟢' : '🔴'}
            </div>
            <div style={{ fontSize: '12px', opacity: '0.8' }}>Status</div>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>📋 How to Use:</h4>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
            <li>Click "Start Camera" to begin</li>
            <li>Point camera at QR code within the green frame</li>
            <li>Scanner automatically detects QR codes</li>
            <li>Use "Manual Scan" if automatic detection fails</li>
            <li>Switch cameras if multiple are available</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(0, 255, 136, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
        }
      `}</style>
    </div>
  );
};

export default JimpQRScanner;
