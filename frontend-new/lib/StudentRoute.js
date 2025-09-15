'use client';

import ProtectedRoute from './ProtectedRoute';

export default function StudentRoute({ children }) {
  return (
    <ProtectedRoute allowedRoles={['student']} redirectTo="/login">
      {children}
    </ProtectedRoute>
  );
}
