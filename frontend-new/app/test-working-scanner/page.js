'use client';

import React, { useState } from 'react';
import WorkingQRScanner from '../../components/WorkingQRScanner';

export default function TestWorkingScannerPage() {
  const [scannedData, setScannedData] = useState('');
  const [scanHistory, setScanHistory] = useState([]);

  const handleScan = (data) => {
    console.log('QR Code scanned:', data);
    setScannedData(data);
    setScanHistory(prev => [...prev, { data, timestamp: new Date().toLocaleTimeString() }]);
  };

  const handleError = (error) => {
    console.error('Scanner error:', error);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 Test Working QR Scanner</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Camera Test</h2>
        <p>This page tests the working QR scanner with native camera API.</p>
      </div>

      <WorkingQRScanner
        onScan={handleScan}
        onError={handleError}
        style={{ marginBottom: '20px' }}
      />

      {scannedData && (
        <div style={{
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          color: '#155724',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3>✅ QR Code Detected!</h3>
          <p><strong>Data:</strong> {scannedData}</p>
          <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
        </div>
      )}

      {scanHistory.length > 0 && (
        <div>
          <h3>Scan History</h3>
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '15px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {scanHistory.map((scan, index) => (
              <div key={index} style={{
                padding: '8px',
                borderBottom: index < scanHistory.length - 1 ? '1px solid #dee2e6' : 'none',
                fontSize: '14px'
              }}>
                <strong>{scan.timestamp}:</strong> {scan.data}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '8px'
      }}>
        <h4>📋 Instructions:</h4>
        <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Click "Start Camera" to begin</li>
          <li>Allow camera permissions when prompted</li>
          <li>Point camera at a QR code</li>
          <li>Wait for detection (simulated for demo)</li>
          <li>Check the scan results above</li>
        </ol>
      </div>
    </div>
  );
}
