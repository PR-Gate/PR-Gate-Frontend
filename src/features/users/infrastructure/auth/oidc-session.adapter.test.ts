import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  redirect: vi.fn().mockResolvedValue(undefined),
  signout: vi.fn().mockResolvedValue(undefined),
  remove: vi.fn().mockResolvedValue(undefined),
  silent: vi.fn().mockRejectedValue(new Error('No session')),
  getUser: vi.fn(),
  settings: vi.fn(),
  callback: vi.fn().mockResolvedValue(undefined),
  signoutCallback: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('oidc-client-ts', () => ({
  UserManager: class {
    constructor(settings: unknown) {
      mocks.settings(settings);
    }
    events = {
      addUserLoaded: vi.fn(),
      addUserUnloaded: vi.fn(),
      addAccessTokenExpired: vi.fn(),
    };
    signinRedirect = mocks.redirect;
    signoutRedirect = mocks.signout;
    getUser = mocks.getUser;
    removeUser = mocks.remove;
    signinSilent = mocks.silent;
    signinRedirectCallback = mocks.callback;
    signoutRedirectCallback = mocks.signoutCallback;
    signinSilentCallback = mocks.callback;
  },
  InMemoryWebStorage: class {},
  WebStorageStateStore: class {},
}));
import { createOidcSession } from './oidc-session.adapter';
const config = {
  authority: 'https://issuer.example.test',
  clientId: 'public-test-client',
  redirectUri: 'http://localhost/login',
  logoutUri: 'http://localhost/login',
  cognitoLogoutUrl: 'https://issuer.example.test/logout',
};
beforeEach(() => {
  mocks.getUser.mockResolvedValue(null);
  window.history.replaceState({}, '', '/login');
});
it('sends only the email hint to OIDC; a chosen profile cannot assign roles', async () => {
  const service = createOidcSession(config);
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
it('opens Keycloak registration through a new PKCE authorization request', async () => {
  const service = createOidcSession({ ...config, provider: 'keycloak' });
  expect(service.registrationEnabled).toBe(true);
  await service.login({ register: true, profile: 'teacher' });
  expect(mocks.redirect).toHaveBeenLastCalledWith({ prompt: 'create' });
  expect(mocks.settings).toHaveBeenLastCalledWith(
    expect.objectContaining({
      response_type: 'code',
      automaticSilentRenew: true,
    }),
  );
});
it('keeps Keycloak identity separate from academic permissions', async () => {
  mocks.getUser.mockResolvedValue({
    expired: false,
    access_token: 'access-fixture',
    profile: {
      sub: 'identity-id',
      name: 'Ana Torres',
      email: 'ana@example.test',
      'cognito:groups': ['ADMIN'],
    },
  });
  const service = createOidcSession({ ...config, provider: 'keycloak' });
  expect(await service.getUser()).toEqual({
    id: 'identity-id',
    name: 'Ana Torres',
    email: 'ana@example.test',
    roles: [],
    academicProfilePending: true,
  });
});
it('uses OIDC end-session for Keycloak logout', async () => {
  mocks.getUser.mockResolvedValue({ id_token: 'id-fixture' });
  const service = createOidcSession({ ...config, provider: 'keycloak' });
  await service.logout();
  expect(mocks.remove).toHaveBeenCalled();
  expect(mocks.signout).toHaveBeenCalledWith({
    id_token_hint: 'id-fixture',
    post_logout_redirect_uri: config.logoutUri,
  });
});
it('processes sign-out callbacks without treating them as sign-in', async () => {
  window.history.replaceState({}, '', '/login?state=logout-state');
  const before = mocks.callback.mock.calls.length;
  const service = createOidcSession({ ...config, provider: 'keycloak' });
  await service.getUser();
  expect(mocks.signoutCallback).toHaveBeenCalled();
  expect(mocks.callback.mock.calls.length).toBe(before);
  expect(window.location.search).toBe('');
});

it('finishes the OIDC callback before returning a token to the HTTP client', async () => {
  window.history.replaceState(
    {},
    '',
    '/login?state=fixture-state&code=fixture-code',
  );
  mocks.callback.mockImplementationOnce(async () => {
    mocks.getUser.mockResolvedValue({
      expired: false,
      access_token: 'callback-access-token',
    });
  });
  const service = createOidcSession({ ...config, provider: 'keycloak' });
  expect(await service.getAccessToken()).toBe('callback-access-token');
  expect(window.location.search).toBe('');
});

it('never returns an expired access token', async () => {
  mocks.getUser.mockResolvedValue({
    expired: true,
    access_token: 'expired-fixture',
  });
  const service = createOidcSession({ ...config, provider: 'keycloak' });
  expect(await service.getAccessToken()).toBeUndefined();
});
