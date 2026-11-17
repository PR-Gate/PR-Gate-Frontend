import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { expect, it } from 'vitest';
import { AuthContext } from '@/shared/services/auth/auth-context';
import type { AuthState } from '@/shared/services/auth/auth-context';
import { StudentOnlyRoute } from './student-only-route';

it.each<{ roles: NonNullable<AuthState['user']>['roles']; allowed: boolean }>([
  { roles: ['STUDENT'], allowed: true },
  { roles: ['TEACHER'], allowed: false },
  { roles: ['ADMIN'], allowed: false },
  { roles: ['STUDENT', 'TEACHER'], allowed: false },
  { roles: ['STUDENT', 'ADMIN'], allowed: false },
])('checks student-only access for $roles', ({ roles, allowed }) => {
  render(
    <AuthContext.Provider
      value={{
        user: { id: 'session', name: '', email: '', roles },
        loading: false,
        error: null,
        login: async () => {},
        logout: async () => {},
      }}
    >
      <MemoryRouter initialEntries={['/pipelines']}>
        <Routes>
          <Route element={<StudentOnlyRoute />}>
            <Route path="/pipelines" element={<p>Pipeline privado</p>} />
          </Route>
          <Route path="/unauthorized" element={<p>Acceso denegado</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
  expect(
    screen.getByText(allowed ? 'Pipeline privado' : 'Acceso denegado'),
  ).toBeInTheDocument();
});
