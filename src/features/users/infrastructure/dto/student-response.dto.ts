import { z } from 'zod';
const count = z.number().int().nonnegative();
export const studentCourseSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  section: z.string(),
  term: z.string(),
  student_count: count,
});
export const courseStudentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  team: z.string(),
  project_id: z.string().min(1),
  project_name: z.string(),
  participation: z.number().min(0).max(100),
  commits: count,
  status: z.enum(['up_to_date', 'review', 'support']),
});
export const studentRosterSchema = z.object({
  course: studentCourseSchema,
  courses: z.array(studentCourseSchema),
  students: z.array(courseStudentSchema),
  summary: z.object({
    total: count,
    regular_activity: count,
    needs_review: count,
  }),
  updated_at: z.iso.datetime(),
});
export const studentContributionSchema = z.object({
  student: courseStudentSchema,
  course: studentCourseSchema,
  period: z.string(),
  reviewed_changes: count,
  evidence: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      recorded_at: z.iso.datetime(),
    }),
  ),
  guidance: z.string(),
  updated_at: z.iso.datetime(),
});
export type StudentCourseDto = z.infer<typeof studentCourseSchema>;
export type CourseStudentDto = z.infer<typeof courseStudentSchema>;
export type StudentRosterDto = z.infer<typeof studentRosterSchema>;
export type StudentContributionDto = z.infer<typeof studentContributionSchema>;
