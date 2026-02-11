'use client';

import React from 'react';
import { LanguageProvider } from '../lib/contexts/LanguageContext';

export default function HomePage() {
  return (
    <LanguageProvider>
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(1200px 600px at 50% -10%, rgba(255,255,255,0.15), transparent), linear-gradient(135deg, #5a67d8 0%, #7f54d9 50%, #9b5de5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, sans-serif'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '740px',
          textAlign: 'center',
          color: 'white',
          position: 'relative'
        }}>
          {/* Glass card */}
          <div style={{
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '24px',
            padding: '48px 40px',
            boxShadow: '0 30px 60px rgba(0,0,0,0.25)'
          }}>
            {/* UniBus logo centered */}
            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 18px auto',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '10px'
            }}>
              <img 
                src="/uni-bus-logo.png.jpg" 
                alt="UniBus Logo" 
                style={{
                  width: '100px',
                  height: '100px',
                  objectFit: 'contain',
                  borderRadius: '20px'
                }}
              />
            </div>

            <h1 style={{
              fontSize: '54px',
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: '0 0 8px 0'
            }}>UniBus</h1>

            <p style={{
              margin: 0,
              opacity: 0.9,
              fontSize: '18px'
            }}>Student Transportation Portal</p>

            {/* CTA */}
            <div style={{ marginTop: '28px' }}>
              <a href="/auth" style={{
                display: 'inline-block',
                padding: '16px 24px',
                borderRadius: '14px',
                color: '#0b1020',
                background: 'linear-gradient(135deg, #a7f3d0, #34d399)',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '18px',
                boxShadow: '0 12px 24px rgba(52,211,153,0.35)'
              }}>
                🚀 Enter Portal
              </a>
              <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '10px' }}>
                Login or Register for Students, Admins & Supervisors
              </div>
            </div>
          </div>
        </div>
      </div>
    </LanguageProvider>
  );
}