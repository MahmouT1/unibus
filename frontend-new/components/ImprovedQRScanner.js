'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import QrScanner from 'qr-scanner';
import './ImprovedQRScanner.css';

const ImprovedQRScanner = ({ 
  onScan, 
  onError, 
  onCameraList, 
  className = '',
  style = {},
  showCameraSelector = true,
  showScanRegion = true,
  enableTorch = true,
  preferredCamera = 'environment'
}) => {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(preferredCamera);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Debounce scan results to prevent multiple rapid scans
  const debouncedScan = useCallback((result) => {
    console.log('QR Code detected:', result);
    const now = Date.now();
    if (now - lastScanTime < 1000) { // Prevent scans within 1 second
      console.log('Scan too soon, ignoring...');
      return;
    }
    setLastScanTime(now);
    setScanCount(prev => prev + 1);
    setIsProcessing(true);
    
    // Stop scanning temporarily to prevent multiple scans
    if (scannerRef.current) {
      scannerRef.current.stop();
    }
    
    // Call the onScan callback
    if (onScan) {
      onScan(result);
    }
    
    // Resume scanning after a short delay
    setTimeout(() => {
      setIsProcessing(false);
      if (scannerRef.current && isScanning) {
        scannerRef.current.start();
      }
    }, 1500);
  }, [onScan, lastScanTime, isScanning]);

  // Get available cameras
  const getCameras = useCallback(async () => {
    try {
      console.log('Getting available cameras...');
      const cameraList = await QrScanner.listCameras(true);
      console.log('Available cameras:', cameraList);
      setCameras(cameraList);
      
      if (onCameraList) {
        onCameraList(cameraList);
      }
      
      // Auto-select best camera if none selected
      if (!selectedCamera && cameraList.length > 0) {
        const backCamera = cameraList.find(cam => cam.label.toLowerCase().includes('back'));
        const environmentCamera = cameraList.find(cam => cam.label.toLowerCase().includes('environment'));
        const bestCamera = backCamera || environmentCamera || cameraList[0];
        setSelectedCamera(bestCamera.id);
        console.log('Auto-selected camera:', bestCamera.label);
      } else if (cameraList.length === 0) {
        console.warn('No cameras found');
        setError('No cameras detected. Please ensure your device has a camera.');
      }
    } catch (err) {
      console.error('Error getting cameras:', err);
      setError(`Failed to access cameras: ${err.message}. Please check camera permissions.`);
    }
  }, [selectedCamera, onCameraList]);

  // Start scanning with professional settings
  const startScanning = useCallback(async () => {
    console.log('startScanning called with:', { 
      hasVideo: !!videoRef.current, 
      isScanning, 
      selectedCamera,
      cameras: cameras.length 
    });

    if (!videoRef.current) {
      console.error('Video element not found');
      setError('Video element not found. Please refresh the page.');
      return;
    }

    if (isScanning) {
      console.log('Already scanning, ignoring start request');
      return;
    }

    try {
      console.log('Starting professional QR scanner...');
      setError('');
      setIsScanning(true);
      
      // Wait for video element to be ready
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Check if video element is still available
      if (!videoRef.current) {
        throw new Error('Video element became unavailable');
      }

      console.log('Creating QrScanner instance...');
      
      // Create scanner with professional, stable settings
      scannerRef.current = new QrScanner(
        videoRef.current,
        debouncedScan,
        {
          // Professional settings for stability
          preferredCamera: selectedCamera || 'environment',
          maxScansPerSecond: 3, // Lower rate for stability
          highlightScanRegion: false,
          highlightCodeOutline: false,
          
          // Stable detection settings
          calculateScanRegion: (video) => {
            // Use 70% of the video area for stable scanning
            const scanWidth = Math.floor(video.videoWidth * 0.7);
            const scanHeight = Math.floor(video.videoHeight * 0.7);
            const x = Math.floor((video.videoWidth - scanWidth) / 2);
            const y = Math.floor((video.videoHeight - scanHeight) / 2);
            console.log('Stable scan region:', { x, y, width: scanWidth, height: scanHeight });
            return {
              x,
              y,
              width: scanWidth,
              height: scanHeight
            };
          },
          
          // Professional error handling
          onDecodeError: (err) => {
            // Suppress normal decode errors to reduce console noise
            if (err.name !== 'NotFoundException' && err.name !== 'ChecksumException') {
              console.log('QR decode error:', err);
            }
          },
          
          // Return detailed scan result
          returnDetailedScanResult: true
        }
      );

      console.log('QrScanner instance created, starting camera...');
      
      // Try to start the camera with fallback
      try {
        await scannerRef.current.start();
        console.log('Camera started successfully');
      } catch (startError) {
        console.error('Failed to start with preferred camera, trying fallback...', startError);
        
        // Try with different camera settings
        if (scannerRef.current) {
          scannerRef.current.destroy();
        }
        
        // Create new scanner with fallback settings
        scannerRef.current = new QrScanner(
          videoRef.current,
          debouncedScan,
          {
            preferredCamera: 'environment', // Force environment camera
            maxScansPerSecond: 2,
            highlightScanRegion: false,
            highlightCodeOutline: false,
            returnDetailedScanResult: true
          }
        );
        
        await scannerRef.current.start();
        console.log('Camera started with fallback settings');
      }
      
      // Ensure video is visible
      if (videoRef.current) {
        videoRef.current.style.opacity = '1';
        console.log('Video opacity set to 1');
      }
      
    } catch (err) {
      console.error('Error starting QR scanner:', err);
      setError(`Camera failed to start: ${err.message}. Please check camera permissions and try again.`);
      setIsScanning(false);
      if (onError) {
        onError(err);
      }
    }
  }, [selectedCamera, showScanRegion, debouncedScan, onError, isScanning, cameras.length]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
    setIsProcessing(false);
  }, []);

  // Toggle torch
  const toggleTorch = useCallback(async () => {
    if (scannerRef.current && enableTorch) {
      try {
        await scannerRef.current.toggleTorch();
        setTorchEnabled(!torchEnabled);
      } catch (err) {
        console.log('Torch not available:', err);
      }
    }
  }, [torchEnabled, enableTorch]);

  // Handle camera change
  const handleCameraChange = useCallback(async (cameraId) => {
    setSelectedCamera(cameraId);
    if (isScanning) {
      stopScanning();
      setTimeout(() => {
        startScanning();
      }, 100);
    }
  }, [isScanning, stopScanning, startScanning]);

  // Initialize cameras on mount
  useEffect(() => {
    getCameras();
    
    return () => {
      stopScanning();
    };
  }, [getCameras, stopScanning]);

  // Manual start button for better control
  const handleManualStart = async () => {
    console.log('Manual start button clicked');
    if (!isScanning) {
      console.log('Starting scanning process...');
      setError(''); // Clear any previous errors
      await startScanning();
    } else {
      console.log('Already scanning, stopping...');
      stopScanning();
    }
  };

  return (
    <div className={`qr-scanner-container ${className}`} style={style}>
      {/* Camera Selector */}
      {showCameraSelector && cameras.length > 1 && (
        <div className="camera-selector" style={{
          marginBottom: '10px',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <label style={{ fontWeight: '600', color: '#374151' }}>Camera:</label>
          <select
            value={selectedCamera}
            onChange={(e) => handleCameraChange(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              fontSize: '14px'
            }}
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Video Container - Professional & Stable */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100vw',
        height: '60vh',
        minHeight: '400px',
        margin: '0 auto',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#000',
        border: '2px solid #e5e7eb'
      }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            backgroundColor: '#000',
            opacity: isScanning ? '1' : '0.3',
            transition: 'opacity 0.3s ease',
            transform: 'translateZ(0)', // Hardware acceleration
            willChange: 'transform' // Optimize for animations
          }}
          playsInline
          muted
          autoPlay
        />
        
        {/* Professional Start Button */}
        {!isScanning && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            fontWeight: '600'
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
                transition: 'all 0.3s ease',
                backgroundColor: 'rgba(16, 185, 129, 0.1)'
              }}
              onClick={handleManualStart}
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
              <p style={{ margin: '0 0 10px 0', fontSize: '20px' }}>Professional QR Scanner</p>
              <p style={{ margin: '0 0 20px 0', fontSize: '16px', opacity: 0.8 }}>
                Click to start camera
              </p>
              <button
                onClick={handleManualStart}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  marginBottom: '10px'
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
                🚀 Start Scanning
              </button>
              
              {/* Debug Info */}
              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
                marginTop: '10px',
                textAlign: 'center'
              }}>
                <p style={{ margin: '2px 0' }}>Cameras: {cameras.length}</p>
                <p style={{ margin: '2px 0' }}>Selected: {selectedCamera || 'None'}</p>
                <p style={{ margin: '2px 0' }}>Status: {isScanning ? 'Scanning' : 'Ready'}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Professional Scan Region Overlay */}
        {showScanRegion && isScanning && (
          <div style={{
            position: 'absolute',
            top: '15%',
            left: '15%',
            right: '15%',
            bottom: '15%',
            border: '4px solid #10b981',
            borderRadius: '16px',
            pointerEvents: 'none',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.6)',
            background: 'rgba(16, 185, 129, 0.05)',
            backdropFilter: 'blur(1px)'
          }}>
            {/* Professional corner indicators */}
            <div style={{
              position: 'absolute',
              top: '-4px',
              left: '-4px',
              width: '30px',
              height: '30px',
              borderTop: '6px solid #10b981',
              borderLeft: '6px solid #10b981',
              borderRadius: '8px 0 0 0',
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)'
            }} />
            <div style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '30px',
              height: '30px',
              borderTop: '6px solid #10b981',
              borderRight: '6px solid #10b981',
              borderRadius: '0 8px 0 0',
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-4px',
              left: '-4px',
              width: '30px',
              height: '30px',
              borderBottom: '6px solid #10b981',
              borderLeft: '6px solid #10b981',
              borderRadius: '0 0 0 8px',
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              width: '30px',
              height: '30px',
              borderBottom: '6px solid #10b981',
              borderRight: '6px solid #10b981',
              borderRadius: '0 0 8px 0',
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)'
            }} />
            
            {/* Center crosshair */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '40px',
              height: '40px',
              border: '2px solid rgba(16, 185, 129, 0.6)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #10b981',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.1)'
              }} />
            </div>
          </div>
        )}

        {/* Processing Overlay */}
        {isProcessing && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid #3b82f6',
                borderTop: '4px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 10px'
              }} />
              Processing...
            </div>
          </div>
        )}

        {/* Professional Status Overlay */}
        {isScanning && (
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            right: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: 'white',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }} />
              SCANNING
            </div>
            
            {enableTorch && (
              <button
                onClick={toggleTorch}
                style={{
                  backgroundColor: torchEnabled ? '#f59e0b' : 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                {torchEnabled ? '🔦' : '💡'}
              </button>
            )}
          </div>
        )}

        {/* Professional Scan Count */}
        {isScanning && (
          <div style={{
            position: 'absolute',
            bottom: '15px',
            right: '15px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
          }}>
            <span style={{ fontSize: '16px' }}>📊</span>
            Scans: {scanCount}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#991b1b',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Professional Instructions */}
      <div style={{
        marginTop: '20px',
        textAlign: 'center',
        color: '#374151',
        fontSize: '16px',
        padding: '20px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '20px' }}>
          🎯 Professional Scanning Guide
        </h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px',
          textAlign: 'left',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 5px 0', fontWeight: '600', color: '#10b981' }}>📱 Device Setup</p>
            <p style={{ margin: '0' }}>Hold device steady and level</p>
          </div>
          <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 5px 0', fontWeight: '600', color: '#10b981' }}>🎯 Positioning</p>
            <p style={{ margin: '0' }}>Align QR code within green frame</p>
          </div>
          <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 5px 0', fontWeight: '600', color: '#10b981' }}>💡 Lighting</p>
            <p style={{ margin: '0' }}>Ensure adequate lighting conditions</p>
          </div>
          <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 5px 0', fontWeight: '600', color: '#10b981' }}>⏱️ Timing</p>
            <p style={{ margin: '0' }}>Wait for automatic detection</p>
          </div>
        </div>
        <p style={{ 
          margin: '15px 0 0 0', 
          fontSize: '14px', 
          color: '#6b7280',
          fontStyle: 'italic'
        }}>
          The professional scanner will automatically detect and process QR codes with high accuracy
        </p>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ImprovedQRScanner;
