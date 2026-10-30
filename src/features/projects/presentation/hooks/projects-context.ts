import { createContext, useContext } from 'react';
import type { GetProjectsUseCase } from '../../application/use-cases/get-projects.use-case';
import type { GetProjectByIdUseCase } from '../../application/use-cases/get-project-by-id.use-case';
import type { CreateProjectUseCase } from '../../application/use-cases/create-project.use-case';
export interface ProjectsDependencies {
  getProjects: GetProjectsUseCase;
  getProjectById: GetProjectByIdUseCase;
  createProject: CreateProjectUseCase;
}
export const ProjectsContext = createContext<ProjectsDependencies | null>(null);
export function useProjectsDependencies() {
  const value = useContext(ProjectsContext);
  if (!value) throw new Error('ProjectsContext es obligatorio');
  return value;
}
