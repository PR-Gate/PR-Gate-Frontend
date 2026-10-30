import type { HttpClient } from '@/shared/services/http/http-client';
import type { CreateProjectInput } from '../../domain/repositories/project.repository';
import {
  projectResponseSchema,
  projectsResponseSchema,
} from '../dto/project-response.dto';

export class ProjectApiService {
  constructor(private readonly http: HttpClient) {}
  async getAll(signal?: AbortSignal) {
    return projectsResponseSchema.parse(
      await this.http.get<unknown>('/projects', signal),
    ).data;
  }
  async getById(id: string, signal?: AbortSignal) {
    return projectResponseSchema.parse(
      await this.http.get<unknown>(
        `/projects/${encodeURIComponent(id)}`,
        signal,
      ),
    );
  }
  async create(input: CreateProjectInput) {
    return projectResponseSchema.parse(
      await this.http.post<unknown>('/projects', {
        name: input.name,
        description: input.description,
        course_name: input.course,
        repository_url: input.repositoryUrl || null,
      }),
    );
  }
}
