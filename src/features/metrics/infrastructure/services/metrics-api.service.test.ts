import { expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { createHttpClient } from '@/shared/services/http/axios.config';
import { server } from '@/testing/mocks/server';
import { projectFixtures } from '@/testing/mocks/fixtures';
import { MetricsApiService } from './metrics-api.service';
const api = () =>
  new MetricsApiService(
    createHttpClient(
      'http://localhost/api',
      async () => undefined,
      async () => {},
    ),
  );
it('gets different course and period fixtures through real Axios with MSW', async () => {
  const software = await api().getTeacherOverview('', '30');
  const architecture = await api().getTeacherOverview('architecture', '7');
  expect(software.total_projects).toBe(32);
  expect(architecture.course.id).toBe('architecture');
  expect(architecture.evaluated_projects).toBe(8);
  for (const row of [...software.projects, ...architecture.projects])
    expect(projectFixtures.some((project) => project.id === row.id)).toBe(true);
});
it('rejects malformed contracts before they reach the UI', async () => {
  server.use(
    http.get('http://localhost/api/demo/teacher-overview', () =>
      HttpResponse.json({ total_projects: 'bad' }),
    ),
  );
  await expect(api().getTeacherOverview('', '30')).rejects.toThrow();
});
it('provides an empty fixture and rejects unknown filters', async () => {
  expect((await api().getTeacherOverview('web', '30')).projects).toEqual([]);
  await expect(api().getTeacherOverview('invalid', '30')).rejects.toMatchObject(
    { status: 400 },
  );
});
