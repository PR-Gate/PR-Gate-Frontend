import { expect, it, vi } from 'vitest';
import type { RubricRepository } from '../domain/rubric.repository';
import {
  GetRubricLibraryUseCase,
  SaveRubricDraftUseCase,
} from './rubric.use-cases';
const repository = (): RubricRepository => ({
  library: vi.fn().mockResolvedValue({ rubrics: [], courses: [] }),
  save: vi.fn().mockResolvedValue({ id: 'draft' }),
  publish: vi.fn(),
  duplicate: vi.fn(),
  archive: vi.fn(),
  remove: vi.fn(),
  importPreview: vi.fn(),
  student: vi.fn(),
});
it('uses the injected port and forwards cancellation', async () => {
  const port = repository();
  const signal = new AbortController().signal;
  await new GetRubricLibraryUseCase(port).execute(signal);
  expect(port.library).toHaveBeenCalledWith(signal);
});
it('allows saving an incomplete draft without implicitly publishing', async () => {
  const port = repository();
  await new SaveRubricDraftUseCase(port).execute({
    name: '',
    description: '',
    courseId: '',
    sectionId: '',
    expectedScore: 20,
    version: '1.0',
    criteria: [],
  });
  expect(port.save).toHaveBeenCalledOnce();
  expect(port.publish).not.toHaveBeenCalled();
});
