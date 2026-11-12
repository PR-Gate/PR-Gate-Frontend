import { z } from 'zod';
import type { HttpClient } from '@/shared/services/http/http-client';
import type { RepositoryProjectsRepository } from '../../domain/repository-project';
const course = z.object({
  id: z.uuid(),
  name: z.string(),
  section: z.string(),
  academicPeriod: z.string(),
});
const repo = z.object({
  id: z.number().int().positive(),
  owner: z.string(),
  name: z.string(),
  fullName: z.string(),
  url: z.url(),
  description: z.string(),
  archived: z.boolean(),
  privateRepository: z.boolean(),
});
const selection = z.object({
  projectId: z.uuid(),
  courseId: z.uuid(),
  courseName: z.string(),
  section: z.string(),
  academicPeriod: z.string(),
  repositoryId: z.number().int().positive(),
  repositoryFullName: z.string(),
  repositoryUrl: z.url(),
});
const enrollment = z.object({
  id: z.uuid(),
  courseId: z.uuid(),
  studentId: z.uuid(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
});
const page = <T extends z.ZodType>(item: T) =>
  z.object({
    items: z.array(item),
    page: z.number().int().nonnegative(),
    size: z.number().int().positive(),
    hasNext: z.boolean(),
  });
export class RepositoryProjectsApi implements RepositoryProjectsRepository {
  constructor(private readonly http: HttpClient) {}
  async courses(n: number, signal?: AbortSignal) {
    return page(course).parse(
      await this.http.get<unknown>(
        '/v1/courses?page=' + n + '&size=50',
        signal,
      ),
    );
  }
  async catalog(n: number, signal?: AbortSignal) {
    return page(course).parse(
      await this.http.get<unknown>(
        '/v1/courses/catalog?page=' + n + '&size=50',
        signal,
      ),
    );
  }
  async organizations(n: number, signal?: AbortSignal) {
    return z
      .object({
        items: z.array(
          z.object({
            id: z.number().int().positive(),
            login: z.string(),
            description: z.string(),
          }),
        ),
        page: z.number().int().positive(),
        hasNext: z.boolean(),
      })
      .parse(
        await this.http.get<unknown>(
          '/me/integrations/github/repositories/organizations?page=' + n,
          signal,
        ),
      );
  }
  async repositories(n: number, signal?: AbortSignal, organization?: string) {
    return z
      .object({
        items: z.array(repo),
        page: z.number().int().positive(),
        hasNext: z.boolean(),
      })
      .parse(
        await this.http.get<unknown>(
          '/me/integrations/github/repositories?page=' +
            n +
            (organization
              ? '&organization=' + encodeURIComponent(organization)
              : ''),
          signal,
        ),
      );
  }
  async selections(n: number, signal?: AbortSignal) {
    return page(selection).parse(
      await this.http.get<unknown>(
        '/v1/me/repository-projects?page=' + n + '&size=20',
        signal,
      ),
    );
  }
  async select(input: Parameters<RepositoryProjectsRepository['select']>[0]) {
    return selection.parse(
      await this.http.post<unknown>('/v1/me/repository-projects', input),
    );
  }
  async createCourse(
    input: Parameters<RepositoryProjectsRepository['createCourse']>[0],
  ) {
    return course.parse(await this.http.post<unknown>('/v1/courses', input));
  }
  async requestEnrollment(id: string) {
    return enrollment.parse(
      await this.http.post<unknown>(
        '/v1/courses/' + encodeURIComponent(id) + '/enrollments',
        {},
      ),
    );
  }
  async enrollments(id: string, n: number, signal?: AbortSignal) {
    return page(enrollment).parse(
      await this.http.get<unknown>(
        '/v1/courses/' +
          encodeURIComponent(id) +
          '/enrollments?page=' +
          n +
          '&size=20',
        signal,
      ),
    );
  }
  async ownEnrollments(n: number, signal?: AbortSignal) {
    return page(enrollment).parse(
      await this.http.get<unknown>(
        '/v1/me/enrollments?page=' + n + '&size=50',
        signal,
      ),
    );
  }
  async decideEnrollment(id: string, decision: 'APPROVE' | 'REJECT') {
    if (!this.http.patch) throw new Error('HTTP PATCH no disponible');
    // The existing Projects contract uses PATCH for enrollment decisions.
    return enrollment.parse(
      await this.http.patch<unknown>(
        '/v1/enrollments/' + encodeURIComponent(id),
        { decision },
      ),
    );
  }
}
