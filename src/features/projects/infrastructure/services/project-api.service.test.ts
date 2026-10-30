import { expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/testing/mocks/server';
import { createHttpClient } from '@/shared/services/http/axios.config';
import { ProjectApiService } from './project-api.service';
const createApi = (expire = vi.fn()) =>
  new ProjectApiService(
    createHttpClient(
      'http://localhost/api',
      async () => 'test-token',
      async () => {
        expire();
      },
    ),
  );
it('consumes the HTTP contract through Axios and MSW', async () => {
  expect(await createApi().getAll()).toHaveLength(6);
});
it('attaches the bearer token and expires the session on 401', async () => {
  const expire = vi.fn();
  server.use(
    http.get('http://localhost/api/projects', ({ request }) => {
      expect(request.headers.get('authorization')).toBe('Bearer test-token');
      return new HttpResponse(null, { status: 401 });
    }),
  );
  await expect(createApi(expire).getAll()).rejects.toMatchObject({
    status: 401,
  });
  expect(expire).toHaveBeenCalledOnce();
});
it('rejects malformed external responses', async () => {
  server.use(
    http.get('http://localhost/api/projects', () =>
      HttpResponse.json({ data: [{ id: 23 }] }),
    ),
  );
  await expect(createApi().getAll()).rejects.toThrow();
});
it('creates and retrieves a project through the adapter', async () => {
  const api = createApi();
  const project = await api.create({
    name: 'Proyecto de prueba',
    description: 'Una descripción completa',
    course: 'Desarrollo Web',
  });
  expect((await api.getById(project.id)).name).toBe('Proyecto de prueba');
});
