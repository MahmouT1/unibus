'use client';

import { useState } from 'react';

export default function AccountChecker({ onAccountFound, onAccountNotFound }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountInfo, setAccountInfo] = useState(null);

  const checkAccount = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError('');
    setAccountInfo(null);

    try {
      const response = await fetch('/api/users/check-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.exists) {
          setAccountInfo(data.user);
          if (onAccountFound) {
            onAccountFound(data.user);
          }
        } else {
          if (onAccountNotFound) {
            onAccountNotFound(email);
          }
        }
      } else {
        setError(data.message || 'Failed to check account');
      }
    } catch (error) {
      console.error('Account check error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetCheck = () => {
    setEmail('');
    setError('');
    setAccountInfo(null);
  };

  return (
    <div className="account-checker">
      <div className="checker-header">
        <h3>Check Account Status</h3>
        <p>Enter your email to check if you have an account</p>
      </div>

      <form onSubmit={checkAccount} className="checker-form">
        <div className="form-group">
          <label htmlFor="check-email">Email Address</label>
          <input
            type="email"
            id="check-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            disabled={loading}
            className="form-input"
          />
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="check-btn"
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Checking...
            </>
          ) : (
            <>
              <span className="btn-icon">🔍</span>
              Check Account
            </>
          )}
        </button>
      </form>

      {accountInfo && (
        <div className="account-info">
          <div className="info-header">
            <span className="success-icon">✅</span>
            <h4>Account Found</h4>
          </div>
          <div className="info-details">
            <p><strong>Email:</strong> {accountInfo.email}</p>
            <p><strong>Role:</strong> 
              <span className={`role-badge role-${accountInfo.role}`}>
                {accountInfo.role}
              </span>
            </p>
            <p><strong>Status:</strong> 
              <span className={`status-badge ${accountInfo.isActive ? 'active' : 'inactive'}`}>
                {accountInfo.isActive ? 'Active' : 'Inactive'}
              </span>
            </p>
            {accountInfo.emailVerified && (
              <p><strong>Email Verified:</strong> 
                <span className="verified-badge">✓ Verified</span>
              </p>
            )}
            {accountInfo.lastLogin && (
              <p><strong>Last Login:</strong> {new Date(accountInfo.lastLogin).toLocaleDateString()}</p>
            )}
          </div>
          <div className="info-actions">
            <button onClick={resetCheck} className="btn-secondary">
              Check Another Email
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .account-checker {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .checker-header {
          text-align: center;
          margin-bottom: 25px;
        }

        .checker-header h3 {
          color: #1a1a1a;
          margin-bottom: 8px;
          font-size: 1.3rem;
        }

        .checker-header p {
          color: #666;
          font-size: 0.95rem;
        }

        .checker-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 600;
          color: #333;
          font-size: 0.95rem;
        }

        .form-input {
          padding: 12px 15px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-input:disabled {
          background: #f8f9fa;
          cursor: not-allowed;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #fcc;
        }

        .error-icon {
          font-size: 1.1rem;
        }

        .check-btn {
          padding: 12px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .check-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }

        .check-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .account-info {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-top: 20px;
        }

        .info-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .success-icon {
          font-size: 1.2rem;
        }

        .info-header h4 {
          margin: 0;
          color: #1a1a1a;
        }

        .info-details {
          margin-bottom: 15px;
        }

        .info-details p {
          margin: 8px 0;
          color: #333;
        }

        .role-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          margin-left: 8px;
        }

        .role-student {
          background: #28a745;
          color: white;
        }

        .role-admin {
          background: #dc3545;
          color: white;
        }

        .role-supervisor {
          background: #fd7e14;
          color: white;
        }

        .status-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-left: 8px;
        }

        .status-badge.active {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.inactive {
          background: #f8d7da;
          color: #721c24;
        }

        .verified-badge {
          color: #28a745;
          font-weight: 600;
          margin-left: 8px;
        }

        .info-actions {
          display: flex;
          justify-content: center;
        }

        .btn-secondary {
          padding: 8px 16px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.2s ease;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }
      `}</style>
    </div>
  );
}
