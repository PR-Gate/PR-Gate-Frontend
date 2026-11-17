import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, it } from 'vitest';
import { AuthContext } from '@/shared/services/auth/auth-context';
import type { User } from '@/features/users/domain/entities/user.entity';
import { DashboardPage } from './static-pages';

function renderDashboard(roles: User['roles'], name = 'Lucía Pérez') {
  return render(
    <AuthContext.Provider
      value={{
        user: { id: 'session-user', name, email: '', roles },
        loading: false,
        error: null,
        login: async () => {},
        logout: async () => {},
      }}
    >
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

it('shows the student summary with session name and pending academic information', async () => {
  renderDashboard(['STUDENT']);
  expect(
    await screen.findByRole('heading', { name: 'Hola, Lucía' }),
  ).toBeInTheDocument();
  for (const name of [
    'Mis proyectos',
    'Pipelines recientes',
    'Quality Gates',
    'Calificación actual',
    'Estado general de mis proyectos',
    'Última evaluación',
    'Siguiente paso recomendado',
  ]) {
    expect(screen.getByRole('heading', { name })).toBeInTheDocument();
  }
  expect(
    screen.getByText('La información de tus proyectos estará disponible aquí.'),
  ).toBeInTheDocument();
  expect(screen.getByText('Sin evaluación disponible')).toBeInTheDocument();
  expect(screen.queryByText('Aún no tienes proyectos')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Ver todos' })).toHaveAttribute(
    'href',
    '/projects',
  );
  for (const name of [
    'Ver última ejecución',
    'Entender mi resultado',
    'Ver cómo mejorar',
  ]) {
    expect(screen.getByRole('button', { name })).toBeDisabled();
    expect(screen.getByRole('button', { name })).toHaveAccessibleDescription();
  }
  expect(screen.queryByText(/sincronizad/i)).not.toBeInTheDocument();
});

it('uses a neutral greeting when the session name is empty', async () => {
  renderDashboard(['STUDENT'], '  ');
  expect(
    await screen.findByRole('heading', { name: 'Hola' }),
  ).toBeInTheDocument();
});

it.each<User['roles']>([
  ['TEACHER'],
  ['ADMIN'],
  ['STUDENT', 'TEACHER'],
  ['STUDENT', 'ADMIN'],
])('preserves the general dashboard for elevated roles %j', (...roles) => {
  renderDashboard(roles);
  expect(
    screen.getByRole('link', { name: /Explorar proyectos/ }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('heading', { name: 'Última evaluación' }),
  ).not.toBeInTheDocument();
});
