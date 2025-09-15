'use client';

import React, { useState, useEffect } from 'react';
import { QrScanner } from 'qr-scanner';

export default function DebugCameraPage() {
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState([]);
  const videoRef = React.useRef(null);
  const scannerRef = React.useRef(null);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const getCameras = async () => {
    try {
      addLog('Getting cameras...');
      const cameraList = await QrScanner.listCameras(true);
      addLog(`Found ${cameraList.length} cameras`);
      setCameras(cameraList);
      
      if (cameraList.length > 0) {
        const backCamera = cameraList.find(cam => cam.label.toLowerCase().includes('back'));
        const environmentCamera = cameraList.find(cam => cam.label.toLowerCase().includes('environment'));
        const bestCamera = backCamera || environmentCamera || cameraList[0];
        setSelectedCamera(bestCamera.id);
        addLog(`Auto-selected camera: ${bestCamera.label}`);
      }
    } catch (err) {
      addLog(`Error getting cameras: ${err.message}`);
      setError(`Failed to access cameras: ${err.message}`);
    }
  };

  const startCamera = async () => {
    if (!videoRef.current) {
      addLog('ERROR: Video element not found');
      setError('Video element not found');
      return;
    }

    if (isScanning) {
      addLog('Already scanning, stopping...');
      stopCamera();
      return;
    }

    try {
      addLog('Starting camera...');
      setError('');
      setIsScanning(true);

      // Wait for video element
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create scanner
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          addLog(`QR Code detected: ${result.data}`);
        },
        {
          preferredCamera: selectedCamera || 'environment',
          maxScansPerSecond: 2,
          highlightScanRegion: false,
          highlightCodeOutline: false,
          onDecodeError: (err) => {
            if (err.name !== 'NotFoundException') {
              addLog(`Decode error: ${err.message}`);
            }
          }
        }
      );

      addLog('Scanner created, starting...');
      await scannerRef.current.start();
      addLog('Camera started successfully!');
      
      if (videoRef.current) {
        videoRef.current.style.opacity = '1';
      }

    } catch (err) {
      addLog(`ERROR: ${err.message}`);
      setError(`Camera failed: ${err.message}`);
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
      addLog('Camera stopped');
    }
    setIsScanning(false);
  };

  const testPermissions = async () => {
    try {
      addLog('Testing camera permissions...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      addLog('Camera permissions granted!');
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      addLog(`Permission error: ${err.message}`);
      setError(`Camera permission denied: ${err.message}`);
    }
  };

  useEffect(() => {
    getCameras();
    testPermissions();
    
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔧 Camera Debug Tool</h1>
      
      {/* Camera Info */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3>Camera Information</h3>
        <p><strong>Cameras Found:</strong> {cameras.length}</p>
        <p><strong>Selected Camera:</strong> {selectedCamera || 'None'}</p>
        <p><strong>Status:</strong> {isScanning ? 'Scanning' : 'Stopped'}</p>
        {error && <p style={{ color: 'red' }}><strong>Error:</strong> {error}</p>}
      </div>

      {/* Controls */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={getCameras}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh Cameras
        </button>
        
        <button 
          onClick={testPermissions}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔐 Test Permissions
        </button>
        
        <button 
          onClick={startCamera}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: isScanning ? '#dc3545' : '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {isScanning ? '⏹️ Stop Camera' : '▶️ Start Camera'}
        </button>
      </div>

      {/* Camera Selector */}
      {cameras.length > 1 && (
        <div style={{ marginBottom: '20px' }}>
          <label><strong>Select Camera:</strong></label>
          <select 
            value={selectedCamera} 
            onChange={(e) => setSelectedCamera(e.target.value)}
            style={{ 
              marginLeft: '10px', 
              padding: '5px 10px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          >
            {cameras.map(camera => (
              <option key={camera.id} value={camera.id}>
                {camera.label}
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
        marginBottom: '20px'
      }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isScanning ? '1' : '0.3'
          }}
          playsInline
          muted
        />
        
        {!isScanning && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <p>Camera Preview</p>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>
              Click "Start Camera" to begin
            </p>
          </div>
        )}
      </div>

      {/* Logs */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        <h3>Debug Logs</h3>
        <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
          {logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '2px' }}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
