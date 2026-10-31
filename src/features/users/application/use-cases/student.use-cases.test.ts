import { expect, it, vi } from 'vitest';
import { GetCourseStudentsUseCase } from './get-course-students.use-case';
import { GetStudentContributionUseCase } from './get-student-contribution.use-case';
it('forwards course and cancellation to the repository port', async () => {
  const repository = {
    roster: vi.fn().mockResolvedValue({ students: [] }),
    contribution: vi.fn(),
  };
  const signal = new AbortController().signal;
  await new GetCourseStudentsUseCase(repository).execute('software', signal);
  expect(repository.roster).toHaveBeenCalledWith('software', signal);
});
it('scopes a contribution query to both course and student', async () => {
  const repository = {
    roster: vi.fn(),
    contribution: vi.fn().mockRejectedValue(new Error('not found')),
  };
  await expect(
    new GetStudentContributionUseCase(repository).execute('quality', 's5'),
  ).rejects.toThrow('not found');
  expect(repository.contribution).toHaveBeenCalledWith(
    'quality',
    's5',
    undefined,
  );
});
