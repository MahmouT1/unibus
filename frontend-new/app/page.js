'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LanguageProvider } from '../lib/contexts/LanguageContext';

export default function HomePage() {
  const router = useRouter();

  return (
    <LanguageProvider>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          maxWidth: '600px',
          textAlign: 'center',
          color: 'white',
          padding: '40px'
        }}>
          <div style={{ fontSize: '80px', marginBottom: '30px' }}>🚌</div>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>
            UniBus
          </h1>
          <p style={{ fontSize: '20px', marginBottom: '40px', opacity: 0.9 }}>
            Student Transportation Portal
          </p>
          
          <div style={{ display: 'grid', gap: '20px', maxWidth: '400px', margin: '0 auto' }}>
            <a
              href="/admin-login"
              style={{
                display: 'block',
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '15px',
                fontWeight: '600',
                fontSize: '18px',
                transition: 'all 0.3s',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              🔐 Admin & Supervisor Login
            </a>
            
            <a
              href="/login"
              style={{
                display: 'block',
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '15px',
                fontWeight: '600',
                fontSize: '18px',
                transition: 'all 0.3s',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              🎓 Student Portal
            </a>
          </div>
        </div>
      </div>
    </LanguageProvider>
  );
}