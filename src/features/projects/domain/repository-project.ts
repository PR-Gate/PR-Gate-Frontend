export interface GitHubOrganization {
  id: number;
  login: string;
  description: string;
}
export interface OrganizationPage {
  items: GitHubOrganization[];
  page: number;
  hasNext: boolean;
}
export interface PublicRepository {
  id: number;
  owner: string;
  name: string;
  fullName: string;
  url: string;
  description: string;
  archived: boolean;
  privateRepository: boolean;
}
export interface ProjectCourse {
  id: string;
  name: string;
  section: string;
  academicPeriod: string;
}
export interface CoursePage {
  items: ProjectCourse[];
  page: number;
  size: number;
  hasNext: boolean;
}
export interface PublicRepositoryPage {
  items: PublicRepository[];
  page: number;
  hasNext: boolean;
}
export interface RepositoryProject {
  projectId: string;
  courseId: string;
  courseName: string;
  section: string;
  academicPeriod: string;
  repositoryId: number;
  repositoryFullName: string;
  repositoryUrl: string;
}
export interface SelectionPage {
  items: RepositoryProject[];
  page: number;
  size: number;
  hasNext: boolean;
}
export interface CourseEnrollment {
  id: string;
  courseId: string;
  studentId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
export interface EnrollmentPage {
  items: CourseEnrollment[];
  page: number;
  size: number;
  hasNext: boolean;
}
export interface RepositoryProjectsRepository {
  courses(page: number, signal?: AbortSignal): Promise<CoursePage>;
  catalog(page: number, signal?: AbortSignal): Promise<CoursePage>;
  repositories(
    page: number,
    signal?: AbortSignal,
    organization?: string,
  ): Promise<PublicRepositoryPage>;
  organizations(page: number, signal?: AbortSignal): Promise<OrganizationPage>;
  selections(page: number, signal?: AbortSignal): Promise<SelectionPage>;
  select(input: {
    courseId: string;
    owner: string;
    name: string;
  }): Promise<RepositoryProject>;
  createCourse(input: {
    name: string;
    section: string;
    academicPeriod: string;
  }): Promise<ProjectCourse>;
  requestEnrollment(courseId: string): Promise<CourseEnrollment>;
  enrollments(
    courseId: string,
    page: number,
    signal?: AbortSignal,
  ): Promise<EnrollmentPage>;
  decideEnrollment(
    id: string,
    decision: 'APPROVE' | 'REJECT',
  ): Promise<CourseEnrollment>;
  ownEnrollments(page: number, signal?: AbortSignal): Promise<EnrollmentPage>;
}
