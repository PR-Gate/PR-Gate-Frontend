import type {
  AuthSessionService,
  SessionUser,
} from '@/shared/services/auth/auth-session.service';

export function createDemoSession(): AuthSessionService {
  let user: SessionUser | null = null;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  return {
    async getUser() {
      return user;
    },
    async getAccessToken() {
      return undefined;
    },
    async login(options) {
      const student = options?.profile === 'student';
      user = {
        id: student ? 'demo-student' : 'demo-teacher',
        name: student ? 'Alex Rivera' : 'Andrea García',
        email: student ? 'estudiante@example.test' : 'docente@example.test',
        roles: [student ? 'STUDENT' : 'TEACHER'],
      };
      notify();
    },
    async logout() {
      user = null;
      notify();
    },
    async expire() {
      user = null;
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
