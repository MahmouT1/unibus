'use client';

import ProtectedRoute from './ProtectedRoute';

export default function AdminRoute({ children }) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'supervisor']} redirectTo="/login">
      {children}
    </ProtectedRoute>
  );
}
