import { beforeEach, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/testing/mocks/server';
import type { AuthSessionService } from '@/shared/services/auth/auth-session.service';
import { createBackendSession } from './backend-session.adapter';

const identityUser = {
  id: 'keycloak-sub',
  name: 'Ana',
  email: 'ana@example.test',
  roles: [],
  academicProfilePending: true,
};
beforeEach(() => sessionStorage.clear());
function identity(
  user: typeof identityUser | null = identityUser,
): AuthSessionService {
  return {
    getUser: async () => user,
    getAccessToken: async () => 'keycloak-access',
    login: vi.fn(),
    logout: vi.fn(),
    expire: vi.fn(),
    subscribe: () => () => {},
  };
}

it('resolves the academic UUID and roles from the authenticated users service', async () => {
  server.use(
    http.post('http://localhost/api/me/session', ({ request }) => {
      expect(request.headers.get('Authorization')).toBe(
        'Bearer keycloak-access',
      );
      return HttpResponse.json({
        id: '099a2f89-5df5-4eac-8e32-44e3ec678b73',
        name: 'Ana Torres',
        email: 'ana@example.test',
        role: 'STUDENT',
        status: 'ACTIVE',
      });
    }),
  );
  expect(
    await createBackendSession(identity(), 'http://localhost/api').getUser(),
  ).toEqual({
    id: '099a2f89-5df5-4eac-8e32-44e3ec678b73',
    name: 'Ana Torres',
    email: 'ana@example.test',
    roles: ['STUDENT'],
    academicProfilePending: false,
  });
});

it('retains identity without academic access if users-service is unavailable', async () => {
  server.use(
    http.post('http://localhost/api/me/session', () =>
      HttpResponse.json({}, { status: 503 }),
    ),
  );
  const user = await createBackendSession(
    identity(),
    'http://localhost/api',
  ).getUser();
  expect(user).toMatchObject({
    id: 'keycloak-sub',
    roles: [],
    academicProfilePending: true,
  });
  expect(user?.academicProfileError).toContain('servicio de usuarios');
});

it('does not grant access to an inactive academic profile', async () => {
  server.use(
    http.post('http://localhost/api/me/session', () =>
      HttpResponse.json({}, { status: 403 }),
    ),
  );
  expect(
    await createBackendSession(identity(), 'http://localhost/api').getUser(),
  ).toMatchObject({
    roles: [],
    academicProfilePending: true,
    academicProfileError: expect.stringContaining('inactivo'),
  });
});

it('does not provision an anonymous session', async () => {
  const request = vi.fn();
  server.use(http.post('http://localhost/api/me/session', request));
  expect(
    await createBackendSession(
      identity(null),
      'http://localhost/api',
    ).getUser(),
  ).toBeNull();
  expect(request).not.toHaveBeenCalled();
});

it('identifies an outdated backend instead of reporting a database outage', async () => {
  server.use(
    http.post(
      'http://localhost/api/me/session',
      () => new HttpResponse(null, { status: 404 }),
    ),
  );
  expect(
    await createBackendSession(identity(), 'http://localhost/api').getUser(),
  ).toMatchObject({
    roles: [],
    academicProfilePending: true,
    academicProfileError: expect.stringContaining('actualizar el backend'),
  });
});

it('reports an authentication failure without granting academic roles', async () => {
  server.use(
    http.post(
      'http://localhost/api/me/session',
      () => new HttpResponse(null, { status: 401 }),
    ),
  );
  expect(
    await createBackendSession(identity(), 'http://localhost/api').getUser(),
  ).toMatchObject({
    roles: [],
    academicProfilePending: true,
    academicProfileError: expect.stringContaining('validar tu sesión'),
  });
});

it('asks for a registration choice instead of inventing an academic role', async () => {
  server.use(
    http.post('http://localhost/api/me/session', () =>
      HttpResponse.json({ code: 'ACADEMIC_PROFILE_REQUIRED' }, { status: 404 }),
    ),
  );
  const session = createBackendSession(identity(), 'http://localhost/api');
  expect(await session.getUser()).toMatchObject({
    roles: [],
    academicProfileRequired: true,
    academicProfilePending: true,
  });
});

it('persists the registration choice across OIDC and uses only the backend-confirmed role', async () => {
  server.use(
    http.post('http://localhost/api/me/session', () =>
      HttpResponse.json({ code: 'ACADEMIC_PROFILE_REQUIRED' }, { status: 404 }),
    ),
    http.post('http://localhost/api/me/registration', async ({ request }) => {
      expect(await request.json()).toEqual({ profile: 'teacher' });
      return HttpResponse.json({
        id: '099a2f89-5df5-4eac-8e32-44e3ec678b73',
        name: 'Ana Torres',
        email: null,
        role: 'TEACHER',
        status: 'ACTIVE',
      });
    }),
  );
  const auth = identity();
  await createBackendSession(auth, 'http://localhost/api').login({
    register: true,
    profile: 'teacher',
  });
  const user = await createBackendSession(
    auth,
    'http://localhost/api',
  ).getUser();
  expect(user).toMatchObject({
    roles: ['TEACHER'],
    academicProfilePending: false,
  });
  expect(sessionStorage.getItem('pr-gate:registration-profile')).toBeNull();
});
