'use client';

import { useState } from 'react';

export default function RoleChangeInstructionsPage() {
  const [currentUser, setCurrentUser] = useState(null);

  useState(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Role Change Instructions</h1>
      
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Current User Status</h2>
        {currentUser ? (
          <div>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Current Role:</strong> 
              <span style={{
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '600',
                marginLeft: '8px',
                background: currentUser.role === 'admin' ? '#dc3545' : currentUser.role === 'supervisor' ? '#fd7e14' : '#28a745',
                color: 'white'
              }}>
                {currentUser.role}
              </span>
            </p>
          </div>
        ) : (
          <p>No user logged in</p>
        )}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Step-by-Step Instructions</h2>
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
          <h3>To Change Your Role and Access Admin Pages:</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <h4>Step 1: Access User Management</h4>
            <p>You need to access the user management page to change your role. Since you might not have admin access yet, you can:</p>
            <ul>
              <li>Use the default admin account: <code>admin@university.edu</code> / <code>admin123</code></li>
              <li>Or ask another admin to change your role</li>
            </ul>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>Step 2: Change Your Role</h4>
            <ol>
              <li>Go to the User Management page</li>
              <li>Find your account in the user list</li>
              <li>Click the edit button (✏️) next to your account</li>
              <li>Change the role from "student" to "admin"</li>
              <li>Click "Save Changes"</li>
            </ol>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>Step 3: Refresh Your Token</h4>
            <ol>
              <li>Go to the Token Refresh Test page</li>
              <li>Click "Test Role Change" button</li>
              <li>This will refresh your token with the new role</li>
              <li>You should see your role change from "student" to "admin"</li>
            </ol>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>Step 4: Access Admin Pages</h4>
            <p>After refreshing your token, you should now be able to:</p>
            <ul>
              <li>Access the Admin Dashboard</li>
              <li>View User Management</li>
              <li>Access all admin-only features</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => window.location.href = '/admin/users'} 
            style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Go to User Management
          </button>
          <button 
            onClick={() => window.location.href = '/test-token-refresh'} 
            style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Go to Token Refresh Test
          </button>
          <button 
            onClick={() => window.location.href = '/admin/dashboard'} 
            style={{ padding: '10px 20px', background: '#ffc107', color: 'black', border: 'none', borderRadius: '4px' }}
          >
            Try Admin Dashboard
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Troubleshooting</h2>
        <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
          <h3>If you still can't access admin pages:</h3>
          <ul>
            <li><strong>Check your role:</strong> Make sure your role was actually changed in the database</li>
            <li><strong>Refresh token:</strong> Use the token refresh functionality to get updated role</li>
            <li><strong>Clear cache:</strong> Try logging out and logging back in</li>
            <li><strong>Check console:</strong> Look for any error messages in the browser console</li>
          </ul>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Default Admin Accounts</h2>
        <div style={{ background: '#d1ecf1', padding: '20px', borderRadius: '8px', border: '1px solid #bee5eb' }}>
          <p>If you need to access admin features immediately, you can use these default accounts:</p>
          <ul>
            <li><strong>Admin:</strong> <code>admin@university.edu</code> / <code>admin123</code></li>
            <li><strong>Supervisor:</strong> <code>supervisor@university.edu</code> / <code>supervisor123</code></li>
          </ul>
          <p><strong>Note:</strong> Please change these passwords after first login!</p>
        </div>
      </div>
    </div>
  );
}
