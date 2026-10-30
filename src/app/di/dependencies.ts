import type { ProjectsDependencies } from '@/features/projects/presentation/hooks/projects-context';
import type { AuthSessionService } from '@/shared/services/auth/auth-session.service';
export interface AppDependencies {
  projects: ProjectsDependencies;
  auth: AuthSessionService;
}
