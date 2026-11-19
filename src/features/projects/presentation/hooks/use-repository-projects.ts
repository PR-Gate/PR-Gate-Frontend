import { createContext, useContext } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from '@tanstack/react-query';
import type { RepositoryProjectsUseCases } from '../../application/use-cases/repository-projects.use-cases';
import { useAuth } from '@/shared/services/auth/auth-context';
export const RepositoryProjectsContext =
  createContext<RepositoryProjectsUseCases | null>(null);
export function useRepositoryProjects(
  open: boolean,
  page: number,
  course: string,
) {
  const cases = useContext(RepositoryProjectsContext);
  if (!cases) throw new Error('RepositoryProjectsContext es obligatorio');
  const { user } = useAuth();
  const client = useQueryClient();
  const root = ['repository-projects', user?.id] as const;
  const student = Boolean(user?.roles.includes('STUDENT'));
  const courses = useInfiniteQuery({
    queryKey: [...root, 'courses'],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => cases.courses(pageParam, signal),
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
  const organizations = useInfiniteQuery({
    queryKey: [...root, 'github-organizations'],
    enabled: student && open,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => cases.organizations(pageParam, signal),
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
    retry: false,
  });
  const projects = useQuery({
    queryKey: [...root, 'projects', course, page],
    enabled: student && Boolean(course),
    queryFn: ({ signal }) => cases.courseProjects(course, page, signal),
  });
  const catalog = useInfiniteQuery({
    queryKey: [...root, 'catalog'],
    enabled: student,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => cases.catalog(pageParam, signal),
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
  const admissions = useInfiniteQuery({
    queryKey: [...root, 'admissions'],
    enabled: student,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => cases.ownEnrollments(pageParam, signal),
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
  const pending = useQuery({
    queryKey: [...root, 'course', course, page],
    enabled: !student && Boolean(course),
    queryFn: ({ signal }) => cases.enrollments(course, page, signal),
  });
  const invalidate = () => Promise.all([
    client.invalidateQueries({ queryKey: root }),
    client.invalidateQueries({ queryKey: ['student-project-catalog', user?.id] }),
  ]);
  const createProject = useMutation({
    mutationFn: (input: { name: string; description: string }) =>
      cases.createCourseProject(course, input),
    onSuccess: invalidate,
  });
  const linkOrganization = useMutation({
    mutationFn: (input: { projectId: string; organizationLogin: string }) =>
      cases.linkOrganization(input.projectId, input.organizationLogin),
    onSuccess: invalidate,
  });
  const createCourse = useMutation({
    mutationFn: (
      input: Parameters<RepositoryProjectsUseCases['createCourse']>[0],
    ) => cases.createCourse(input),
    onSuccess: invalidate,
  });
  const enroll = useMutation({
    mutationFn: (id: string) => cases.requestEnrollment(id),
    onSuccess: invalidate,
  });
  const decide = useMutation({
    mutationFn: (input: { id: string; decision: 'APPROVE' | 'REJECT' }) =>
      cases.decideEnrollment(input.id, input.decision),
    onSuccess: invalidate,
  });
  return {
    student,
    userId: user?.id,
    courses,
    organizations,
    projects,
    catalog,
    admissions,
    pending,
    createProject,
    linkOrganization,
    createCourse,
    enroll,
    decide,
  };
}
