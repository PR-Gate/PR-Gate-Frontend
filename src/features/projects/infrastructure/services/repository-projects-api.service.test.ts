import { expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/testing/mocks/server';
import { createHttpClient } from '@/shared/services/http/axios.config';
import { RepositoryProjectsApi } from './repository-projects-api.service';
import { privateRepositoryPage } from '@/testing/mocks/private-repository.fixture';

const path = 'http://localhost/api/me/integrations/github/repositories';
const api = () =>
  new RepositoryProjectsApi(
    createHttpClient(
      'http://localhost/api',
      async () => 'test-token',
      vi.fn(async () => {}),
      true,
    ),
  );

it('queries organizations through the authenticated backend with pagination', async () => {
  server.use(
    http.get(path + '/organizations', ({ request }) => {
      expect(request.headers.get('Authorization')).toBe('Bearer test-token');
      expect(new URL(request.url).searchParams.get('page')).toBe('2');
      return HttpResponse.json({ items: [], page: 2, hasNext: false });
    }),
  );
  expect(await api().organizations(2)).toEqual({
    items: [],
    page: 2,
    hasNext: false,
  });
});

it('sends the selected organization without leaking it into the personal repository query', async () => {
  const organizations: (string | null)[] = [];
  server.use(
    http.get(path, ({ request }) => {
      organizations.push(new URL(request.url).searchParams.get('organization'));
      return HttpResponse.json({ items: [], page: 1, hasNext: false });
    }),
  );
  await api().repositories(1, undefined, 'my-university');
  await api().repositories(1);
  expect(organizations).toEqual(['my-university', null]);
});

it('keeps a rejected organization membership as an error', async () => {
  server.use(http.get(path, () => HttpResponse.json({}, { status: 403 })));
  await expect(
    api().repositories(1, undefined, 'other-org'),
  ).rejects.toMatchObject({ status: 403 });
});

it('preserves private visibility returned by the authorized backend', async () => {
  server.use(http.get(path, () => HttpResponse.json(privateRepositoryPage)));
  const result = await api().repositories(1, undefined, 'fixture-university');
  expect(result.items[0]?.privateRepository).toBe(true);
  expect(result.items[0]?.fullName).toBe('fixture-university/private-project');
});

it('keeps GitHub renewal errors separate from expiration of the PR Gate session', async () => {
  server.use(
    http.get(path, () =>
      HttpResponse.json(
        { code: 'GITHUB_REAUTHORIZATION_REQUIRED' },
        { status: 409 },
      ),
    ),
  );
  await expect(api().repositories(1)).rejects.toMatchObject({
    status: 409,
    code: 'GITHUB_REAUTHORIZATION_REQUIRED',
  });
});
