import { expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  redirect: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('oidc-client-ts', () => ({
  UserManager: class {
    events = {
      addUserLoaded: vi.fn(),
      addUserUnloaded: vi.fn(),
      addAccessTokenExpired: vi.fn(),
    };
    signinRedirect = mocks.redirect;
  },
  InMemoryWebStorage: class {},
  WebStorageStateStore: class {},
}));
import { createOidcSession } from './oidc-session.adapter';

it('sends only the email hint to OIDC; a chosen profile cannot assign roles', async () => {
  const service = createOidcSession({
    authority: 'https://issuer.example.test',
    clientId: 'public-test-client',
    redirectUri: 'http://localhost/login',
    logoutUri: 'http://localhost/login',
    cognitoLogoutUrl: 'https://issuer.example.test/logout',
  });
  await service.login({
    loginHint: 'docente@example.test',
    profile: 'teacher',
  });
  expect(mocks.redirect).toHaveBeenLastCalledWith({
    login_hint: 'docente@example.test',
  });
  await service.login();
  expect(mocks.redirect).toHaveBeenLastCalledWith(undefined);
});
