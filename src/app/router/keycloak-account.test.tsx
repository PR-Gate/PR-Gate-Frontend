import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { expect, it } from 'vitest';
import { AppProviders } from '../providers/app-providers';
import { createDependencies } from '../di/container';
import { createDemoSession } from '@/features/users/infrastructure/auth/demo-session.adapter';
import AccountPage from '@/features/users/presentation/pages/account.page';
import { ProtectedRoute } from './protected-route';

it('shows the authenticated account without granting access to academic routes', async () => {
  const auth = {
    ...createDemoSession(),
    getUser: async () => ({
      id: 'keycloak-identity',
      name: 'Ana Torres',
      email: 'ana@example.test',
      roles: [],
      academicProfilePending: true,
    }),
  };
  const router = createMemoryRouter(
    [
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/account', element: <AccountPage /> },
          {
            path: '/teacher/dashboard',
            element: <h1>Teacher-only content</h1>,
          },
        ],
      },
    ],
    { initialEntries: ['/teacher/dashboard'] },
  );
  try {
    render(
      <AppProviders dependencies={createDependencies('/api', auth)}>
        <RouterProvider router={router} />
      </AppProviders>,
    );
    expect(
      await screen.findByRole('heading', { name: 'Sesión iniciada' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Ana Torres')).toBeInTheDocument();
    expect(screen.queryByText('Teacher-only content')).not.toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/account');
  } finally {
    router.dispose();
  }
});
