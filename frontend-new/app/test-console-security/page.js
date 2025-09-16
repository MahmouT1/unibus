'use client';

import { useState, useEffect } from 'react';

/**
 * Test page to demonstrate console security
 * This page will log sensitive data to show redaction in action
 */

export default function ConsoleSecurityTest() {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const testConsoleSecurity = () => {
    setLoading(true);
    
    // Test sensitive data logging
    const sensitiveData = {
      user: {
        id: '12345',
        email: 'test@example.com',
        password: 'secretpassword123',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NSIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSJ9.signature',
        apiKey: 'sk-1234567890abcdef1234567890abcdef',
        creditCard: '4111-1111-1111-1111',
        ssn: '123-45-6789',
        phone: '+1234567890',
        ip: '192.168.1.100'
      },
      database: {
        connection: 'mongodb://user:password@localhost:27017/database',
        query: 'SELECT * FROM users WHERE password = "secret"',
        credentials: {
          username: 'admin',
          password: 'admin123'
        }
      },
      api: {
        endpoint: 'https://api.example.com/auth/login',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
          'X-API-Key': 'sk-1234567890abcdef1234567890abcdef'
        }
      }
    };
    
    // Log sensitive data to console (should be redacted)
    console.log('Testing console security with sensitive data:', sensitiveData);
    console.info('Info with sensitive information:', { password: 'secret123', token: 'abc123' });
    console.warn('Warning with sensitive data:', { apiKey: 'sk-1234567890abcdef', email: 'test@example.com' });
    console.error('Error with sensitive information:', { connectionString: 'mongodb://user:password@localhost:27017/database' });
    
    // Test localStorage with sensitive data
    localStorage.setItem('userToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NSJ9.signature');
    localStorage.setItem('userPassword', 'secretpassword123');
    localStorage.setItem('apiKey', 'sk-1234567890abcdef1234567890abcdef');
    
    // Test sessionStorage with sensitive data
    sessionStorage.setItem('sessionToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiIxMjM0NSJ9.signature');
    sessionStorage.setItem('userCredentials', JSON.stringify({ username: 'admin', password: 'admin123' }));
    
    // Test API call with sensitive data
    fetch('/api/test-console-security')
      .then(response => response.json())
      .then(data => {
        setTestResults(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('API test error:', error);
        setTestResults({ success: false, error: error.message });
        setLoading(false);
      });
  };

  const testStorageSecurity = () => {
    // Test localStorage access
    const token = localStorage.getItem('userToken');
    const password = localStorage.getItem('userPassword');
    const apiKey = localStorage.getItem('apiKey');
    
    console.log('Retrieved from localStorage:', { token, password, apiKey });
    
    // Test sessionStorage access
    const sessionToken = sessionStorage.getItem('sessionToken');
    const credentials = sessionStorage.getItem('userCredentials');
    
    console.log('Retrieved from sessionStorage:', { sessionToken, credentials });
  };

  const testAPISecurity = () => {
    // Test API call with sensitive data
    const sensitiveRequest = {
      email: 'test@example.com',
      password: 'secretpassword123',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NSJ9.signature',
      apiKey: 'sk-1234567890abcdef1234567890abcdef'
    };
    
    console.log('Making API call with sensitive data:', sensitiveRequest);
    
    fetch('/api/test-console-security', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NSJ9.signature',
        'X-API-Key': 'sk-1234567890abcdef1234567890abcdef'
      },
      body: JSON.stringify(sensitiveRequest)
    })
    .then(response => response.json())
    .then(data => {
      console.log('API response:', data);
      setTestResults(data);
    })
    .catch(error => {
      console.error('API call error:', error);
      setTestResults({ success: false, error: error.message });
    });
  };

  const clearTestData = () => {
    // Clear test data
    localStorage.removeItem('userToken');
    localStorage.removeItem('userPassword');
    localStorage.removeItem('apiKey');
    sessionStorage.removeItem('sessionToken');
    sessionStorage.removeItem('userCredentials');
    
    console.log('Test data cleared');
    setTestResults(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🛡️ Console Security Test
          </h1>
          
          <div className="mb-8">
            <p className="text-gray-600 mb-4">
              This page demonstrates the console security implementation. 
              All sensitive data should be automatically redacted in the browser console.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-600 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Security Notice
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Open your browser's developer console (F12) to see the security measures in action.
                      All sensitive data should be automatically redacted with [REDACTED] or specific placeholders.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Console Security Tests
              </h3>
              <div className="space-y-3">
                <button
                  onClick={testConsoleSecurity}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Testing...' : 'Test Console Security'}
                </button>
                
                <button
                  onClick={testStorageSecurity}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Test Storage Security
                </button>
                
                <button
                  onClick={testAPISecurity}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Test API Security
                </button>
                
                <button
                  onClick={clearTestData}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Clear Test Data
                </button>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-3">
                Expected Results
              </h3>
              <div className="text-sm text-green-800 space-y-2">
                <p>✅ Passwords → [REDACTED]</p>
                <p>✅ JWT Tokens → [JWT_TOKEN]</p>
                <p>✅ API Keys → [API_KEY]</p>
                <p>✅ Email Addresses → [EMAIL]</p>
                <p>✅ Phone Numbers → [PHONE]</p>
                <p>✅ Credit Cards → [CARD_NUMBER]</p>
                <p>✅ SSN → [SSN]</p>
                <p>✅ IP Addresses → [IP_ADDRESS]</p>
              </div>
            </div>
          </div>
          
          {testResults && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Test Results
              </h3>
              <pre className="bg-white border border-gray-200 rounded p-3 text-sm overflow-x-auto">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              How to Test
            </h3>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-2">
              <li>Open your browser's developer console (F12)</li>
              <li>Click the "Test Console Security" button</li>
              <li>Check the console output - sensitive data should be redacted</li>
              <li>Try the other test buttons to see different security measures</li>
              <li>Verify that all sensitive information is properly protected</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
