import { z } from 'zod';
export const projectFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Escribe al menos 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  description: z
    .string()
    .trim()
    .min(10, 'Describe el proyecto en al menos 10 caracteres')
    .max(1000),
  course: z.string().trim().min(3, 'Indica el curso').max(100),
  repositoryUrl: z.union([
    z.literal(''),
    z
      .url()
      .refine(
        (value) => new URL(value).protocol === 'https:',
        'Usa una URL HTTPS',
      ),
  ]),
});
export type ProjectFormValues = z.infer<typeof projectFormSchema>;
