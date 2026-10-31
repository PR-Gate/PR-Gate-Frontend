import { expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/testing/mocks/server';
import { createHttpClient } from '@/shared/services/http/axios.config';
import { createRubricFixtures } from '@/testing/mocks/rubric.fixtures';
import { RubricApiService } from './rubric-api.service';
import { RubricRepositoryImpl } from './rubric.repository.impl';
const api = () =>
  new RubricApiService(
    createHttpClient(
      'http://localhost/api',
      async () => undefined,
      async () => {},
    ),
  );
it('maps external fields and supports the complete draft lifecycle through Axios/MSW', async () => {
  const repository = new RubricRepositoryImpl(api());
  const library = await repository.library();
  expect(library.rubrics[0]?.totalScore).toBe(20);
  expect(library.rubrics[0]).not.toHaveProperty('total_score');
  const draft = await repository.duplicate('quality-rubric');
  expect(draft.status).toBe('draft');
  expect(draft.criteria[0]?.id).not.toBe('code');
  const published = await repository.publish(draft.id);
  expect(published.status).toBe('published');
  expect((await repository.archive(draft.id)).status).toBe('archived');
  await repository.remove(draft.id);
  expect((await repository.library()).rubrics).toHaveLength(4);
});
it('keeps the assigned version and student score immutable after authoring changes', async () => {
  const repository = new RubricRepositoryImpl(api());
  const before = await repository.student();
  await repository.remove('quality-rubric');
  const after = await repository.student();
  expect(after).toEqual(before);
  expect(after?.score).toBe(15.5);
  expect(
    after?.results.find((result) => result.criterionId === 'coverage'),
  ).toMatchObject({
    score: 3,
    percentage: 60,
    technicalResult: 'Cobertura registrada: 72%',
  });
});
it('rejects invalid publication and immutable published edits', async () => {
  const repository = new RubricRepositoryImpl(api());
  const saved = await repository.save({
    name: '',
    courseId: '',
    sectionId: '',
    description: '',
    expectedScore: 20,
    version: '1.0',
    criteria: [],
  });
  await expect(repository.publish(saved.id)).rejects.toMatchObject({
    status: 422,
  });
  await expect(
    repository.save(createRubricFixtures()[0]!, 'quality-rubric'),
  ).rejects.toMatchObject({ status: 409 });
});
it('previews only file metadata, validates file size and rejects malformed HTTP responses', async () => {
  const service = api();
  const preview = await service.importPreview({
    name: 'Institucional.pdf',
    size: 125,
    type: 'application/pdf',
  });
  expect(preview.criteria).toHaveLength(5);
  expect(preview.description).toContain('No se ha leído');
  await expect(
    service.importPreview({ name: 'a.pdf', size: 11 * 1024 * 1024, type: '' }),
  ).rejects.toMatchObject({ status: 422 });
  server.use(
    http.get('http://localhost/api/demo/rubrics', () =>
      HttpResponse.json({ data: [{ total_score: 'bad' }] }),
    ),
  );
  await expect(service.library()).rejects.toThrow();
});
