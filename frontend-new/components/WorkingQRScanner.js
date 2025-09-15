'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import jsQR from 'jsqr';

export default function WorkingQRScanner({ onScan, onError, style, className }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const [isManualScanning, setIsManualScanning] = useState(false);

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
        console.log('Selected camera:', backCamera ? backCamera.label : videoDevices[0].label);
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

      // Get camera stream with fallback constraints
      let constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        }
      };

      // Add device ID if camera is selected
      if (selectedCamera) {
        constraints.video.deviceId = { exact: selectedCamera };
      }

      console.log('Requesting camera with constraints:', constraints);
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        console.log('Camera stream obtained successfully');
      } catch (deviceError) {
        console.log('Failed with device ID, trying without...', deviceError);
        // Fallback without device ID
        constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'environment'
          }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        console.log('Camera stream obtained with fallback');
      }
      
      // Set video source
      videoRef.current.srcObject = streamRef.current;
      
      // Wait for video to load
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video load timeout'));
        }, 5000);

        videoRef.current.onloadedmetadata = () => {
          clearTimeout(timeout);
          videoRef.current.play().then(() => {
            console.log('Video started playing');
            resolve();
          }).catch(reject);
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

  // Real QR detection using jsQR library
  const detectQR = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Check if video is ready
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for QR detection
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Use jsQR to detect QR codes
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    // If QR code is detected, process it
    if (code && !isManualScanning) {
      console.log('Real QR Code detected:', code.data);
      setIsManualScanning(true); // Prevent multiple detections
      setScanCount(prev => prev + 1);
      
      if (onScan) {
        onScan(code.data);
      }
      
      // Reset after a delay to allow for new scans
      setTimeout(() => {
        setIsManualScanning(false);
      }, 2000);
    }
    
  }, [isScanning, onScan, isManualScanning]);


  // Manual scan trigger
  const triggerManualScan = useCallback(() => {
    if (isScanning && !isManualScanning) {
      setIsManualScanning(true);
      console.log('Manual scan triggered');
      
      // Trigger immediate QR detection
      setTimeout(() => {
        detectQR();
      }, 100);
    }
  }, [isScanning, isManualScanning, detectQR]);

  // Start detection loop
  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(detectQR, 500); // Check every 500ms
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
    <div className={`working-qr-scanner ${className}`} style={style}>
      {/* Camera Selector */}
      {cameras.length > 1 && (
        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Camera:</label>
          <select 
            value={selectedCamera} 
            onChange={(e) => setSelectedCamera(e.target.value)}
            style={{ 
              padding: '8px 12px', 
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '14px'
            }}
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
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '15px',
        border: '2px solid #e5e7eb'
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
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
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
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                transition: 'all 0.3s ease'
              }}
              onClick={startCamera}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                e.target.style.transform = 'scale(1)';
              }}
              >
                <span style={{ fontSize: '32px' }}>📷</span>
              </div>
              <p style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 'bold' }}>Working QR Scanner</p>
              <p style={{ margin: '0 0 20px 0', fontSize: '14px', opacity: 0.8 }}>
                Click to start camera
              </p>
              <button
                onClick={startCamera}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#059669';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#10b981';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                🚀 Start Camera
              </button>
            </div>
          </div>
        )}

        {/* Scanning Overlay */}
        {isScanning && (
          <>
            {/* Scan Frame */}
            <div style={{
              position: 'absolute',
              top: '15%',
              left: '15%',
              right: '15%',
              bottom: '15%',
              border: '3px solid #10b981',
              borderRadius: '12px',
              pointerEvents: 'none',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
            }}>
              {/* Corner indicators */}
              <div style={{
                position: 'absolute',
                top: '-3px',
                left: '-3px',
                width: '20px',
                height: '20px',
                borderTop: '4px solid #10b981',
                borderLeft: '4px solid #10b981',
                borderRadius: '4px 0 0 0'
              }} />
              <div style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '20px',
                height: '20px',
                borderTop: '4px solid #10b981',
                borderRight: '4px solid #10b981',
                borderRadius: '0 4px 0 0'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-3px',
                left: '-3px',
                width: '20px',
                height: '20px',
                borderBottom: '4px solid #10b981',
                borderLeft: '4px solid #10b981',
                borderRadius: '0 0 0 4px'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-3px',
                right: '-3px',
                width: '20px',
                height: '20px',
                borderBottom: '4px solid #10b981',
                borderRight: '4px solid #10b981',
                borderRadius: '0 0 4px 0'
              }} />
            </div>

            {/* Status */}
            <div style={{
              position: 'absolute',
              top: '15px',
              left: '15px',
              backgroundColor: isManualScanning ? '#dc3545' : '#10b981',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {isManualScanning ? 'SCANNING...' : 'READY TO SCAN'}
            </div>

            {/* Manual Scan Button */}
            <div style={{
              position: 'absolute',
              top: '15px',
              right: '15px'
            }}>
              <button
                onClick={triggerManualScan}
                disabled={isManualScanning}
                style={{
                  backgroundColor: isManualScanning ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: isManualScanning ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  if (!isManualScanning) {
                    e.target.style.backgroundColor = '#0056b3';
                    e.target.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isManualScanning) {
                    e.target.style.backgroundColor = '#007bff';
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              >
                {isManualScanning ? 'SCANNING...' : '📷 SCAN QR'}
              </button>
            </div>

            {/* Scan Count */}
            <div style={{
              position: 'absolute',
              bottom: '15px',
              right: '15px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px'
            }}>
              Scans: {scanCount}
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button
          onClick={isScanning ? stopCamera : startCamera}
          style={{
            padding: '10px 20px',
            backgroundColor: isScanning ? '#dc3545' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
          }}
        >
          {isScanning ? '⏹️ Stop Camera' : '▶️ Start Camera'}
        </button>
        
        <button
          onClick={getCameras}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
          }}
        >
          🔄 Refresh Cameras
        </button>
      </div>

      {/* Status Info */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px',
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
          <div>
            <strong>Status:</strong> {isScanning ? (isManualScanning ? '🟡 Scanning...' : '🟢 Ready to Scan') : '🔴 Stopped'}
          </div>
          <div>
            <strong>Cameras:</strong> {cameras.length} found
          </div>
          <div>
            <strong>Scans:</strong> {scanCount} detected
          </div>
          <div>
            <strong>Selected:</strong> {selectedCamera ? 'Camera ' + selectedCamera.slice(0, 8) : 'Auto'}
          </div>
        </div>
        
        {/* Instructions */}
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#e7f3ff', 
          borderRadius: '4px',
          border: '1px solid #b3d9ff'
        }}>
          <strong>📋 Instructions:</strong>
          <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>Start camera and position QR code in frame</li>
            <li>Real QR codes will be detected automatically</li>
            <li>Ensure good lighting and clear QR code</li>
            <li>Or click "📷 SCAN QR" button for manual scan</li>
            <li>Wait for detection and student data to load</li>
          </ol>
        </div>
        
        {error && (
          <div style={{ 
            marginTop: '10px', 
            padding: '10px', 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            borderRadius: '4px',
            border: '1px solid #f5c6cb'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Hidden canvas for QR detection */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
