'use client';

import './globals.css';
import { LanguageProvider } from '../lib/contexts/LanguageContext';
import { initializeSecureConsole } from '../lib/secure-console.js';

// Initialize secure console (disabled for debugging)
if (typeof window !== 'undefined') {
  initializeSecureConsole();
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#667eea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="UniBus Portal" />
        <title>UniBus Student Portal</title>
      </head>
      <body style={{ margin: 0, padding: 0, overflowX: 'hidden' }}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
