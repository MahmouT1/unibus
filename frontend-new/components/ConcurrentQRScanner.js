'use client';

import React, { useState, useRef, useEffect } from 'react';
import scanningManager from '@/lib/concurrent-scanning';

const ConcurrentQRScanner = ({ 
  onScanSuccess, 
  onScanError, 
  supervisorId, 
  supervisorName,
  appointmentSlot = 'first',
  stationInfo = {
    name: 'Main Gate',
    location: 'University Entrance',
    coordinates: '30.0444,31.2357'
  }
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [error, setError] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    // Fetch system status periodically
    const statusInterval = setInterval(fetchSystemStatus, 5000);
    fetchSystemStatus();

    return () => {
      clearInterval(statusInterval);
      stopScanning();
    };
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/attendance/system-status');
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data.status);
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const startScanning = async () => {
    try {
      setError('');
      
      // Check system health before starting
      if (systemStatus && !systemStatus.isHealthy) {
        setError('System is currently busy. Please try again in a moment.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        
        // Start QR detection
        startQRDetection();
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      setError('Failed to access camera. Please check permissions.');
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    setIsScanning(false);
  };

  const startQRDetection = () => {
    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        detectQRCode();
      }
    }, 100); // Check every 100ms for responsiveness
  };

  const detectQRCode = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Use jsQR library for detection
      if (window.jsQR) {
        const code = window.jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          handleQRCodeDetected(code.data);
        }
      }
    }
  };

  const handleQRCodeDetected = async (qrData) => {
    if (isProcessing) {
      return; // Prevent multiple simultaneous processing
    }

    setIsProcessing(true);
    setError('');

    try {
      // Parse QR data
      let studentData;
      try {
        studentData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
      } catch (error) {
        setError('Invalid QR code format');
        return;
      }

      const studentId = studentData.id || studentData.studentId;
      if (!studentId) {
        setError('Invalid student QR code');
        return;
      }

      // Use concurrent scanning manager
      const result = await scanningManager.queueScanRequest({
        studentId,
        supervisorId,
        supervisorName,
        qrData: studentData,
        appointmentSlot,
        stationInfo
      });

      if (result.success) {
        setScanCount(prev => prev + 1);
        setLastScanTime(new Date());
        
        if (onScanSuccess) {
          onScanSuccess({
            ...result.attendance,
            studentData: studentData
          });
        }
      } else {
        if (result.isDuplicate) {
          setError('Student already scanned for this slot today');
        } else {
          setError(result.message || 'Failed to register attendance');
        }
        
        if (onScanError) {
          onScanError(result);
        }
      }

    } catch (error) {
      console.error('Error processing QR code:', error);
      setError(error.message || 'Failed to process QR code');
      
      if (onScanError) {
        onScanError({ error: error.message });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (date) => {
    return date ? date.toLocaleTimeString() : 'Never';
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      {/* System Status */}
      {systemStatus && (
        <div style={{
          backgroundColor: systemStatus.isHealthy ? '#f0f9ff' : '#fef2f2',
          border: `1px solid ${systemStatus.isHealthy ? '#0ea5e9' : '#f87171'}`,
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>
              System Status: {systemStatus.isHealthy ? '🟢 Healthy' : '🔴 Busy'}
            </span>
            <span style={{ color: '#6b7280' }}>
              {systemStatus.totalTodayAttendance} scans today
            </span>
          </div>
          <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>First Slot: {systemStatus.firstSlotAttendance}</div>
            <div>Second Slot: {systemStatus.secondSlotAttendance}</div>
            <div>Active Supervisors: {systemStatus.activeSupervisors}</div>
            <div>Recent Scans: {systemStatus.recentScans}</div>
          </div>
        </div>
      )}

      {/* Scanner Controls */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <button
            onClick={isScanning ? stopScanning : startScanning}
            disabled={isProcessing}
            style={{
              padding: '12px 24px',
              backgroundColor: isScanning ? '#ef4444' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              opacity: isProcessing ? 0.6 : 1
            }}
          >
            {isProcessing ? 'Processing...' : (isScanning ? 'Stop Scanning' : 'Start Scanning')}
          </button>
          
          <button
            onClick={fetchSystemStatus}
            style={{
              padding: '12px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh Status
          </button>
        </div>

        {/* Scan Statistics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px',
          fontSize: '14px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '600', color: '#3b82f6' }}>{scanCount}</div>
            <div style={{ color: '#6b7280' }}>Scans Today</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '600', color: '#10b981' }}>
              {formatTime(lastScanTime)}
            </div>
            <div style={{ color: '#6b7280' }}>Last Scan</div>
          </div>
        </div>
      </div>

      {/* Camera View */}
      {isScanning && (
        <div style={{
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '16px'
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '300px',
              objectFit: 'cover'
            }}
          />
          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
          />
          
          {/* Scanning Overlay */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '200px',
            height: '200px',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            pointerEvents: 'none'
          }}>
            <div style={{
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              width: '20px',
              height: '20px',
              borderTop: '3px solid #3b82f6',
              borderLeft: '3px solid #3b82f6'
            }} />
            <div style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '20px',
              height: '20px',
              borderTop: '3px solid #3b82f6',
              borderRight: '3px solid #3b82f6'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-2px',
              left: '-2px',
              width: '20px',
              height: '20px',
              borderBottom: '3px solid #3b82f6',
              borderLeft: '3px solid #3b82f6'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '20px',
              height: '20px',
              borderBottom: '3px solid #3b82f6',
              borderRight: '3px solid #3b82f6'
            }} />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #f87171',
          color: '#dc2626',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '14px',
          marginBottom: '16px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Instructions */}
      <div style={{
        backgroundColor: '#f8fafc',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        <strong>Instructions:</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
          <li>Position the QR code within the scanning area</li>
          <li>Ensure good lighting for better detection</li>
          <li>Hold steady for 1-2 seconds for processing</li>
          <li>System handles multiple supervisors automatically</li>
        </ul>
      </div>
    </div>
  );
};

export default ConcurrentQRScanner;
