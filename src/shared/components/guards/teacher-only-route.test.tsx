import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { expect, it } from 'vitest';
import {
  AuthContext,
  type AuthState,
} from '@/shared/services/auth/auth-context';
import { TeacherOnlyRoute } from './teacher-only-route';

it.each<{ roles: NonNullable<AuthState['user']>['roles']; allowed: boolean }>([
  { roles: ['TEACHER'], allowed: true },
  { roles: ['STUDENT'], allowed: false },
  { roles: ['ADMIN'], allowed: false },
  { roles: ['ADMIN', 'TEACHER'], allowed: true },
])('restricts courses to teachers: $roles', ({ roles, allowed }) => {
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
      <MemoryRouter initialEntries={['/teacher/courses']}>
        <Routes>
          <Route element={<TeacherOnlyRoute />}>
            <Route path="/teacher/courses" element={<p>Cursos docentes</p>} />
          </Route>
          <Route path="/unauthorized" element={<p>Acceso denegado</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
  expect(
    screen.getByText(allowed ? 'Cursos docentes' : 'Acceso denegado'),
  ).toBeInTheDocument();
});
