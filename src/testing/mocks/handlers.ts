import { delay, http, HttpResponse } from 'msw';
import { z } from 'zod';
import { projectFixtures } from './fixtures';
export function createProjectHandlers(
  baseUrl = 'http://localhost/api',
  latency = 0,
) {
  const base = baseUrl.replace(/\/$/, '');
  const projects = structuredClone(projectFixtures);
  return [
    http.get(`${base}/projects`, async () => {
      await delay(latency);
      return HttpResponse.json({ data: projects });
    }),
    http.get(`${base}/projects/:id`, async ({ params }) => {
      await delay(latency);
      const project = projects.find((item) => item.id === params.id);
      return project
        ? HttpResponse.json(project)
        : HttpResponse.json(
            { message: 'Proyecto no encontrado' },
            { status: 404 },
          );
    }),
    http.post(`${base}/projects`, async ({ request }) => {
      await delay(latency);
      const result = z
        .object({
          name: z.string().min(3),
          description: z.string().min(10),
          course_name: z.string().min(3),
          repository_url: z.url().nullable(),
        })
        .safeParse(await request.json());
      if (!result.success)
        return HttpResponse.json(
          { message: 'Datos inválidos' },
          { status: 422 },
        );
      const project = {
        ...result.data,
        id: crypto.randomUUID(),
        status: 'ACTIVE' as const,
        member_count: 0,
        updated_at: new Date().toISOString(),
      };
      projects.unshift(project);
      return HttpResponse.json(project, { status: 201 });
    }),
  ];
}
