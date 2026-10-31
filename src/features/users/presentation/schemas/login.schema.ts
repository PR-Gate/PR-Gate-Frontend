import { z } from 'zod';

// Optional hint for the identity provider, never a local credential check.
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(
      z.union([z.literal(''), z.email('Escribe un correo electrónico válido')]),
    ),
});
export type LoginFormValues = z.input<typeof loginSchema>;
