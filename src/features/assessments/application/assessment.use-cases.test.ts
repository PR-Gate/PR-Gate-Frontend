import { expect, it, vi } from 'vitest';
import type { AssessmentRepository } from '../domain/assessment.repository';
import {
  GetTestsUseCase,
  PublishTestUseCase,
  SaveTestDraftUseCase,
} from './assessment.use-cases';
const repository = (): AssessmentRepository => ({
  list: vi.fn().mockResolvedValue({ tests: [] }),
  get: vi.fn(),
  catalog: vi.fn(),
  save: vi.fn().mockResolvedValue({ id: 'draft' }),
  publish: vi.fn(),
  remind: vi.fn(),
  review: vi.fn(),
});
it('queries through the injected port and forwards cancellation', async () => {
  const port = repository();
  const signal = new AbortController().signal;
  expect(await new GetTestsUseCase(port).execute(signal)).toEqual({
    tests: [],
  });
  expect(port.list).toHaveBeenCalledWith(signal);
});
it('saving a draft never implicitly publishes it', async () => {
  const port = repository();
  await new SaveTestDraftUseCase(port).execute({
    title: 'Repaso',
    courseId: 'software',
    durationMinutes: 45,
    instructions: '',
    questions: [],
    assignment: { mode: 'all', ids: [] },
    opensAt: '',
    closesAt: '',
  });
  expect(port.save).toHaveBeenCalledOnce();
  expect(port.publish).not.toHaveBeenCalled();
  await new PublishTestUseCase(port).execute('draft');
  expect(port.publish).toHaveBeenCalledWith('draft');
});
