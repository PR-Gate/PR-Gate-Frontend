import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { expect, it } from 'vitest';
import {
  AuthContext,
  type AuthState,
} from '@/shared/services/auth/auth-context';
import { ProtectedRoute } from './protected-route';
import { RoleGuard } from './role-guard';
const base: AuthState = {
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  logout: async () => {},
};
function renderGuards(auth: AuthState) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/login" element={<p>Login requerido</p>} />
          <Route path="/unauthorized" element={<p>Acceso denegado</p>} />
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleGuard roles={['ADMIN']} />}>
              <Route path="/admin" element={<p>Administración privada</p>} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}
it('redirects anonymous visitors to login', () => {
  renderGuards(base);
  expect(screen.getByText('Login requerido')).toBeInTheDocument();
});
it('denies students access to administration', () => {
  renderGuards({
    ...base,
    user: { id: '1', name: 'Estudiante', email: '', roles: ['STUDENT'] },
  });
  expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
});
it('allows the authorized role', () => {
  renderGuards({
    ...base,
    user: { id: '1', name: 'Admin', email: '', roles: ['ADMIN'] },
  });
  expect(screen.getByText('Administración privada')).toBeInTheDocument();
});
it('waits for session recovery before redirecting', () => {
  renderGuards({ ...base, loading: true });
  expect(screen.getByRole('status')).toHaveTextContent('Recuperando sesión');
  expect(screen.queryByText('Login requerido')).not.toBeInTheDocument();
});
