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
