import { expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { createHttpClient } from '@/shared/services/http/axios.config';
import { server } from '@/testing/mocks/server';
import { projectFixtures } from '@/testing/mocks/fixtures';
import { testCatalog } from '@/testing/mocks/assessment.fixtures';
import { StudentApiService } from './student-api.service';
import { StudentRepositoryImpl } from '../repositories/student.repository.impl';
const api = () =>
  new StudentApiService(
    createHttpClient(
      'http://localhost/api',
      async () => undefined,
      async () => {},
    ),
  );
it('consumes courses through Axios/MSW and maps external names', async () => {
  const repository = new StudentRepositoryImpl(api());
  const roster = await repository.roster('software');
  expect(roster.total).toBe(5);
  expect(roster.regularActivity).toBe(3);
  expect(roster.students[0]).toMatchObject({
    projectId: 'campus-connect',
    participation: 78,
  });
  for (const student of roster.students)
    expect(
      testCatalog.courses[0]?.students.find((item) => item.id === student.id)
        ?.name,
    ).toBe(student.name);
  expect(roster).not.toHaveProperty('updated_at');
  for (const course of roster.courses) {
    const list = await repository.roster(course.id);
    expect(list.students).toHaveLength(course.studentCount);
    expect(
      list.students.every((student) =>
        projectFixtures.some((project) => project.id === student.projectId),
      ),
    ).toBe(true);
  }
});
it('loads contribution evidence and rejects a student not assigned to the selected course', async () => {
  const repository = new StudentRepositoryImpl(api());
  expect((await repository.contribution('software', 's1')).student.name).toBe(
    'Juan Pérez',
  );
  await expect(repository.contribution('quality', 's5')).rejects.toMatchObject({
    status: 404,
  });
});
it('rejects malformed external responses before rendering', async () => {
  server.use(
    http.get('http://localhost/api/demo/students', () =>
      HttpResponse.json({ students: 'bad' }),
    ),
  );
  await expect(api().roster('software')).rejects.toThrow();
});
