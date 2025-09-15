'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSubscriptionManagementPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new enhanced subscriptions page
    router.replace('/admin/subscriptions');
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontSize: '18px',
      fontWeight: '500'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔄</div>
        <div>Redirecting to enhanced subscriptions page...</div>
      </div>
    </div>
  );
}
