import { z } from 'zod';
export const questionSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['multiple', 'boolean', 'open']),
  prompt: z.string().min(1),
  options: z.array(z.string()),
  correctAnswer: z.string(),
  points: z.number().positive().max(100),
  feedback: z.string(),
});
export const draftDtoSchema = z.object({
  title: z.string().trim().min(3).max(150),
  courseId: z.string().min(1),
  durationMinutes: z.number().int().min(1).max(300),
  instructions: z.string().max(3000),
  questions: z.array(questionSchema).max(100),
  assignment: z.object({
    mode: z.enum(['all', 'teams', 'students']),
    ids: z.array(z.string()),
  }),
  opensAt: z.union([z.literal(''), z.iso.datetime()]),
  closesAt: z.union([z.literal(''), z.iso.datetime()]),
});
export const assessmentDtoSchema = draftDtoSchema.extend({
  id: z.string(),
  course_name: z.string(),
  section: z.string(),
  status: z.enum(['draft', 'scheduled', 'published', 'finished']),
  assigned_count: z.number().int().nonnegative(),
  responded_count: z.number().int().nonnegative(),
  pending_review: z.number().int().nonnegative(),
  pending_responses: z.number().int().nonnegative(),
  total_points: z.number().nonnegative(),
  participants: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      status: z.enum([
        'not_started',
        'in_progress',
        'submitted',
        'needs_review',
        'graded',
      ]),
      submittedAt: z.iso.datetime().nullable(),
      score: z.number().nullable(),
      answers: z.array(
        z.object({
          questionId: z.string(),
          value: z.string(),
          score: z.number().nullable(),
          feedback: z.string(),
        }),
      ),
    }),
  ),
  results: z.object({
    average: z.number().nullable(),
    participation: z.number().min(0).max(100),
    difficultQuestions: z.array(
      z.object({ label: z.string(), detail: z.string() }),
    ),
    distribution: z.array(
      z.object({ label: z.string(), count: z.number().int().nonnegative() }),
    ),
    support: z.array(z.object({ name: z.string(), reason: z.string() })),
  }),
});
export const assessmentListSchema = z.object({
  data: z.array(assessmentDtoSchema),
  summary: z.object({
    published: z.number().int().nonnegative(),
    pending_responses: z.number().int().nonnegative(),
    pending_review: z.number().int().nonnegative(),
  }),
});
export const catalogSchema = z.object({
  courses: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      section: z.string(),
      students: z.array(
        z.object({ id: z.string(), name: z.string(), teamId: z.string() }),
      ),
      teams: z.array(z.object({ id: z.string(), name: z.string() })),
    }),
  ),
  savedQuestions: z.array(questionSchema),
});
export type AssessmentDto = z.infer<typeof assessmentDtoSchema>;
