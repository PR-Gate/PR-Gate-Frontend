import { expect, it } from 'vitest';
import { createAssessmentFixtures } from '@/testing/mocks/assessment.fixtures';
import { mapAssessment } from './assessment.mapper';
import { assessmentDtoSchema } from './assessment.dto';
it('maps service counters and preserves unconfirmed grades and review flags', () => {
  const model = mapAssessment(
    createAssessmentFixtures(new Date('2026-10-30T15:00:00Z'))[0]!,
  );
  expect(model.pendingReview).toBe(2);
  expect(model.courseName).toBe('Ingeniería de Software');
  expect(model.participants.find((p) => p.id === 's3')).toMatchObject({
    status: 'needs_review',
    score: null,
  });
  expect(model).not.toHaveProperty('pending_review');
});
it('rejects malformed external dates while allowing empty draft dates', () => {
  const fixtures = createAssessmentFixtures(new Date('2026-10-30T15:00:00Z'));
  expect(assessmentDtoSchema.safeParse(fixtures[1]).success).toBe(true);
  expect(
    assessmentDtoSchema.safeParse({ ...fixtures[0], closesAt: 'invalid-date' })
      .success,
  ).toBe(false);
});
