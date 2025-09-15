'use client';

import React, { useState } from 'react';
import ImprovedQRScanner from '../../components/ImprovedQRScanner';

export default function TestQRScannerPage() {
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');
  const [scanCount, setScanCount] = useState(0);

  const handleScan = (result) => {
    console.log('Scan result received:', result);
    setScanResult(result);
    setScanCount(prev => prev + 1);
    setScanError('');
  };

  const handleError = (error) => {
    console.error('Scanner error:', error);
    setScanError(error.message || 'Scanner error occurred');
  };

  const handleCameraList = (cameras) => {
    console.log('Available cameras:', cameras);
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f8fafc',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          textAlign: 'center',
          color: '#1e293b',
          marginBottom: '30px'
        }}>
          📱 QR Scanner Test Page
        </h1>

        <div style={{
          marginBottom: '30px',
          padding: '15px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #0ea5e9'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#0c4a6e' }}>Test Instructions:</h3>
          <ol style={{ margin: 0, paddingLeft: '20px', color: '#075985' }}>
            <li>Allow camera access when prompted</li>
            <li>Point your camera at a QR code</li>
            <li>Keep the QR code within the blue frame</li>
            <li>Wait for automatic detection</li>
          </ol>
        </div>

        <ImprovedQRScanner
          onScan={handleScan}
          onError={handleError}
          onCameraList={handleCameraList}
          showCameraSelector={true}
          showScanRegion={true}
          enableTorch={true}
          preferredCamera="environment"
          style={{
            marginBottom: '30px'
          }}
        />

        {/* Scan Results */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginTop: '20px'
        }}>
          <div style={{
            padding: '15px',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #22c55e'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#15803d' }}>✅ Scan Results</h3>
            <p style={{ margin: '0 0 5px 0', color: '#166534' }}>
              <strong>Scans Count:</strong> {scanCount}
            </p>
            {scanResult && (
              <div style={{ marginTop: '10px' }}>
                <p style={{ margin: '0 0 5px 0', color: '#166534' }}>
                  <strong>Last Scan:</strong>
                </p>
                <pre style={{
                  backgroundColor: '#dcfce7',
                  padding: '10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '200px',
                  color: '#166534'
                }}>
                  {JSON.stringify(scanResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div style={{
            padding: '15px',
            backgroundColor: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #ef4444'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#dc2626' }}>❌ Errors</h3>
            {scanError ? (
              <p style={{ margin: 0, color: '#dc2626' }}>{scanError}</p>
            ) : (
              <p style={{ margin: 0, color: '#991b1b' }}>No errors</p>
            )}
          </div>
        </div>

        {/* Debug Info */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#374151' }}>🔧 Debug Information</h3>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            <p style={{ margin: '5px 0' }}>
              <strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Screen Size:</strong> {typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'N/A'}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Viewport Size:</strong> {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>HTTPS:</strong> {typeof window !== 'undefined' ? (window.location.protocol === 'https:' ? 'Yes' : 'No') : 'N/A'}
            </p>
          </div>
        </div>

        {/* Test QR Code */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#fefce8',
          borderRadius: '8px',
          border: '1px solid #eab308',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#a16207' }}>🧪 Test QR Code</h3>
          <p style={{ margin: '0 0 10px 0', color: '#a16207' }}>
            Try scanning this test QR code:
          </p>
          <div style={{
            display: 'inline-block',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '2px solid #eab308'
          }}>
            <img
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmZiIvPgogIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMDAwIi8+CiAgPHJlY3QgeD0iNzAiIHk9IjEwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiMwMDAiLz4KICA8cmVjdCB4PSIxMCIgeT0iNzAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzAwMCIvPgogIDxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMDAwIi8+CiAgPHJlY3QgeD0iNzAiIHk9IjcwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiMwMDAiLz4KPC9zdmc+"
              alt="Test QR Code"
              style={{
                width: '100px',
                height: '100px'
              }}
            />
          </div>
          <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#a16207' }}>
            This is a simple test QR code for debugging
          </p>
        </div>
      </div>
    </div>
  );
}
