import type {
  CreateProjectInput,
  ProjectRepository,
} from '../../domain/repositories/project.repository';
import { mapProject } from '../mappers/project.mapper';
import type { ProjectApiService } from '../services/project-api.service';
export class ProjectRepositoryImpl implements ProjectRepository {
  constructor(private readonly api: ProjectApiService) {}
  async getAll(signal?: AbortSignal) {
    return (await this.api.getAll(signal)).map(mapProject);
  }
  async getById(id: string, signal?: AbortSignal) {
    return mapProject(await this.api.getById(id, signal));
  }
  async create(input: CreateProjectInput) {
    return mapProject(await this.api.create(input));
  }
}
