import {
  InMemoryWebStorage,
  UserManager,
  WebStorageStateStore,
} from 'oidc-client-ts';
import type {
  AuthSessionService,
  SessionUser,
} from '@/shared/services/auth/auth-session.service';

interface OidcConfig {
  authority: string;
  clientId: string;
  redirectUri: string;
  logoutUri: string;
  cognitoLogoutUrl: string;
}

export function createOidcSession(config: OidcConfig): AuthSessionService {
  const manager = new UserManager({
    authority: config.authority,
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    post_logout_redirect_uri: config.logoutUri,
    response_type: 'code',
    scope: 'openid email profile',
    userStore: new WebStorageStateStore({ store: new InMemoryWebStorage() }),
    stateStore: new WebStorageStateStore({ store: window.sessionStorage }),
    automaticSilentRenew: false,
    loadUserInfo: false,
  });
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  manager.events.addUserLoaded(notify);
  manager.events.addUserUnloaded(notify);
  manager.events.addAccessTokenExpired(() => {
    void manager.removeUser();
  });
  let initialization: Promise<void> | undefined;

  const initialize = () =>
    (initialization ??= (async () => {
      if (
        window.location.pathname === new URL(config.redirectUri).pathname &&
        new URLSearchParams(window.location.search).has('state')
      ) {
        try {
          if (window.self !== window.top) await manager.signinSilentCallback();
          else await manager.signinRedirectCallback();
        } finally {
          window.history.replaceState(
            {},
            '',
            new URL(config.redirectUri).pathname,
          );
        }
      } else {
        // Recover through the provider's session; do not persist access/refresh tokens.
        try {
          await manager.signinSilent();
        } catch {
          await manager.removeUser();
        }
      }
    })());

  return {
    async getUser(): Promise<SessionUser | null> {
      await initialize();
      const user = await manager.getUser();
      if (!user || user.expired) return null;
      const groups = user.profile['cognito:groups'];
      return {
        id: user.profile.sub,
        name: user.profile.name ?? user.profile.email ?? 'Usuario',
        email: user.profile.email ?? '',
        roles: Array.isArray(groups)
          ? groups.filter((role): role is string => typeof role === 'string')
          : [],
      };
    },
    async getAccessToken() {
      const user = await manager.getUser();
      return user && !user.expired ? user.access_token : undefined;
    },
    async login() {
      await manager.signinRedirect();
    },
    async logout() {
      await manager.removeUser();
      const url = new URL(config.cognitoLogoutUrl);
      url.searchParams.set('client_id', config.clientId);
      url.searchParams.set('logout_uri', config.logoutUri);
      window.location.assign(url.toString());
    },
    async expire() {
      await manager.removeUser();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
