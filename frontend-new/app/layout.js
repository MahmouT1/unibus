'use client';

import './globals.css';
import { LanguageProvider } from '../lib/contexts/LanguageContext';

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
