'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

const QRCodeGenerator = ({ 
  studentData, 
  size = 256, 
  onGenerated, 
  downloadable = true,
  showInfo = true 
}) => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (studentData && studentData.studentId) {
      generateQRCode();
    }
  }, [studentData]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError('');

      // Create comprehensive QR data
      const qrData = {
        id: studentData.id || studentData._id,
        studentId: studentData.studentId,
        fullName: studentData.fullName,
        email: studentData.email,
        phoneNumber: studentData.phoneNumber,
        college: studentData.college,
        major: studentData.major,
        grade: studentData.grade,
        address: studentData.address,
        profilePhoto: studentData.profilePhoto,
        timestamp: new Date().toISOString(),
        version: '2.0'
      };

      // Generate QR code with enhanced options
      const qrCodeOptions = {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: size
      };

      const dataURL = await QRCode.toDataURL(JSON.stringify(qrData), qrCodeOptions);
      
      setQrCodeDataURL(dataURL);
      
      if (onGenerated) {
        onGenerated(dataURL, qrData);
      }

    } catch (err) {
      console.error('QR Code generation error:', err);
      setError('Failed to generate QR code: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataURL) return;

    const link = document.createElement('a');
    link.href = qrCodeDataURL;
    link.download = `${studentData.studentId}_qr_code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async () => {
    if (!qrCodeDataURL) return;

    try {
      const response = await fetch(qrCodeDataURL);
      const blob = await response.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      alert('QR code copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy QR code:', err);
      alert('Failed to copy QR code to clipboard');
    }
  };

  const regenerateQRCode = () => {
    generateQRCode();
  };

  if (loading) {
    return (
      <div className="qr-generator">
        <div className="loading">
          <div className="spinner"></div>
          <p>Generating QR Code...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="qr-generator">
        <div className="error">
          <p>{error}</p>
          <button onClick={regenerateQRCode} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-generator">
      {showInfo && studentData && (
        <div className="student-info">
          <h3>{studentData.fullName}</h3>
          <p>ID: {studentData.studentId}</p>
          <p>{studentData.college} - {studentData.major}</p>
        </div>
      )}

      {qrCodeDataURL ? (
        <div className="qr-display">
          <div className="qr-code-container">
            <img 
              src={qrCodeDataURL} 
              alt={`QR Code for ${studentData?.fullName || 'Student'}`}
              className="qr-code-image"
            />
          </div>
          
          <div className="qr-actions">
            {downloadable && (
              <button onClick={downloadQRCode} className="download-btn">
                📥 Download PNG
              </button>
            )}
            
            <button onClick={copyToClipboard} className="copy-btn">
              📋 Copy to Clipboard
            </button>
            
            <button onClick={regenerateQRCode} className="regenerate-btn">
              🔄 Regenerate
            </button>
          </div>
          
          <div className="qr-info">
            <p>Show this QR code to supervisors for attendance scanning</p>
            <small>Generated on {new Date().toLocaleString()}</small>
          </div>
        </div>
      ) : (
        <div className="no-qr">
          <p>No QR code available</p>
          <button onClick={generateQRCode} className="generate-btn">
            Generate QR Code
          </button>
        </div>
      )}

      <style jsx>{`
        .qr-generator {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          max-width: 400px;
          margin: 0 auto;
        }

        .student-info {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
          width: 100%;
        }

        .student-info h3 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 1.2em;
        }

        .student-info p {
          margin: 5px 0;
          color: #666;
          font-size: 0.9em;
        }

        .qr-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        .qr-code-container {
          margin-bottom: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 10px;
          border: 2px solid #e9ecef;
        }

        .qr-code-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
        }

        .qr-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-bottom: 15px;
        }

        .download-btn,
        .copy-btn,
        .regenerate-btn,
        .generate-btn,
        .retry-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .download-btn {
          background: #007bff;
          color: white;
        }

        .download-btn:hover {
          background: #0056b3;
        }

        .copy-btn {
          background: #28a745;
          color: white;
        }

        .copy-btn:hover {
          background: #1e7e34;
        }

        .regenerate-btn {
          background: #ffc107;
          color: #212529;
        }

        .regenerate-btn:hover {
          background: #e0a800;
        }

        .generate-btn {
          background: #17a2b8;
          color: white;
          padding: 12px 24px;
          font-size: 16px;
        }

        .generate-btn:hover {
          background: #138496;
        }

        .retry-btn {
          background: #dc3545;
          color: white;
        }

        .retry-btn:hover {
          background: #c82333;
        }

        .qr-info {
          text-align: center;
          color: #666;
        }

        .qr-info p {
          margin: 0 0 5px 0;
          font-size: 0.9em;
        }

        .qr-info small {
          font-size: 0.8em;
          color: #999;
        }

        .loading,
        .error,
        .no-qr {
          text-align: center;
          padding: 20px;
          color: #666;
        }

        .spinner {
          width: 30px;
          height: 30px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error p {
          color: #dc3545;
          margin-bottom: 15px;
        }

        @media (max-width: 480px) {
          .qr-generator {
            padding: 15px;
            margin: 10px;
          }

          .qr-actions {
            flex-direction: column;
            width: 100%;
          }

          .qr-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default QRCodeGenerator;
