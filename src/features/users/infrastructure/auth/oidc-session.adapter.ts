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
  cognitoLogoutUrl?: string;
  provider?: 'cognito' | 'keycloak';
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
    automaticSilentRenew: config.provider === 'keycloak',
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
          else if (
            new URLSearchParams(window.location.search).has('code') ||
            new URLSearchParams(window.location.search).has('error')
          )
            await manager.signinRedirectCallback();
          else await manager.signoutRedirectCallback();
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
    registrationEnabled: config.provider === 'keycloak',
    async getUser(): Promise<SessionUser | null> {
      await initialize();
      const user = await manager.getUser();
      if (!user || user.expired) return null;
      const groups =
        config.provider === 'keycloak' ? [] : user.profile['cognito:groups'];
      return {
        id: user.profile.sub,
        name: user.profile.name ?? user.profile.email ?? 'Usuario',
        email: user.profile.email ?? '',
        roles: Array.isArray(groups)
          ? groups.filter((role): role is string => typeof role === 'string')
          : [],
        ...(config.provider === 'keycloak'
          ? { academicProfilePending: true }
          : {}),
      };
    },
    async getAccessToken() {
      await initialize();
      const user = await manager.getUser();
      return user && !user.expired && user.access_token?.trim()
        ? user.access_token
        : undefined;
    },
    async login(options) {
      const args = {
        ...(options?.loginHint ? { login_hint: options.loginHint } : {}),
        ...(options?.register && config.provider === 'keycloak'
          ? { prompt: 'create' }
          : {}),
      };
      await manager.signinRedirect(Object.keys(args).length ? args : undefined);
    },
    async logout() {
      if (config.provider === 'keycloak') {
        const user = await manager.getUser();
        await manager.removeUser();
        await manager.signoutRedirect({
          id_token_hint: user?.id_token,
          post_logout_redirect_uri: config.logoutUri,
        });
        return;
      }
      await manager.removeUser();
      if (!config.cognitoLogoutUrl)
        throw new Error('Configure el cierre de sesión del proveedor');
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
