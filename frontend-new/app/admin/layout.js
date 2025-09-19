'use client';

import { LanguageProvider } from '../../lib/contexts/LanguageContext';

export default function AdminLayout({ children }) {
  return (
    <LanguageProvider>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        {children}
      </div>
    </LanguageProvider>
  );
}