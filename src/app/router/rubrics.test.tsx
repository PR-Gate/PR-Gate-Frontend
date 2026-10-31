import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/testing/mocks/server';
import { createDemoSession } from '@/features/users/infrastructure/auth/demo-session.adapter';
import { createDependencies } from '../di/container';
import { AppProviders } from '../providers/app-providers';
import { createAppRouter } from './app-router';
import { useUiStore } from '@/shared/stores/ui.store';
const routers: ReturnType<typeof createAppRouter>[] = [];
afterEach(() => {
  routers.forEach((router) => router.dispose());
  routers.length = 0;
  window.history.replaceState({}, '', '/');
  useUiStore.setState({ sidebarCollapsed: false, sidebarOpen: false });
  vi.restoreAllMocks();
});
async function openRubrics(
  role: 'teacher' | 'student' | 'admin' = 'teacher',
  path = role === 'student' ? '/my-rubric' : '/teacher/rubrics',
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
  await import('@/features/rubrics');
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
async function libraryReady() {
  return screen.findByRole(
    'heading',
    { name: 'Calidad de Software', level: 3 },
    { timeout: 5000 },
  );
}
it('filters the library by name, course and status', async () => {
  const user = userEvent.setup();
  await openRubrics();
  await libraryReady();
  await user.type(
    screen.getByRole('textbox', { name: 'Buscar rúbrica' }),
    'CI/CD',
  );
  expect(
    screen.getByRole('heading', { name: 'Prácticas de CI/CD' }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('heading', { name: 'Calidad de Software', level: 3 }),
  ).not.toBeInTheDocument();
  await user.clear(screen.getByRole('textbox', { name: 'Buscar rúbrica' }));
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Filtrar por curso' }),
    'integrator',
  );
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Filtrar por estado' }),
    'published',
  );
  expect(screen.getByText('No hay rúbricas para mostrar')).toBeInTheDocument();
});
it('saves incomplete drafts and blocks premature publication', async () => {
  const user = userEvent.setup();
  await openRubrics();
  await libraryReady();
  await user.click(screen.getByRole('button', { name: 'Crear rúbrica' }));
  await user.click(screen.getByRole('button', { name: 'Revisar y publicar' }));
  expect(
    (await screen.findAllByRole('alert')).some((element) =>
      element.textContent?.includes('Escribe el nombre de la rúbrica.'),
    ),
  ).toBe(true);
  await user.click(
    screen.getByRole('button', { name: 'Guardar como borrador' }),
  );
  const heading = await screen.findByRole('heading', {
    name: 'Rúbrica sin nombre',
    level: 3,
  });
  expect(
    within(heading.closest('article')!).getByText('Borrador'),
  ).toBeInTheDocument();
});
it('creates criteria and achievement levels, saves a draft and confirms publication', async () => {
  const user = userEvent.setup();
  await openRubrics();
  await libraryReady();
  await user.click(screen.getByRole('button', { name: 'Crear rúbrica' }));
  await user.type(
    screen.getByLabelText('Nombre de la rúbrica'),
    'Rúbrica de pruebas',
  );
  await user.selectOptions(screen.getByLabelText('Curso'), 'software');
  await user.selectOptions(screen.getByLabelText('Sección'), '01');
  await user.click(
    screen.getByRole('button', { name: 'Agregar otro criterio' }),
  );
  await user.type(
    screen.getByLabelText('Nombre del criterio'),
    'Cobertura integrada',
  );
  await user.clear(screen.getByLabelText('Puntaje máximo'));
  await user.type(screen.getByLabelText('Puntaje máximo'), '20');
  await user.selectOptions(
    screen.getByLabelText('Fuente de evidencia'),
    'sonarqube',
  );
  await user.selectOptions(
    screen.getByLabelText('Tipo de evaluación'),
    'automatic-with-review',
  );
  await user.click(screen.getByRole('button', { name: 'Agregar nivel' }));
  await user.type(screen.getByLabelText('Nombre del nivel'), 'Logrado');
  await user.type(
    screen.getByLabelText('Condición'),
    'Cobertura mayor o igual a 70%',
  );
  await user.clear(screen.getByLabelText('Puntaje del nivel'));
  await user.type(screen.getByLabelText('Puntaje del nivel'), '20');
  await user.click(screen.getByRole('button', { name: 'Guardar nivel' }));
  await user.click(screen.getByRole('button', { name: 'Guardar criterio' }));
  expect(screen.getByRole('status')).toHaveTextContent('20 puntos');
  await user.click(
    screen.getByRole('button', { name: 'Guardar como borrador' }),
  );
  let heading = await screen.findByRole('heading', {
    name: 'Rúbrica de pruebas',
    level: 3,
  });
  await user.click(
    within(heading.closest('article')!).getByRole('button', { name: 'Editar' }),
  );
  await user.click(screen.getByRole('button', { name: 'Revisar y publicar' }));
  expect(
    screen.getByRole('dialog', { name: 'Revisar y publicar' }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Publicar rúbrica' }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  heading = screen.getByRole('heading', {
    name: 'Rúbrica de pruebas',
    level: 3,
  });
  expect(
    within(heading.closest('article')!).getByText('Publicada'),
  ).toBeInTheDocument();
}, 15000);
it('duplicates, reorders and deletes criteria with confirmation and warns before discarding', async () => {
  const user = userEvent.setup();
  await openRubrics();
  await libraryReady();
  const draftCard = screen
    .getByRole('heading', { name: 'Evaluación de proyecto final' })
    .closest('article')!;
  await user.click(within(draftCard).getByRole('button', { name: 'Editar' }));
  await user.click(
    screen.getAllByRole('button', { name: 'Duplicar criterio' })[0]!,
  );
  expect(screen.getByRole('status')).toHaveTextContent('25 puntos');
  await user.click(screen.getByRole('button', { name: 'Subir criterio 6' }));
  await user.click(
    screen.getAllByRole('button', { name: 'Eliminar criterio' })[5]!,
  );
  expect(
    screen.getByRole('dialog', { name: 'Eliminar criterio' }),
  ).toBeInTheDocument();
  await user.click(
    screen.getByRole('button', { name: 'Confirmar eliminación' }),
  );
  expect(screen.getByRole('status')).toHaveTextContent('21 puntos');
  await user.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(
    screen.getByRole('dialog', { name: '¿Cerrar sin guardar?' }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Seguir editando' }));
  expect(screen.getByLabelText('Nombre de la rúbrica')).toBeInTheDocument();
});
it('duplicates, archives and deletes a library rubric only after confirmation', async () => {
  const user = userEvent.setup();
  await openRubrics();
  const original = await libraryReady();
  await user.click(
    within(original.closest('article')!).getByRole('button', {
      name: 'Duplicar',
    }),
  );
  let copy = await screen.findByRole('heading', {
    name: 'Calidad de Software (copia)',
  });
  await user.click(
    within(copy.closest('article')!).getByRole('button', { name: 'Archivar' }),
  );
  await user.click(screen.getByRole('button', { name: 'Confirmar archivo' }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  copy = screen.getByRole('heading', { name: 'Calidad de Software (copia)' });
  expect(
    within(copy.closest('article')!).getByText('Archivada'),
  ).toBeInTheDocument();
  await user.click(
    within(copy.closest('article')!).getByRole('button', { name: 'Eliminar' }),
  );
  await user.click(
    screen.getByRole('button', { name: 'Confirmar eliminación' }),
  );
  await waitFor(() =>
    expect(
      screen.queryByRole('heading', { name: 'Calidad de Software (copia)' }),
    ).not.toBeInTheDocument(),
  );
});
it('simulates metadata-only uploads and opens example criteria for review', async () => {
  const user = userEvent.setup();
  const read = vi.spyOn(FileReader.prototype, 'readAsText');
  const readBuffer = vi.spyOn(FileReader.prototype, 'readAsArrayBuffer');
  await openRubrics();
  await libraryReady();
  await user.click(screen.getByRole('button', { name: 'Subir rúbrica' }));
  await user.upload(
    screen.getByLabelText('Selecciona o arrastra un archivo'),
    new File(['sample'], 'Institucional.pdf', { type: 'application/pdf' }),
  );
  await user.click(screen.getByRole('button', { name: 'Simular carga' }));
  await user.click(
    await screen.findByRole('button', { name: 'Revisar criterios simulados' }),
  );
  expect(screen.getByLabelText('Nombre de la rúbrica')).toHaveValue(
    'Institucional',
  );
  expect(
    (screen.getByLabelText('Descripción opcional') as HTMLTextAreaElement)
      .value,
  ).toContain('Criterios de ejemplo para revisar');
  expect(read).not.toHaveBeenCalled();
  expect(readBuffer).not.toHaveBeenCalled();
});
it('shows a read-only student snapshot with evidence and no authoring actions', async () => {
  const user = userEvent.setup();
  await openRubrics('student');
  expect(
    await screen.findByText('15.5 / 20', {}, { timeout: 5000 }),
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Mi rúbrica' })).toBeInTheDocument();
  expect(
    screen.queryByRole('link', { name: 'Rúbricas' }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Crear rúbrica' }),
  ).not.toBeInTheDocument();
  expect(screen.getByText('Cobertura registrada: 72%')).toBeInTheDocument();
  await user.click(
    screen.getByRole('button', { name: 'Ver evidencia completa' }),
  );
  expect(
    screen.getByRole('dialog', { name: 'Evidencia de Cobertura de pruebas' }),
  ).toBeInTheDocument();
  await user.click(
    within(screen.getByRole('dialog')).getByRole('button', { name: 'Cerrar' }),
  );
  await user.click(
    screen.getByRole('button', {
      name: /Seguridad.*Ausencia de vulnerabilidades/,
    }),
  );
  expect(
    screen.getByText('0 vulnerabilidades críticas registradas.'),
  ).toBeInTheDocument();
});
it('rejects direct teacher-route access for students', async () => {
  await openRubrics('student', '/teacher/rubrics');
  expect(
    await screen.findByRole('heading', { name: 'Acceso no autorizado' }),
  ).toBeInTheDocument();
});
it('rejects student-route access for teachers and rubric authoring for admin-only accounts', async () => {
  await openRubrics('teacher', '/my-rubric');
  expect(
    await screen.findByRole('heading', { name: 'Acceso no autorizado' }),
  ).toBeInTheDocument();
});
it('requires a teacher role even for administrators', async () => {
  await openRubrics('admin');
  expect(
    await screen.findByRole('heading', { name: 'Acceso no autorizado' }),
  ).toBeInTheDocument();
});
it('handles failed loading with retry', async () => {
  server.use(
    http.get(
      'http://localhost/api/demo/rubrics',
      () => new HttpResponse(null, { status: 400 }),
    ),
  );
  await openRubrics();
  expect(await screen.findByRole('alert')).toBeInTheDocument();
  server.resetHandlers();
  await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(await libraryReady()).toBeInTheDocument();
});
it('does not request provisional rubric endpoints in real authentication mode', async () => {
  const request = vi.fn(() => HttpResponse.json({}));
  server.use(http.get('http://localhost/api/demo/rubrics', request));
  await openRubrics('teacher', '/teacher/rubrics', false);
  expect(
    await screen.findByText(/La conexión real de rúbricas se habilitará/),
  ).toBeInTheDocument();
  await act(async () => {});
  expect(request).not.toHaveBeenCalled();
});
