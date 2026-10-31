import { z } from 'zod';
const score = z.number().min(0).max(1000);
const level = z.object({
  id: z.string(),
  name: z.string().max(200),
  description: z.string().max(3000),
  condition: z.string().max(1000),
  score,
});
const criterion = z.object({
  id: z.string(),
  name: z.string().max(200),
  description: z.string().max(3000),
  maxScore: score,
  evidenceSource: z.enum([
    'sonarqube',
    'quality-gate',
    'github',
    'gitlab',
    'pipeline',
    'academic-test',
    'teacher-review',
    'manual',
  ]),
  evaluationType: z.enum([
    'automatic',
    'teacher-review',
    'automatic-with-review',
  ]),
  levels: z.array(level).max(20),
});
export const rubricDraftSchema = z.object({
  name: z.string().max(200),
  description: z.string().max(3000),
  courseId: z.string(),
  sectionId: z.string(),
  expectedScore: z.number().positive().max(1000),
  version: z.string(),
  criteria: z.array(criterion).max(100),
});
export const rubricDtoSchema = rubricDraftSchema.extend({
  id: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  total_score: score,
  updated_at: z.iso.datetime(),
});
export const rubricLibrarySchema = z.object({
  data: z.array(rubricDtoSchema),
  courses: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      expectedScore: z.number().positive(),
      sections: z.array(z.object({ id: z.string(), name: z.string() })),
    }),
  ),
});
export const studentRubricSchema = z
  .object({
    rubric: rubricDtoSchema,
    course_name: z.string(),
    project_name: z.string(),
    review_status: z.string(),
    score,
    max_score: score,
    results: z.array(
      z.object({
        criterionId: z.string(),
        score,
        maxScore: score,
        percentage: z.number().min(0).max(100),
        evidence: z.string(),
        appliedRule: z.string(),
        achievementLevel: z.string(),
        technicalResult: z.string(),
        recommendation: z.string(),
        evidenceDetails: z.string(),
      }),
    ),
  })
  .nullable();
export type RubricDto = z.infer<typeof rubricDtoSchema>;
export type StudentRubricDto = NonNullable<z.infer<typeof studentRubricSchema>>;
