import { expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/testing/mocks/server';
import { createHttpClient } from '@/shared/services/http/axios.config';
import { savedTestQuestions } from '@/testing/mocks/assessment.fixtures';
import { AssessmentApiService } from './assessment-api.service';
import { AssessmentRepositoryImpl } from './assessment.repository.impl';
import type { TestDraft } from '../domain/assessment';
const api = () =>
  new AssessmentApiService(
    createHttpClient(
      'http://localhost/api',
      async () => undefined,
      async () => {},
    ),
  );
function draft(): TestDraft {
  return {
    title: 'Test de prueba',
    courseId: 'software',
    durationMinutes: 45,
    instructions: '',
    questions: structuredClone(savedTestQuestions),
    assignment: { mode: 'teams', ids: ['kernel'] },
    opensAt: new Date(Date.now() + 86400000).toISOString(),
    closesAt: new Date(Date.now() + 2 * 86400000).toISOString(),
  };
}
it('maps the external list and saves, retrieves and schedules a draft through MSW', async () => {
  const repository = new AssessmentRepositoryImpl(api());
  expect((await repository.list()).tests[0]?.courseName).toBe(
    'Ingeniería de Software',
  );
  const saved = await repository.save(draft());
  expect(saved.status).toBe('draft');
  expect(saved.assignedCount).toBe(3);
  expect((await repository.get(saved.id)).title).toBe('Test de prueba');
  expect((await repository.publish(saved.id)).status).toBe('scheduled');
});
it('rejects invalid responses and forbids editing an already published test', async () => {
  await expect(api().save(draft(), 'quality-gates')).rejects.toMatchObject({
    status: 409,
  });
  server.use(
    http.get('http://localhost/api/demo/assessments', () =>
      HttpResponse.json({ data: 'bad' }),
    ),
  );
  await expect(api().list()).rejects.toThrow();
});
it('records reminders and requires a complete teacher review', async () => {
  const service = api();
  expect(await service.remind('quality-gates', 's1')).toEqual({
    recipients: 1,
  });
  await expect(
    service.review('quality-gates', {
      participantId: 's3',
      scores: { 'q-gate': 99 },
      feedback: '',
    }),
  ).rejects.toMatchObject({ status: 422 });
  const result = await service.review('quality-gates', {
    participantId: 's3',
    scores: { 'q-gate': 2, 'q-coverage': 1, 'q-open': 3 },
    feedback: 'Buena reflexión.',
  });
  expect(result.participants.find((p) => p.id === 's3')).toMatchObject({
    status: 'graded',
    score: 6,
  });
  expect(result.results.average).toBe(5.5);
});
it('does not publish a draft without questions or recipients', async () => {
  const service = api();
  const saved = await service.save({
    ...draft(),
    questions: [],
    assignment: { mode: 'students', ids: [] },
  });
  await expect(service.publish(saved.id)).rejects.toMatchObject({
    status: 422,
  });
});
