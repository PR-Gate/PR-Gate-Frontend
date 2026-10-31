import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { http, HttpResponse, delay } from 'msw';
import { AppProviders } from '../providers/app-providers';
import { createDependencies } from '../di/container';
import { createAppRouter } from './app-router';
import { createDemoSession } from '@/features/users/infrastructure/auth/demo-session.adapter';
import { server } from '@/testing/mocks/server';
import { useUiStore } from '@/shared/stores/ui.store';
import { limaInput } from '@/features/assessments/presentation/schemas/test.schema';
const routers: ReturnType<typeof createAppRouter>[] = [];
afterEach(() => {
  routers.forEach((router) => router.dispose());
  routers.length = 0;
  window.history.replaceState({}, '', '/');
  useUiStore.setState({ sidebarCollapsed: false, sidebarOpen: false });
  vi.restoreAllMocks();
});
async function openTests(
  path = '/teacher/evaluations',
  student = false,
  demo = true,
  adminOnly = false,
) {
  const auth = createDemoSession();
  await auth.login({ profile: student ? 'student' : 'teacher' });
  if (adminOnly)
    vi.spyOn(auth, 'getUser').mockResolvedValue({
      id: 'admin',
      name: 'Administrador',
      email: 'admin@example.test',
      roles: ['ADMIN'],
    });
  await import('@/features/assessments');
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
async function startWizard(
  user: ReturnType<typeof userEvent.setup>,
  title: string,
) {
  await screen.findByRole(
    'link',
    {
      name: 'Quality Gates y métricas de código',
    },
    { timeout: 5000 },
  );
  await user.click(screen.getByRole('button', { name: 'Crear un test' }));
  await user.type(screen.getByLabelText('¿Cómo se llama el test?'), title);
  await user.selectOptions(
    screen.getByLabelText('¿Para qué curso es?'),
    'software',
  );
  await user.click(screen.getByRole('button', { name: 'Siguiente' }));
}
it('shows four states, only three overview indicators and useful search', async () => {
  const user = userEvent.setup();
  await openTests();
  await screen.findByRole(
    'link',
    {
      name: 'Quality Gates y métricas de código',
    },
    { timeout: 5000 },
  );
  expect(
    screen.getByRole('heading', { name: 'Tests para tus estudiantes' }),
  ).toBeInTheDocument();
  for (const text of [
    'Tests publicados',
    'Alumnos por responder',
    'Respuestas por revisar',
    'Borrador',
    'Programado',
    'Publicado',
    'Finalizado',
  ])
    expect(screen.getByText(text)).toBeInTheDocument();
  await user.type(screen.getByLabelText('Buscar test'), 'inexistente');
  expect(screen.getByText('No encontramos ese test')).toBeInTheDocument();
});
it('validates basics and saves an incomplete draft without publishing', async () => {
  const user = userEvent.setup();
  await openTests();
  await screen.findByRole(
    'link',
    {
      name: 'Quality Gates y métricas de código',
    },
    { timeout: 5000 },
  );
  await user.click(screen.getByRole('button', { name: 'Crear un test' }));
  await user.click(screen.getByRole('button', { name: 'Siguiente' }));
  expect(
    await screen.findByText('Escribe al menos 3 caracteres'),
  ).toBeInTheDocument();
  await user.type(
    screen.getByLabelText('¿Cómo se llama el test?'),
    'Mi borrador nuevo',
  );
  await user.selectOptions(
    screen.getByLabelText('¿Para qué curso es?'),
    'software',
  );
  await user.click(screen.getByRole('button', { name: 'Siguiente' }));
  await user.click(screen.getByRole('button', { name: 'Siguiente' }));
  await user.click(
    screen.getByRole('button', { name: 'Guardar como borrador' }),
  );
  expect(
    await screen.findByRole('heading', { name: 'Mi borrador nuevo', level: 1 }),
  ).toBeInTheDocument();
  expect(screen.getByText('Borrador')).toBeInTheDocument();
  expect(
    screen.getByText('Este borrador aún no se ha enviado a los alumnos.'),
  ).toBeInTheDocument();
});
it('creates questions, selects a team, confirms publishing and opens student responses', async () => {
  const user = userEvent.setup();
  await openTests();
  await startWizard(user, 'Test publicado de prueba');
  await user.click(
    screen.getByRole('button', { name: 'Usar pregunta guardada' }),
  );
  await user.click(
    screen.getAllByRole('button', { name: 'Usar esta pregunta' })[0]!,
  );
  await user.click(screen.getByRole('button', { name: 'Crear pregunta' }));
  await user.selectOptions(screen.getByLabelText('Tipo de pregunta'), 'open');
  await user.type(
    screen.getByLabelText('Enunciado'),
    'Explica cómo mejorarías la cobertura del equipo.',
  );
  await user.clear(screen.getByLabelText('Puntaje'));
  await user.type(screen.getByLabelText('Puntaje'), '3');
  await user.click(screen.getByRole('button', { name: 'Guardar pregunta' }));
  expect(
    screen.getByText('2 preguntas · 5 puntos en total'),
  ).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Subir pregunta 2' }));
  await user.click(screen.getByRole('button', { name: 'Siguiente' }));
  await user.click(screen.getByLabelText('Equipos específicos'));
  await user.click(screen.getByLabelText('Kernel'));
  expect(screen.getByText('3 estudiantes seleccionados')).toBeInTheDocument();
  await user.type(
    screen.getByLabelText('Fecha y hora de apertura (Lima)'),
    limaInput(new Date(Date.now() - 3600000).toISOString()),
  );
  await user.type(
    screen.getByLabelText('Fecha y hora límite (Lima)'),
    limaInput(new Date(Date.now() + 86400000).toISOString()),
  );
  await user.click(screen.getByRole('button', { name: 'Publicar test' }));
  expect(
    screen.getByRole('heading', { name: 'Revisa antes de publicar' }),
  ).toBeInTheDocument();
  await user.click(
    screen.getByRole('button', { name: 'Confirmar publicación' }),
  );
  expect(
    await screen.findByRole('heading', {
      name: 'Test publicado de prueba',
      level: 1,
    }),
  ).toBeInTheDocument();
  expect(screen.getByText('Publicado')).toBeInTheDocument();
  await user.click(screen.getByRole('tab', { name: 'Estudiantes' }));
  expect(
    screen.getByRole('rowheader', { name: 'Juan Pérez' }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('rowheader', { name: 'Diego López' }),
  ).not.toBeInTheDocument();
}, 15000);
it('reviews an open answer and receives updated results from the service', async () => {
  const user = userEvent.setup();
  await openTests('/teacher/evaluations/quality-gates?tab=students');
  await screen.findByRole('heading', { name: 'Estudiantes y respuestas' });
  const row = screen
    .getByRole('rowheader', { name: 'Diego López' })
    .closest('tr')!;
  await user.click(within(row).getByRole('button', { name: 'Revisar' }));
  expect(screen.getByText('Requiere revisión docente')).toBeInTheDocument();
  await user.type(
    screen.getByLabelText('Puntaje de la pregunta 3 (máximo 3)'),
    '3',
  );
  await user.type(
    screen.getByLabelText('Retroalimentación para el alumno'),
    'Buena reflexión del equipo.',
  );
  await user.click(
    screen.getByRole('button', { name: 'Guardar revisión docente' }),
  );
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  expect(
    within(
      screen.getByRole('rowheader', { name: 'Diego López' }).closest('tr')!,
    ).getByText('Calificado'),
  ).toBeInTheDocument();
  await user.click(screen.getByRole('tab', { name: 'Resultados' }));
  expect(screen.getByText(/5[.,]5 \/ 6/)).toBeInTheDocument();
});
it('records a simulated reminder and never claims to send real mail', async () => {
  const user = userEvent.setup();
  await openTests();
  await screen.findByRole(
    'link',
    {
      name: 'Quality Gates y métricas de código',
    },
    { timeout: 5000 },
  );
  await user.click(screen.getByRole('button', { name: 'Enviar recordatorio' }));
  expect(
    await screen.findByText(/No se envió correo real/),
  ).toBeInTheDocument();
});
it('supports HTTP errors and retry', async () => {
  server.use(
    http.get('http://localhost/api/demo/assessments', async () => {
      await delay(25);
      return new HttpResponse(null, { status: 400 });
    }),
  );
  await openTests();
  expect(await screen.findByRole('alert')).toBeInTheDocument();
  server.resetHandlers();
  await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(
    await screen.findByRole(
      'link',
      {
        name: 'Quality Gates y métricas de código',
      },
      { timeout: 5000 },
    ),
  ).toBeInTheDocument();
});
it('denies student access even by direct URL', async () => {
  await openTests('/teacher/evaluations/quality-gates', true);
  expect(
    await screen.findByRole('heading', { name: 'Acceso no autorizado' }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('link', { name: 'Tests y evaluaciones' }),
  ).not.toBeInTheDocument();
});
it('does not request mock endpoints in real authentication mode', async () => {
  const request = vi.fn(() => HttpResponse.json({}));
  server.use(http.get('http://localhost/api/demo/assessments', request));
  await openTests('/teacher/evaluations', false, false);
  expect(
    await screen.findByText(/La conexión real se habilitará/),
  ).toBeInTheDocument();
  await act(async () => {});
  expect(request).not.toHaveBeenCalled();
});
it('requires the teacher role even for an administrator', async () => {
  await openTests('/teacher/evaluations', false, true, true);
  expect(
    await screen.findByRole('heading', { name: 'Acceso no autorizado' }),
  ).toBeInTheDocument();
});
