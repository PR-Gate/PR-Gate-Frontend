import { expect, it } from 'vitest';
import { readEnvironment } from './env.config';
it('accepts the explicit local demo configuration', () => {
  expect(
    readEnvironment({ VITE_AUTH_MODE: 'demo', VITE_ENABLE_MOCKS: 'true' })
      .VITE_API_BASE_URL,
  ).toBe('/api');
});
it('rejects demo mode in production and without mocks', () => {
  expect(() => readEnvironment({ VITE_AUTH_MODE: 'demo' })).toThrow();
  expect(() =>
    readEnvironment(
      { VITE_AUTH_MODE: 'demo', VITE_ENABLE_MOCKS: 'true' },
      true,
    ),
  ).toThrow('Producción requiere OIDC');
});
it('requires real OIDC configuration rather than silently granting access', () => {
  expect(() => readEnvironment({})).toThrow();
});
it('accepts Keycloak without requiring a Cognito-specific logout URL', () => {
  expect(
    readEnvironment({
      VITE_AUTH_MODE: 'oidc',
      VITE_OIDC_PROVIDER: 'keycloak',
      VITE_OIDC_AUTHORITY: 'http://localhost:8090/realms/prgate',
      VITE_OIDC_CLIENT_ID: 'prgate-frontend',
      VITE_OIDC_REDIRECT_URI: 'http://localhost:5173/login',
      VITE_OIDC_LOGOUT_URI: 'http://localhost:5173/login',
    }).VITE_OIDC_PROVIDER,
  ).toBe('keycloak');
});
