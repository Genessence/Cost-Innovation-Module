import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { Role } from '../types';
import { useAuthStore } from '../store/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  /** When set, only these roles may enter; others are sent to their home page. */
  roles?: Role[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.currentUser);
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'validator' ? '/dashboard' : '/my-ideas'} replace />;
  }
  return <>{children}</>;
}
