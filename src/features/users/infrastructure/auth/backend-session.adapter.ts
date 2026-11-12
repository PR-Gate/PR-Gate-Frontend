import { z } from 'zod';
import type {
  AuthSessionService,
  LoginProfile,
  SessionUser,
} from '@/shared/services/auth/auth-session.service';
import {
  clearRegistrationProfile,
  readRegistrationProfile,
  saveRegistrationProfile,
} from '@/shared/services/auth/registration-profile';
import { createHttpClient } from '@/shared/services/http/axios.config';
import { HttpError } from '@/shared/services/http/http-error';
import { describeTokenRejection } from './token-diagnostic';

const profileSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  email: z.string().nullable(),
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']),
  status: z.literal('ACTIVE'),
});

export function createBackendSession(
  identity: AuthSessionService,
  baseUrl: string,
  expectedToken: { issuer?: string; clientId?: string; audience?: string } = {},
): AuthSessionService {
  const http = createHttpClient(
    baseUrl,
    () => identity.getAccessToken(),
    async () => {},
    true,
    { requireAccessToken: true },
  );
  function mapProfile(response: unknown): SessionUser {
    const profile = profileSchema.parse(response);
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email ?? '',
      roles: [profile.role],
      academicProfilePending: false,
    };
  }
  async function completeProfile(profile: LoginProfile) {
    const user = mapProfile(
      await http.post<unknown>('/me/registration', { profile }),
    );
    clearRegistrationProfile();
    return user;
  }
  return {
    registrationEnabled: identity.registrationEnabled,
    async getUser() {
      const user = await identity.getUser();
      if (!user) return null;
      try {
        const profile = mapProfile(await http.post<unknown>('/me/session', {}));
        clearRegistrationProfile();
        return profile;
      } catch (error) {
        if (
          error instanceof HttpError &&
          error.status === 404 &&
          error.code === 'ACADEMIC_PROFILE_REQUIRED'
        ) {
          const choice = readRegistrationProfile();
          if (choice) {
            try {
              return await completeProfile(choice);
            } catch {
              /* Offer explicit retry below. */
            }
          }
          return {
            ...user,
            roles: [],
            academicProfilePending: true,
            academicProfileRequired: true,
            academicProfileError:
              'Completa tu registro: elige si eres docente o estudiante para continuar.',
          };
        }
        const rejection =
          error instanceof HttpError && error.status === 401
            ? describeTokenRejection(
                await identity.getAccessToken(),
                expectedToken,
              )
            : undefined;
        return {
          ...user,
          roles: [],
          academicProfilePending: true,
          academicProfileError:
            error instanceof HttpError && error.status === 404
              ? 'El servicio de usuarios responde, pero su versión todavía no ofrece la conexión de perfiles con Keycloak. Es necesario actualizar el backend.'
              : error instanceof HttpError && error.status === 401
                ? (rejection ??
                  'El servicio de usuarios no pudo validar tu sesión. Vuelve a iniciar sesión; si el problema continúa, revisa la configuración de Keycloak del backend.')
                : error instanceof HttpError && error.status === 403
                  ? 'Tu perfil académico está inactivo o no tiene acceso. Contacta al responsable de PR Gate.'
                  : 'No se pudo conectar tu perfil con el servicio de usuarios. Comprueba que el backend esté disponible y reintenta.',
        };
      }
    },
    getAccessToken: () => identity.getAccessToken(),
    login: async (options) => {
      if (options?.register)
        saveRegistrationProfile(options.profile ?? 'student');
      else clearRegistrationProfile();
      try {
        await identity.login(options);
      } catch (error) {
        clearRegistrationProfile();
        throw error;
      }
    },
    completeProfile,
    logout: () => {
      clearRegistrationProfile();
      return identity.logout();
    },
    expire: () => identity.expire(),
    subscribe: (listener) => identity.subscribe(listener),
  };
}
