import { z } from 'zod';
export const projectResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  course_name: z.string(),
  status: z.enum(['ACTIVE', 'ARCHIVED']),
  repository_url: z.url().nullable(),
  member_count: z.number().int().nonnegative(),
  updated_at: z.iso.datetime(),
});
export const projectsResponseSchema = z.object({
  data: z.array(projectResponseSchema),
});
export type ProjectResponseDto = z.infer<typeof projectResponseSchema>;
