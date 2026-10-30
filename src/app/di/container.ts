import { createHttpClient } from '@/shared/services/http/axios.config';
import { ProjectApiService } from '@/features/projects/infrastructure/services/project-api.service';
import { ProjectRepositoryImpl } from '@/features/projects/infrastructure/repositories/project.repository.impl';
import { GetProjectsUseCase } from '@/features/projects/application/use-cases/get-projects.use-case';
import { GetProjectByIdUseCase } from '@/features/projects/application/use-cases/get-project-by-id.use-case';
import { CreateProjectUseCase } from '@/features/projects/application/use-cases/create-project.use-case';
import type { AuthSessionService } from '@/shared/services/auth/auth-session.service';
import type { AppDependencies } from './dependencies';

export function createDependencies(
  baseUrl: string,
  auth: AuthSessionService,
): AppDependencies {
  const http = createHttpClient(
    baseUrl,
    () => auth.getAccessToken(),
    () => auth.expire(),
  );
  const repository = new ProjectRepositoryImpl(new ProjectApiService(http));
  return {
    auth,
    projects: {
      getProjects: new GetProjectsUseCase(repository),
      getProjectById: new GetProjectByIdUseCase(repository),
      createProject: new CreateProjectUseCase(repository),
    },
  };
}
