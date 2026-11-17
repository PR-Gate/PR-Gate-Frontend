import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/shared/services/auth/auth-context';

/** Student views are unavailable to teacher and administrator accounts. */
export function StudentOnlyRoute({ children }: { children?: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p role="status">Recuperando sesión…</p>;
  if (!user) return <Navigate to="/login" replace />;
  const student = user.roles.includes('STUDENT');
  const elevated = user.roles.some(
    (role) => role === 'TEACHER' || role === 'ADMIN',
  );
  return student && !elevated ? (
    (children ?? <Outlet />)
  ) : (
    <Navigate to="/unauthorized" replace />
  );
}
