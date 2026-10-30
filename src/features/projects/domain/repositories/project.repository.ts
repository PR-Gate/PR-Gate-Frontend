import type { Project } from '../entities/project.entity';

export interface CreateProjectInput {
  name: string;
  description: string;
  course: string;
  repositoryUrl?: string;
}
export interface ProjectRepository {
  getAll(signal?: AbortSignal): Promise<readonly Project[]>;
  getById(id: string, signal?: AbortSignal): Promise<Project>;
  create(input: CreateProjectInput): Promise<Project>;
}
