import type { ProjectRepository } from '../../domain/repositories/project.repository';
export class GetProjectByIdUseCase {
  constructor(private readonly repository: ProjectRepository) {}
  execute(id: string, signal?: AbortSignal) {
    return this.repository.getById(id, signal);
  }
}
