import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/shared/services/auth/auth-context';

export function TeacherOnlyRoute({ children }: { children?: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p role="status">Recuperando sesión…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return user.roles.includes('TEACHER') ? (
    (children ?? <Outlet />)
  ) : (
    <Navigate to="/unauthorized" replace />
  );
}
