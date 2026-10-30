import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { delay, http, HttpResponse } from 'msw';
import { server } from '@/testing/mocks/server';
import { createTestWrapper } from '@/testing/test-providers';
import ProjectsPage from './projects.page';
it('renders loading and success, then filters projects', async () => {
  const user = userEvent.setup();
  render(<ProjectsPage />, { wrapper: createTestWrapper() });
  expect(screen.getByRole('status', { name: 'Cargando' })).toBeInTheDocument();
  expect(
    await screen.findByRole('link', { name: 'Campus Connect' }),
  ).toBeInTheDocument();
  await user.type(screen.getByLabelText('Buscar proyectos'), 'Biblioteca');
  expect(
    screen.queryByRole('link', { name: 'Campus Connect' }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: 'Biblioteca Digital' }),
  ).toBeInTheDocument();
});
it('renders an empty state', async () => {
  server.use(
    http.get('http://localhost/api/projects', () =>
      HttpResponse.json({ data: [] }),
    ),
  );
  render(<ProjectsPage />, { wrapper: createTestWrapper() });
  expect(await screen.findByText('Aún no hay proyectos')).toBeInTheDocument();
});
it('renders an error and supports retry', async () => {
  server.use(
    http.get('http://localhost/api/projects', async () => {
      await delay(10);
      return new HttpResponse(null, { status: 500 });
    }),
  );
  render(<ProjectsPage />, { wrapper: createTestWrapper() });
  expect(await screen.findByRole('alert')).toBeInTheDocument();
  server.resetHandlers();
  await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(
    await screen.findByRole('link', { name: 'Campus Connect' }),
  ).toBeInTheDocument();
});
it('validates the form and creates a project with cache invalidation', async () => {
  const user = userEvent.setup();
  render(<ProjectsPage />, { wrapper: createTestWrapper() });
  await screen.findByRole('link', { name: 'Campus Connect' });
  await user.click(screen.getByRole('button', { name: 'Nuevo proyecto' }));
  await user.click(screen.getByRole('button', { name: 'Crear proyecto' }));
  expect(
    await screen.findByText('Escribe al menos 3 caracteres'),
  ).toBeInTheDocument();
  await user.type(
    screen.getByLabelText('Nombre del proyecto'),
    'Proyecto nuevo',
  );
  await user.type(screen.getByLabelText('Curso'), 'Curso de prueba');
  await user.type(
    screen.getByLabelText('Descripción'),
    'Descripción del proyecto nuevo',
  );
  await user.click(screen.getByRole('button', { name: 'Crear proyecto' }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  expect(
    await screen.findByRole('link', { name: 'Proyecto nuevo' }),
  ).toBeInTheDocument();
});
