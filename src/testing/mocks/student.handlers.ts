import { delay, http, HttpResponse } from 'msw';
import {
  createStudentContribution,
  createStudentRoster,
  studentCourses,
} from './student.fixtures';
export function createStudentHandlers(
  baseUrl = 'http://localhost/api',
  latency = 0,
) {
  const root = `${baseUrl.replace(/\/$/, '')}/demo/students`;
  return [
    http.get(root, async ({ request }) => {
      await delay(latency);
      const course =
        new URL(request.url).searchParams.get('course') || 'software';
      if (!studentCourses.some((item) => item.id === course))
        return HttpResponse.json({}, { status: 404 });
      return HttpResponse.json(createStudentRoster(course));
    }),
    http.get(`${root}/:studentId`, async ({ request, params }) => {
      await delay(latency);
      const course = new URL(request.url).searchParams.get('course');
      if (!course || !studentCourses.some((item) => item.id === course))
        return HttpResponse.json({}, { status: 404 });
      const result = createStudentContribution(
        course,
        String(params.studentId),
      );
      return result
        ? HttpResponse.json(result)
        : HttpResponse.json({}, { status: 404 });
    }),
  ];
}
