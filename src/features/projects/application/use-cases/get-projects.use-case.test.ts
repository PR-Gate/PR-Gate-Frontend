import { expect, it, vi } from 'vitest';
import type { ProjectRepository } from '../../domain/repositories/project.repository';
import { GetProjectsUseCase } from './get-projects.use-case';
it('returns domain projects from the injected port and forwards cancellation', async () => {
  const repository: ProjectRepository = {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn(),
    create: vi.fn(),
  };
  const signal = new AbortController().signal;
  expect(await new GetProjectsUseCase(repository).execute(signal)).toEqual([]);
  expect(repository.getAll).toHaveBeenCalledWith(signal);
});
it('propagates repository failures', async () => {
  const repository: ProjectRepository = {
    getAll: vi.fn().mockRejectedValue(new Error('offline')),
    getById: vi.fn(),
    create: vi.fn(),
  };
  await expect(new GetProjectsUseCase(repository).execute()).rejects.toThrow(
    'offline',
  );
});
