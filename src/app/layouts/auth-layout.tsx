import { Outlet } from 'react-router';
import { LoginBrandPanel } from '@/features/users/presentation/components/login-brand-panel';
import '@/features/users/presentation/styles/login.css';
export function AuthLayout() {
  return (
    <main className="login-shell" id="login-content">
      <LoginBrandPanel />
      <Outlet />
    </main>
  );
}
