import type { ProjectRepository } from '../../domain/repositories/project.repository';
export class GetProjectsUseCase {
  constructor(private readonly repository: ProjectRepository) {}
  execute(signal?: AbortSignal) {
    return this.repository.getAll(signal);
  }
}
