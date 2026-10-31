import { delay, http, HttpResponse } from 'msw';
import {
  academicCourses,
  createTeacherOverviewFixture,
} from './teacher-overview.fixtures';
export function createTeacherOverviewHandlers(
  baseUrl = 'http://localhost/api',
  latency = 0,
) {
  return [
    http.get(
      `${baseUrl.replace(/\/$/, '')}/demo/teacher-overview`,
      async ({ request }) => {
        const url = new URL(request.url);
        const course = url.searchParams.get('course') || 'software';
        const period = url.searchParams.get('period') || '30';
        if (
          !academicCourses.some((item) => item.id === course) ||
          !['7', '30'].includes(period)
        )
          return HttpResponse.json(
            { message: 'Filtro inválido' },
            { status: 400 },
          );
        await delay(latency);
        return HttpResponse.json(createTeacherOverviewFixture(course, period));
      },
    ),
  ];
}
