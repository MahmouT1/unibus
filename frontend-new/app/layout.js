'use client';

import './globals.css';
import { LanguageProvider } from '../lib/contexts/LanguageContext';
import { initializeSecureConsole } from '../lib/secure-console.js';

// Initialize secure console
if (typeof window !== 'undefined') {
  initializeSecureConsole();
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
