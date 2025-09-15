'use client';

import React, { useState } from 'react';
import WorkingQRScanner from '../../components/WorkingQRScanner';

export default function TestRealQRPage() {
  const [scannedData, setScannedData] = useState('');
  const [scanHistory, setScanHistory] = useState([]);
  const [debugInfo, setDebugInfo] = useState('');

  const handleScan = (data) => {
    console.log('QR Code scanned:', data);
    setScannedData(data);
    setScanHistory(prev => [...prev, { data, timestamp: new Date().toLocaleTimeString() }]);
    setDebugInfo(`Last scan: ${new Date().toLocaleTimeString()}`);
  };

  const handleError = (error) => {
    console.error('Scanner error:', error);
    setDebugInfo(`Error: ${error.message}`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>🧪 Test Real QR Scanner</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Real QR Code Detection Test</h2>
        <p>This page tests the QR scanner with real QR code detection using the jsQR library.</p>
      </div>

      <WorkingQRScanner
        onScan={handleScan}
        onError={handleError}
        style={{ marginBottom: '20px' }}
      />

      {/* Debug Info */}
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px'
      }}>
        <h3>🔍 Debug Information</h3>
        <p><strong>Status:</strong> {debugInfo || 'Ready to scan'}</p>
        <p><strong>Last Scan:</strong> {scannedData ? 'QR code detected' : 'No QR code detected yet'}</p>
        <p><strong>Total Scans:</strong> {scanHistory.length}</p>
      </div>

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
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '10px',
            margin: '10px 0',
            fontFamily: 'monospace',
            fontSize: '12px',
            overflow: 'auto',
            maxHeight: '200px'
          }}>
            <pre>{scannedData}</pre>
          </div>
          <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
        </div>
      )}

      {scanHistory.length > 0 && (
        <div>
          <h3>📊 Scan History</h3>
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
                <strong>{scan.timestamp}:</strong> 
                <div style={{
                  backgroundColor: '#e9ecef',
                  padding: '5px',
                  borderRadius: '4px',
                  marginTop: '5px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '100px'
                }}>
                  {scan.data}
                </div>
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
        <h4>📋 Testing Instructions:</h4>
        <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li><strong>Generate a QR code:</strong> Use the <a href="/generate-qr-code" target="_blank">QR Generator</a> to create a test QR code</li>
          <li><strong>Start camera:</strong> Click "Start Camera" to begin</li>
          <li><strong>Allow permissions:</strong> Grant camera access when prompted</li>
          <li><strong>Position QR code:</strong> Place the QR code in the camera frame</li>
          <li><strong>Wait for detection:</strong> QR code should be detected automatically</li>
          <li><strong>Check results:</strong> Verify the scanned data appears above</li>
        </ol>
        
        <div style={{ marginTop: '15px' }}>
          <h4>🔧 Troubleshooting:</h4>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li><strong>No detection:</strong> Ensure good lighting and clear QR code</li>
            <li><strong>Camera issues:</strong> Try refreshing the page and allowing permissions again</li>
            <li><strong>QR code format:</strong> Make sure QR code contains valid data</li>
            <li><strong>Manual scan:</strong> Use the "📷 SCAN QR" button if automatic detection fails</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
