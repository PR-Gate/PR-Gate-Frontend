import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/shared/services/auth/auth-context';
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading)
    return (
      <p role="status" className="p-10">
        Recuperando sesión…
      </p>
    );
  if (user?.academicProfilePending && location.pathname !== '/account')
    return <Navigate to="/account" replace />;
  return user ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      state={{ from: location.pathname + location.search + location.hash }}
      replace
    />
  );
}
