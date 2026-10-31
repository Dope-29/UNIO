import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function StaffGuard({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'STAFF') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function CustomerGuard({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'CUSTOMER') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

