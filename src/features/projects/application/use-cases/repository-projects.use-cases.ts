import type { RepositoryProjectsRepository } from '../../domain/repository-project';
export class RepositoryProjectsUseCases {
  constructor(private readonly repository: RepositoryProjectsRepository) {}
  projectDetails(projectId: string, signal?: AbortSignal) {
    return this.repository.projectDetails(projectId, signal);
  }
  courseProjects(courseId: string, page: number, signal?: AbortSignal) {
    return this.repository.courseProjects(courseId, page, signal);
  }
  createCourseProject(courseId: string, input: { name: string; description: string }) {
    return this.repository.createCourseProject(courseId, input);
  }
  linkOrganization(projectId: string, organizationLogin: string) {
    return this.repository.linkOrganization(projectId, organizationLogin);
  }
  courses(page: number, signal?: AbortSignal) {
    return this.repository.courses(page, signal);
  }
  catalog(page: number, signal?: AbortSignal) {
    return this.repository.catalog(page, signal);
  }
  repositories(page: number, signal?: AbortSignal, organization?: string) {
    return this.repository.repositories(page, signal, organization);
  }
  organizations(page: number, signal?: AbortSignal) {
    return this.repository.organizations(page, signal);
  }
  selections(page: number, signal?: AbortSignal) {
    return this.repository.selections(page, signal);
  }
  select(input: Parameters<RepositoryProjectsRepository['select']>[0]) {
    return this.repository.select(input);
  }
  createCourse(
    input: Parameters<RepositoryProjectsRepository['createCourse']>[0],
  ) {
    return this.repository.createCourse(input);
  }
  requestEnrollment(courseId: string) {
    return this.repository.requestEnrollment(courseId);
  }
  enrollments(courseId: string, page: number, signal?: AbortSignal) {
    return this.repository.enrollments(courseId, page, signal);
  }
  decideEnrollment(id: string, decision: 'APPROVE' | 'REJECT') {
    return this.repository.decideEnrollment(id, decision);
  }
  ownEnrollments(page: number, signal?: AbortSignal) {
    return this.repository.ownEnrollments(page, signal);
  }
}
