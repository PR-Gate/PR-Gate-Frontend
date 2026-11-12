import { expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/testing/mocks/server';
import { createHttpClient } from '@/shared/services/http/axios.config';
import { GitHubLinkApiService } from './github-link-api.service';

const expire = vi.fn(async () => {});
const api = () =>
  new GitHubLinkApiService(
    createHttpClient(
      'http://localhost/api',
      async () => 'test-token',
      expire,
      true,
    ),
  );
const path = 'http://localhost/api/me/integrations/github';

it('loads the identity confirmed by the backend and sends the session bearer', async () => {
  server.use(
    http.get(path, ({ request }) => {
      expect(request.headers.get('Authorization')).toBe('Bearer test-token');
      return HttpResponse.json({
        userId: 'academic-id',
        githubUserId: 123,
        login: 'ana',
        linkedAt: '2026-11-11T12:00:00Z',
      });
    }),
  );
  expect(await api().get()).toEqual({
    login: 'ana',
    linkedAt: '2026-11-11T12:00:00Z',
  });
});

it('distinguishes an unlinked identity from a disabled or missing endpoint', async () => {
  server.use(
    http.get(path, () =>
      HttpResponse.json({ code: 'GITHUB_NOT_LINKED' }, { status: 404 }),
    ),
  );
  expect(await api().get()).toBeNull();
  server.use(http.get(path, () => new HttpResponse(null, { status: 404 })));
  await expect(api().get()).rejects.toMatchObject({ status: 404 });
});

it('uses the backend authorization URL and rejects an unexpected redirect destination', async () => {
  const expiresAt = '2026-11-11T12:10:00Z';
  server.use(
    http.post(`${path}/authorization`, () =>
      HttpResponse.json({
        authorizationUrl:
          'https://github.com/login/oauth/authorize?client_id=test',
        expiresAt,
      }),
    ),
  );
  expect(await api().authorize()).toMatchObject({ expiresAt });
  server.use(
    http.post(`${path}/authorization`, () =>
      HttpResponse.json({
        authorizationUrl: 'https://other.example/login',
        expiresAt,
      }),
    ),
  );
  await expect(api().authorize()).rejects.toThrow();
});

it('does not turn backend failures into an unlinked account', async () => {
  server.use(http.get(path, () => HttpResponse.json({}, { status: 503 })));
  await expect(api().get()).rejects.toMatchObject({ status: 503 });
});
