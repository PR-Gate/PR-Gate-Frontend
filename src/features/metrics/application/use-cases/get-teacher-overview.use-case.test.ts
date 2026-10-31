import { expect, it, vi } from 'vitest';
import { GetTeacherOverviewUseCase } from './get-teacher-overview.use-case';
it('forwards course, period and cancellation to the injected port', async () => {
  const getOverview = vi.fn().mockResolvedValue({ totalProjects: 32 });
  const useCase = new GetTeacherOverviewUseCase({ getOverview });
  const signal = new AbortController().signal;
  expect(await useCase.execute('software', '7', signal)).toEqual({
    totalProjects: 32,
  });
  expect(getOverview).toHaveBeenCalledWith('software', '7', signal);
});
it('propagates repository errors', async () => {
  const useCase = new GetTeacherOverviewUseCase({
    getOverview: vi.fn().mockRejectedValue(new Error('offline')),
  });
  await expect(useCase.execute('', '30')).rejects.toThrow('offline');
});
