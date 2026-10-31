import { expect, it } from 'vitest';
import { createTeacherOverviewFixture } from '@/testing/mocks/teacher-overview.fixtures';
import { mapTeacherOverview } from './teacher-overview.mapper';
it('maps external timestamps and field names without deriving grades or gate results', () => {
  const dto = createTeacherOverviewFixture();
  const model = mapTeacherOverview(dto);
  expect(model.generatedAt).toEqual(new Date(dto.generated_at));
  expect(model.projects[0]?.lastCommit).toBeInstanceOf(Date);
  expect(model.activities[0]?.occurredAt).toBeInstanceOf(Date);
  expect(model.projects[0]?.grade).toBe(dto.projects[0]?.grade);
  expect(model.distribution).toEqual(dto.distribution);
  expect(model).not.toHaveProperty('generated_at');
});
