import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { AppProviders } from '../providers/app-providers';
import { createDependencies } from '../di/container';
import { createDemoSession } from '@/features/users/infrastructure/auth/demo-session.adapter';
import type { AuthSessionService } from '@/shared/services/auth/auth-session.service';
import { saveLoginDestination } from '@/shared/services/auth/login-navigation';
import LoginPage from '@/features/users/presentation/pages/login.page';
import RegisterPage from '@/features/users/presentation/pages/register.page';
import ProjectsPage from '@/features/projects/presentation/pages/projects.page';
import ProjectDetailPage from '@/features/projects/presentation/pages/project-detail.page';
import { AuthLayout } from '../layouts/auth-layout';
import { DashboardLayout } from '../layouts/dashboard-layout';
import { ProtectedRoute } from './protected-route';
import { RoleGuard } from './role-guard';

const routers: ReturnType<typeof createMemoryRouter>[] = [];
afterEach(() => {
  routers.forEach((router) => router.dispose());
  routers.length = 0;
  localStorage.clear();
  sessionStorage.clear();
});

function renderLogin({
  demo = true,
  initialPath = '/login',
  service = createDemoSession(),
}: {
  demo?: boolean;
  initialPath?: string;
  service?: AuthSessionService;
} = {}) {
  const router = createMemoryRouter(
    [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage demo={demo} /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
      { path: '/unauthorized', element: <p>Acceso denegado</p> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout demo={demo} />,
            children: [
              { path: '/projects', element: <ProjectsPage /> },
              { path: '/projects/:projectId', element: <ProjectDetailPage /> },
              {
                element: <RoleGuard roles={['TEACHER', 'ADMIN']} />,
                children: [
                  {
                    path: '/teacher/dashboard',
                    element: <p>Herramientas docentes</p>,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  );
  routers.push(router);
  render(
    <AppProviders
      dependencies={createDependencies('http://localhost/api', service)}
    >
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return router;
}

it('keeps the teacher demo, Projects detail and logout working', async () => {
  const user = userEvent.setup();
  renderLogin();
  expect(
    screen.getByRole('heading', { name: 'Bienvenido de nuevo' }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText('Contraseña')).toBeDisabled();
  await user.click(
    await screen.findByRole('button', { name: 'Explorar demostración' }),
  );
  expect(
    await screen.findByRole('button', { name: 'Nuevo proyecto' }),
  ).toBeInTheDocument();
  await user.click(await screen.findByRole('link', { name: 'Campus Connect' }));
  expect(
    await screen.findByRole('heading', { name: 'Campus Connect' }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
  expect(
    await screen.findByRole('heading', { name: 'Bienvenido de nuevo' }),
  ).toBeInTheDocument();
});

it('opens Projects as a student and denies teacher routes', async () => {
  const user = userEvent.setup();
  const router = renderLogin();
  await user.click(screen.getByRole('radio', { name: 'Estudiante' }));
  await user.click(
    await screen.findByRole('button', { name: 'Explorar demostración' }),
  );
  expect(
    await screen.findByRole('link', { name: 'Campus Connect' }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Nuevo proyecto' }),
  ).not.toBeInTheDocument();
  await act(() => router.navigate('/teacher/dashboard'));
  expect(await screen.findByText('Acceso denegado')).toBeInTheDocument();
});

it('offers teacher or student registration before opening the identity provider', async () => {
  const user = userEvent.setup();
  const login = vi.fn().mockResolvedValue(undefined);
  renderLogin({
    service: { ...createDemoSession(), registrationEnabled: true, login },
    demo: false,
  });
  await user.click(await screen.findByRole('button', { name: 'Crear cuenta' }));
  expect(screen.getByRole('radio', { name: 'Estudiante' })).toBeChecked();
  await user.click(screen.getByRole('radio', { name: 'Docente' }));
  expect(login).not.toHaveBeenCalled();
  await user.click(
    screen.getByRole('button', { name: 'Continuar con el registro' }),
  );
  expect(login).toHaveBeenCalledWith({ profile: 'teacher', register: true });
  expect(
    screen.queryByRole('button', { name: 'Vincular cuenta de GitHub' }),
  ).not.toBeInTheDocument();
});

it('shows only login and registration actions in real mode', async () => {
  renderLogin({
    demo: false,
    service: { ...createDemoSession(), registrationEnabled: true },
  });
  expect(
    await screen.findByRole('button', { name: 'Iniciar sesión' }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Crear cuenta' }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole('button')).toHaveLength(2);
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Contraseña')).not.toBeInTheDocument();
});
it('retains a protected destination with query and hash through login', async () => {
  const user = userEvent.setup();
  const router = renderLogin({
    initialPath: '/projects/campus-connect?view=activity#latest',
  });
  await user.click(
    await screen.findByRole('button', { name: 'Explorar demostración' }),
  );
  expect(
    await screen.findByRole('heading', { name: 'Campus Connect' }),
  ).toBeInTheDocument();
  expect(router.state.location).toMatchObject({
    pathname: '/projects/campus-connect',
    search: '?view=activity',
    hash: '#latest',
  });
  expect(sessionStorage.getItem('pr-gate:login-destination')).toBeNull();
});

it('recovers the saved destination after a provider callback loses router state', async () => {
  saveLoginDestination('/projects/campus-connect');
  const service = createDemoSession();
  await service.login();
  renderLogin({ service });
  expect(
    await screen.findByRole('heading', { name: 'Campus Connect' }),
  ).toBeInTheDocument();
});

it('remembers only the chosen profile when explicitly requested', async () => {
  const user = userEvent.setup();
  renderLogin();
  await screen.findByRole('button', { name: 'Explorar demostración' });
  await user.click(screen.getByRole('radio', { name: 'Estudiante' }));
  await user.click(
    screen.getByRole('checkbox', { name: 'Recordar mi perfil' }),
  );
  await user.click(
    screen.getByRole('button', { name: 'Explorar demostración' }),
  );
  await screen.findByRole('link', { name: 'Campus Connect' });
  expect(localStorage.getItem('pr-gate:login-profile')).toBe('student');
  expect(localStorage.length).toBe(1);
  await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
  expect(
    await screen.findByRole('radio', { name: 'Estudiante' }),
  ).toBeChecked();
});

it('blocks duplicate submissions while authentication is pending', async () => {
  const user = userEvent.setup();
  let finish: () => void = () => {};
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const login = vi.fn(() => pending);
  renderLogin({ service: { ...createDemoSession(), login } });
  await user.dblClick(
    await screen.findByRole('button', { name: 'Explorar demostración' }),
  );
  expect(
    screen.getByRole('button', { name: 'Iniciando sesión…' }),
  ).toBeDisabled();
  expect(login).toHaveBeenCalledOnce();
  await act(async () => {
    finish();
    await pending;
  });
  expect(
    screen.getByRole('button', { name: 'Explorar demostración' }),
  ).toBeEnabled();
});

it('renders authentication errors and allows retry', async () => {
  const user = userEvent.setup();
  const login = vi.fn().mockRejectedValue(new Error('Provider unavailable'));
  renderLogin({ service: { ...createDemoSession(), login }, demo: false });
  await user.click(
    await screen.findByRole('button', { name: 'Iniciar sesión' }),
  );
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'No se pudo iniciar sesión',
  );
  expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled();
});
