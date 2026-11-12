import { z } from 'zod';

const schema = z
  .object({
    VITE_API_BASE_URL: z
      .string()
      .refine(
        (value) => value.startsWith('/') || /^https?:\/\//.test(value),
        'Use una URL HTTP o una ruta absoluta',
      )
      .default('/api'),
    VITE_ENABLE_MOCKS: z.enum(['true', 'false']).default('false'),
    VITE_AUTH_MODE: z.enum(['demo', 'oidc']).default('oidc'),
    VITE_OIDC_PROVIDER: z.enum(['cognito', 'keycloak']).default('cognito'),
    VITE_OIDC_AUTHORITY: z.string().optional(),
    VITE_OIDC_CLIENT_ID: z.string().optional(),
    VITE_OIDC_REDIRECT_URI: z.string().optional(),
    VITE_OIDC_LOGOUT_URI: z.string().optional(),
    VITE_COGNITO_LOGOUT_URL: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.VITE_AUTH_MODE === 'oidc') {
      for (const key of [
        'VITE_OIDC_AUTHORITY',
        'VITE_OIDC_REDIRECT_URI',
        'VITE_OIDC_LOGOUT_URI',
      ] as const) {
        if (!z.url().safeParse(value[key]).success)
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: 'Configure una URL válida para OIDC/Cognito',
          });
      }
      if (
        value.VITE_OIDC_PROVIDER === 'cognito' &&
        !z.url().safeParse(value.VITE_COGNITO_LOGOUT_URL).success
      )
        ctx.addIssue({
          code: 'custom',
          path: ['VITE_COGNITO_LOGOUT_URL'],
          message: 'Configure el cierre de sesión Cognito',
        });
      if (!value.VITE_OIDC_CLIENT_ID)
        ctx.addIssue({
          code: 'custom',
          path: ['VITE_OIDC_CLIENT_ID'],
          message: 'Configure el cliente público OIDC',
        });
    }
    if (value.VITE_AUTH_MODE === 'demo' && value.VITE_ENABLE_MOCKS !== 'true')
      ctx.addIssue({ code: 'custom', message: 'Demo requiere MSW' });
  });

export function readEnvironment(
  input: Record<string, unknown>,
  production = false,
) {
  const value = schema.parse(input);
  if (
    production &&
    (value.VITE_AUTH_MODE === 'demo' || value.VITE_ENABLE_MOCKS === 'true')
  )
    throw new Error('Producción requiere OIDC y mocks desactivados');
  return value;
}
