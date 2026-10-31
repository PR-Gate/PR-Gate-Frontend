import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { delay, http, HttpResponse } from 'msw';
import { server } from '@/testing/mocks/server';
import { createTeacherOverviewFixture } from '@/testing/mocks/teacher-overview.fixtures';
import { createDemoSession } from '@/features/users/infrastructure/auth/demo-session.adapter';
import { AppProviders } from '../providers/app-providers';
import { createDependencies } from '../di/container';
import { createAppRouter } from './app-router';
import { useUiStore } from '@/shared/stores/ui.store';
const routers: ReturnType<typeof createAppRouter>[] = [];
afterEach(() => {
  routers.forEach((router) => router.dispose());
  routers.length = 0;
  window.history.replaceState({}, '', '/');
  useUiStore.setState({ sidebarCollapsed: false, sidebarOpen: false });
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function renderDashboard(student = false, demo = true) {
  const auth = createDemoSession();
  await auth.login({ profile: student ? 'student' : 'teacher' });
  window.history.replaceState({}, '', '/teacher/dashboard');
  const router = createAppRouter(demo);
  routers.push(router);
  render(
    <AppProviders
      dependencies={createDependencies('http://localhost/api', auth)}
    >
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return router;
}
it('renders the real guarded route, KPIs, chart and project detail with mocks', async () => {
  const user = userEvent.setup();
  await renderDashboard();
  expect(
    await screen.findByRole('heading', { name: /Buenos días, Andrea/ }),
  ).toBeInTheDocument();
  expect(
    await screen.findByRole('img', { name: /32 proyectos/ }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('progressbar', { name: 'Estudiantes activos' }),
  ).toHaveAttribute('value', '86');
  expect(
    screen.getByRole('button', { name: 'Conectar GitHub' }),
  ).toBeDisabled();
  await user.click(screen.getByRole('link', { name: 'Ver Campus Connect' }));
  expect(
    await screen.findByRole('heading', { name: 'Campus Connect' }),
  ).toBeInTheDocument();
});
it('changes course and period and supports empty and no-match states', async () => {
  const user = userEvent.setup();
  await renderDashboard();
  await screen.findByRole('img', { name: /32 proyectos/ });
  await user.type(
    screen.getByRole('textbox', { name: 'Buscar proyecto o equipo' }),
    'no-match',
  );
  expect(
    screen.getByText('No hay coincidencias para tu búsqueda.'),
  ).toBeInTheDocument();
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Curso activo' }),
    'architecture',
  );
  expect(
    await screen.findByRole('link', { name: 'Ver Biblioteca Digital' }),
  ).toBeInTheDocument();
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Periodo' }),
    '7',
  );
  await waitFor(() =>
    expect(screen.getByText('5 h 20 min')).toBeInTheDocument(),
  );
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Curso activo' }),
    'web',
  );
  expect(
    await screen.findByText('No hay proyectos que requieran atención.'),
  ).toBeInTheDocument();
  expect(
    screen.getByText('Aún no hay proyectos evaluados en este curso.'),
  ).toBeInTheDocument();
});
it('shows loading, handles an HTTP failure and retries successfully', async () => {
  server.use(
    http.get('http://localhost/api/demo/teacher-overview', async () => {
      await delay(80);
      return new HttpResponse(null, { status: 400 });
    }),
  );
  const user = userEvent.setup();
  await renderDashboard();
  expect(
    await screen.findByRole('status', { name: 'Cargando' }),
  ).toBeInTheDocument();
  expect(await screen.findByRole('alert')).toBeInTheDocument();
  server.resetHandlers();
  await user.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(
    await screen.findByRole('img', { name: /32 proyectos/ }),
  ).toBeInTheDocument();
});
it('opens the dashboard student sample and previews without changing teacher roles', async () => {
  const user = userEvent.setup();
  await renderDashboard();
  await screen.findByRole('img', { name: /32 proyectos/ });
  await user.click(
    screen.getByRole('button', { name: 'Ver muestra de estudiantes' }),
  );
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByText('Juan Pérez')).toBeInTheDocument();
  await user.click(within(dialog).getByRole('button', { name: 'Cerrar' }));
  await user.click(screen.getByRole('button', { name: 'Vista estudiante' }));
  expect(screen.getByText('Vista previa de estudiante')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Resumen' })).toBeInTheDocument();
  await user.click(
    screen.getByRole('button', { name: 'Volver a vista docente' }),
  );
  expect(screen.getByRole('img', { name: /32 proyectos/ })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Contraer menú' }));
  expect(
    screen.getByRole('button', { name: 'Expandir menú' }),
  ).toBeInTheDocument();
});
it('downloads a real CSV file, including only the filtered attention rows', async () => {
  const createUrl = vi.fn(() => 'blob:test');
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = createUrl;
      static revokeObjectURL = vi.fn();
    },
  );
  const click = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => {});
  const user = userEvent.setup();
  await renderDashboard();
  await screen.findByRole('img', { name: /32 proyectos/ });
  await user.type(
    screen.getByRole('textbox', { name: 'Buscar proyecto o equipo' }),
    'Kernel',
  );
  await user.click(screen.getByRole('button', { name: 'Exportar reporte' }));
  expect(createUrl).toHaveBeenCalledWith(expect.any(Blob));
  expect(click).toHaveBeenCalledOnce();
  vi.unstubAllGlobals();
});
it('blocks students and does not call the provisional endpoint with mocks disabled', async () => {
  await renderDashboard(true);
  expect(
    await screen.findByRole('heading', { name: 'Acceso no autorizado' }),
  ).toBeInTheDocument();
});
it('keeps the provisional teacher endpoint disabled for real OIDC mode', async () => {
  const request = vi.fn(() =>
    HttpResponse.json(createTeacherOverviewFixture()),
  );
  server.use(http.get('http://localhost/api/demo/teacher-overview', request));
  await renderDashboard(false, false);
  expect(
    await screen.findByText(
      /El resumen está disponible en la demostración local/,
    ),
  ).toBeInTheDocument();
  await act(async () => {});
  expect(request).not.toHaveBeenCalled();
});
