'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

export default function SimpleQRScanner({ onScan, onError, style, className }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');

  // Get available cameras
  const getCameras = useCallback(async () => {
    try {
      console.log('Getting cameras...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log('Found cameras:', videoDevices);
      setCameras(videoDevices);
      
      if (videoDevices.length > 0 && !selectedCamera) {
        // Prefer back camera
        const backCamera = videoDevices.find(cam => 
          cam.label.toLowerCase().includes('back') || 
          cam.label.toLowerCase().includes('environment')
        );
        setSelectedCamera(backCamera ? backCamera.deviceId : videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Error getting cameras:', err);
      setError('Failed to get cameras: ' + err.message);
    }
  }, [selectedCamera]);

  // Start camera
  const startCamera = useCallback(async () => {
    if (!videoRef.current) {
      setError('Video element not found');
      return;
    }

    try {
      console.log('Starting camera...');
      setError('');
      
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Get camera stream
      const constraints = {
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        }
      };

      console.log('Requesting camera with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      // Set video source
      videoRef.current.srcObject = stream;
      
      // Wait for video to load
      await new Promise((resolve) => {
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          resolve();
        };
      });

      setIsScanning(true);
      console.log('Camera started successfully');
      
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera failed: ' + err.message);
      setIsScanning(false);
      if (onError) {
        onError(err);
      }
    }
  }, [selectedCamera, onError]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    console.log('Camera stopped');
  }, []);

  // Simple QR detection using canvas
  const detectQR = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simple QR detection (this is a placeholder - you'd need a proper QR library)
    // For now, we'll just simulate detection
    setTimeout(() => {
      if (isScanning) {
        // Simulate QR detection
        const mockQRData = 'STUDENT_12345_John_Doe_2024';
        console.log('Simulated QR detected:', mockQRData);
        if (onScan) {
          onScan(mockQRData);
        }
      }
    }, 2000);

  }, [isScanning, onScan]);

  // Start detection loop
  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(detectQR, 1000);
      return () => clearInterval(interval);
    }
  }, [isScanning, detectQR]);

  // Initialize cameras on mount
  useEffect(() => {
    getCameras();
    return () => {
      stopCamera();
    };
  }, [getCameras, stopCamera]);

  return (
    <div className={`simple-qr-scanner ${className}`} style={style}>
      {/* Camera Selector */}
      {cameras.length > 1 && (
        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '10px' }}>Camera:</label>
          <select 
            value={selectedCamera} 
            onChange={(e) => setSelectedCamera(e.target.value)}
            style={{ padding: '5px', borderRadius: '4px' }}
          >
            {cameras.map(camera => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Video Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '400px',
        backgroundColor: '#000',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '10px'
      }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: isScanning ? 'block' : 'none'
          }}
          playsInline
          muted
        />
        
        {/* Start Button */}
        {!isScanning && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                border: '4px solid #10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                cursor: 'pointer',
                backgroundColor: 'rgba(16, 185, 129, 0.1)'
              }}
              onClick={startCamera}
              >
                <span style={{ fontSize: '32px' }}>📷</span>
              </div>
              <p style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Simple QR Scanner</p>
              <button
                onClick={startCamera}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                🚀 Start Camera
              </button>
            </div>
          </div>
        )}

        {/* Scanning Overlay */}
        {isScanning && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            bottom: '20px',
            border: '3px solid #10b981',
            borderRadius: '12px',
            pointerEvents: 'none'
          }}>
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              backgroundColor: '#10b981',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              SCANNING
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button
          onClick={isScanning ? stopCamera : startCamera}
          style={{
            padding: '10px 20px',
            backgroundColor: isScanning ? '#dc3545' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isScanning ? '⏹️ Stop' : '▶️ Start'}
        </button>
        
        <button
          onClick={getCameras}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Status */}
      <div style={{ fontSize: '14px', color: '#666' }}>
        <p>Status: {isScanning ? 'Scanning' : 'Stopped'}</p>
        <p>Cameras: {cameras.length}</p>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      </div>

      {/* Hidden canvas for QR detection */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
