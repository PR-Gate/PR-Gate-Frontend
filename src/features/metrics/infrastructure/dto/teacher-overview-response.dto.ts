import { z } from 'zod';
const count = z.number().int().nonnegative();
const course = z.object({
  id: z.string().min(1),
  name: z.string(),
  section: z.string(),
});
export const teacherOverviewSchema = z.object({
  course,
  courses: z.array(course),
  generated_at: z.iso.datetime(),
  active_courses: count,
  evaluated_projects: count,
  pending_evaluations: count,
  critical_alerts: count,
  saved_minutes: count,
  active_students: count,
  total_students: count,
  total_projects: count,
  distribution: z.array(
    z.object({
      status: z.enum(['approved', 'review', 'correction', 'failed']),
      count,
      percentage: z.number().min(0).max(100),
    }),
  ),
  activities: z.array(
    z.object({
      id: z.string(),
      kind: z.enum(['pipeline', 'gate', 'push', 'evaluation']),
      title: z.string(),
      detail: z.string(),
      occurred_at: z.iso.datetime(),
      project_id: z.string(),
    }),
  ),
  projects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      team: z.string(),
      repository: z.string(),
      last_commit: z.iso.datetime(),
      pipeline: z.enum(['success', 'failed']),
      quality_gate: z.enum(['passed', 'failed', 'pending']),
      grade: z.number().min(0).max(20).nullable(),
    }),
  ),
  students: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      team: z.string(),
      active: z.boolean(),
    }),
  ),
});
export type TeacherOverviewResponseDto = z.infer<typeof teacherOverviewSchema>;
