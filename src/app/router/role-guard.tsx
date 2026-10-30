import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/shared/services/auth/auth-context';
export function RoleGuard({ roles }: { roles: readonly string[] }) {
  const { user } = useAuth();
  return user?.roles.some((role) => roles.includes(role)) ? (
    <Outlet />
  ) : (
    <Navigate to="/unauthorized" replace />
  );
}
