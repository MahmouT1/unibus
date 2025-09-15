'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const EnhancedQRGenerator = ({ 
  studentData, 
  size = 256, 
  showDownload = true,
  showPreview = true,
  className = '',
  style = {}
}) => {
  const canvasRef = useRef(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [qrOptions, setQrOptions] = useState({
    errorCorrectionLevel: 'H', // High error correction for better scanning
    type: 'image/png',
    quality: 0.92,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    width: size
  });

  // Generate QR code with optimized settings
  const generateQRCode = async (data, options) => {
    try {
      setIsGenerating(true);
      setError('');
      
      // Ensure data is properly formatted
      const qrData = typeof data === 'string' ? data : JSON.stringify(data);
      
      // Generate QR code with high quality settings
      const dataUrl = await QRCode.toDataURL(qrData, {
        ...options,
        rendererOpts: {
          quality: 0.92
        }
      });
      
      setQrCodeDataUrl(dataUrl);
      
      // Also draw to canvas for additional processing
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, qrData, options);
      }
      
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download QR code
  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `student-qr-${studentData?.studentId || 'code'}.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy QR code to clipboard
  const copyToClipboard = async () => {
    if (!qrCodeDataUrl) return;
    
    try {
      const response = await fetch(qrCodeDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      alert('QR code copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy QR code to clipboard');
    }
  };

  // Generate QR code when student data changes
  useEffect(() => {
    if (studentData) {
      generateQRCode(studentData, qrOptions);
    }
  }, [studentData, qrOptions]);

  // Update options when size changes
  useEffect(() => {
    setQrOptions(prev => ({
      ...prev,
      width: size
    }));
  }, [size]);

  if (!studentData) {
    return (
      <div className={`qr-generator-container ${className}`} style={style}>
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#6b7280',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '2px dashed #d1d5db'
        }}>
          <p>No student data provided</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`qr-generator-container ${className}`} style={style}>
      {/* QR Code Display */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        {/* QR Code Image */}
        {showPreview && (
          <div style={{
            position: 'relative',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            {isGenerating ? (
              <div style={{
                width: size,
                height: size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #3b82f6',
                  borderTop: '4px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              </div>
            ) : qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="Student QR Code"
                style={{
                  width: size,
                  height: size,
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb'
                }}
              />
            ) : (
              <div style={{
                width: size,
                height: size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                color: '#6b7280'
              }}>
                QR Code will appear here
              </div>
            )}
            
            {/* Quality indicator */}
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: '#10b981',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              HIGH QUALITY
            </div>
          </div>
        )}

        {/* Student Info */}
        <div style={{
          textAlign: 'center',
          maxWidth: '300px'
        }}>
          <h3 style={{
            margin: '0 0 10px 0',
            color: '#1f2937',
            fontSize: '18px'
          }}>
            {studentData.fullName || 'Student'}
          </h3>
          <p style={{
            margin: '0 0 5px 0',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            ID: {studentData.studentId}
          </p>
          <p style={{
            margin: '0 0 5px 0',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            {studentData.college}
          </p>
        </div>

        {/* Action Buttons */}
        {showDownload && qrCodeDataUrl && (
          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              onClick={downloadQRCode}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              📥 Download QR Code
            </button>
            
            <button
              onClick={copyToClipboard}
              style={{
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
            >
              📋 Copy to Clipboard
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={{
            padding: '10px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#991b1b',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* QR Code Info */}
        <div style={{
          padding: '15px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          fontSize: '12px',
          color: '#475569',
          textAlign: 'center',
          maxWidth: '300px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>QR Code Features:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', textAlign: 'left' }}>
            <li>High error correction for reliable scanning</li>
            <li>Optimized for mobile camera detection</li>
            <li>Contains complete student information</li>
            <li>Works in various lighting conditions</li>
          </ul>
        </div>
      </div>

      {/* Hidden canvas for additional processing */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EnhancedQRGenerator;
