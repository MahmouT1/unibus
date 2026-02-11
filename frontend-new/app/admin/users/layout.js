'use client';

import React from 'react';

export default function UsersLayout({ children }) {
  return (
    <div className="users-layout">
      <div className="users-content">
        {children}
      </div>

      <style jsx>{`
        .users-layout {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .users-content {
          padding: 0;
          margin: 0;
        }
      `}</style>
    </div>
  );
}