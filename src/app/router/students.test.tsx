import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { delay, http, HttpResponse } from 'msw';
import { createDemoSession } from '@/features/users/infrastructure/auth/demo-session.adapter';
import { createStudentRoster } from '@/testing/mocks/student.fixtures';
import { server } from '@/testing/mocks/server';
import { AppProviders } from '../providers/app-providers';
import { createDependencies } from '../di/container';
import { createAppRouter } from './app-router';
import { useUiStore } from '@/shared/stores/ui.store';
const routers: ReturnType<typeof createAppRouter>[] = [];
afterEach(() => {
  routers.forEach((router) => router.dispose());
  routers.length = 0;
  window.history.replaceState({}, '', '/');
  useUiStore.setState({ sidebarOpen: false, sidebarCollapsed: false });
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function openStudents(
  role: 'teacher' | 'student' | 'admin' = 'teacher',
  path = '/teacher/students',
  demo = true,
) {
  const auth = createDemoSession();
  await auth.login({ profile: role === 'student' ? 'student' : 'teacher' });
  if (role === 'admin')
    vi.spyOn(auth, 'getUser').mockResolvedValue({
      id: 'admin',
      name: 'Admin',
      email: '',
      roles: ['ADMIN'],
    });
  await import('@/features/users/presentation/pages/students.page');
  await import('@/features/users/presentation/pages/student-contribution.page');
  window.history.replaceState({}, '', path);
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
async function rosterReady() {
  return screen.findByRole(
    'link',
    { name: 'Revisar contribución de Juan Pérez' },
    { timeout: 5000 },
  );
}
it('shows course totals, activity signals and all three courses', async () => {
  await openStudents();
  await rosterReady();
  expect(
    screen.getByRole('heading', { name: 'Estudiantes', level: 1 }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole('radio')).toHaveLength(3);
  expect(
    screen.getByRole('progressbar', { name: 'Participación de Juan Pérez' }),
  ).toHaveAttribute('value', '78');
  expect(screen.getByText('Requiere acompañamiento')).toBeInTheDocument();
  expect(
    screen.getByText('La participación es una señal orientativa'),
  ).toBeInTheDocument();
});
it('opens the student section from the teacher dashboard sidebar', async () => {
  const user = userEvent.setup();
  await openStudents('teacher', '/teacher/dashboard');
  await screen.findByRole('img', { name: /32 proyectos/ }, { timeout: 5000 });
  await user.click(screen.getByRole('link', { name: 'Estudiantes' }));
  expect(await rosterReady()).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: 'Estudiantes', level: 1 }),
  ).toBeInTheDocument();
});
it('filters without losing focus and preserves course and search after visiting a detail', async () => {
  const user = userEvent.setup();
  const router = await openStudents();
  await rosterReady();
  const search = screen.getByRole('textbox', { name: 'Buscar estudiante' });
  await user.type(search, 'juan');
  expect(search).toHaveFocus();
  expect(
    screen.queryByRole('link', { name: 'Revisar contribución de Lucía Ramos' }),
  ).not.toBeInTheDocument();
  await user.click(
    screen.getByRole('link', { name: 'Revisar contribución de Juan Pérez' }),
  );
  expect(
    await screen.findByRole('heading', { name: 'Juan Pérez', level: 1 }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: 'Evidencias de contribución' }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: 'Volver a estudiantes' }));
  expect(await rosterReady()).toBeInTheDocument();
  expect(
    screen.getByRole('textbox', { name: 'Buscar estudiante' }),
  ).toHaveValue('juan');
  expect(router.state.location.search).toContain('course=software');
});
it('changes course, resets search and opens the real project route', async () => {
  const user = userEvent.setup();
  await openStudents();
  await rosterReady();
  await user.type(
    screen.getByRole('textbox', { name: 'Buscar estudiante' }),
    'no-match',
  );
  expect(screen.getByText('No hay coincidencias')).toBeInTheDocument();
  await user.click(screen.getByRole('radio', { name: 'Calidad de Software' }));
  await rosterReady();
  expect(
    screen.getByRole('textbox', { name: 'Buscar estudiante' }),
  ).toHaveValue('');
  expect(
    screen.queryByRole('link', { name: 'Revisar contribución de Mateo Ruiz' }),
  ).not.toBeInTheDocument();
  await user.click(
    screen.getAllByRole('link', { name: 'Biblioteca Digital' })[0]!,
  );
  expect(
    await screen.findByRole('heading', {
      name: 'Biblioteca Digital',
      level: 1,
    }),
  ).toBeInTheDocument();
});
it('supports a server-provided empty course', async () => {
  const empty = createStudentRoster();
  server.use(
    http.get('http://localhost/api/demo/students', () =>
      HttpResponse.json({
        ...empty,
        students: [],
        summary: { total: 0, regular_activity: 0, needs_review: 0 },
        course: { ...empty.course, student_count: 0 },
        courses: empty.courses.map((course) =>
          course.id === 'software' ? { ...course, student_count: 0 } : course,
        ),
      }),
    ),
  );
  await openStudents();
  expect(
    await screen.findByText('Aún no hay estudiantes en este curso'),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Exportar lista' })).toBeDisabled();
});
it('handles loading and HTTP errors, then retries', async () => {
  server.use(
    http.get('http://localhost/api/demo/students', async () => {
      await delay(60);
      return new HttpResponse(null, { status: 400 });
    }),
  );
  await openStudents();
  expect(
    await screen.findByRole('status', { name: 'Cargando' }),
  ).toBeInTheDocument();
  expect(await screen.findByRole('alert')).toBeInTheDocument();
  server.resetHandlers();
  await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(await rosterReady()).toBeInTheDocument();
});
it('downloads the visible list as a CSV file', async () => {
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
  await openStudents();
  await rosterReady();
  await user.type(
    screen.getByRole('textbox', { name: 'Buscar estudiante' }),
    'juan',
  );
  await user.click(screen.getByRole('button', { name: 'Exportar lista' }));
  expect(createUrl).toHaveBeenCalledWith(expect.any(Blob));
  expect(click).toHaveBeenCalledOnce();
});
it('denies direct access for a student', async () => {
  await openStudents('student', '/teacher/students/s1?course=software');
  expect(
    await screen.findByRole('heading', { name: 'Acceso no autorizado' }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('link', { name: 'Estudiantes' }),
  ).not.toBeInTheDocument();
});
it('requires the teacher role for administrative accounts', async () => {
  await openStudents('admin');
  expect(
    await screen.findByRole('heading', { name: 'Acceso no autorizado' }),
  ).toBeInTheDocument();
});
it('does not request provisional endpoints with real authentication', async () => {
  const request = vi.fn(() => HttpResponse.json({}));
  server.use(http.get('http://localhost/api/demo/students', request));
  await openStudents('teacher', '/teacher/students', false);
  expect(
    await screen.findByText(/La consulta real de estudiantes se habilitará/),
  ).toBeInTheDocument();
  await act(async () => {});
  expect(request).not.toHaveBeenCalled();
});
