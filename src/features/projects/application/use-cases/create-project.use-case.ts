import type {
  CreateProjectInput,
  ProjectRepository,
} from '../../domain/repositories/project.repository';
export class CreateProjectUseCase {
  constructor(private readonly repository: ProjectRepository) {}
  execute(input: CreateProjectInput) {
    return this.repository.create(input);
  }
}
