import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/shared/services/auth/auth-context';
import type { ReactNode } from 'react';
export function RoleGuard({
  roles,
  children,
}: {
  roles: readonly string[];
  children?: ReactNode;
}) {
  const { user } = useAuth();
  return user?.roles.some((role) => roles.includes(role)) ? (
    (children ?? <Outlet />)
  ) : (
    <Navigate to="/unauthorized" replace />
  );
}
