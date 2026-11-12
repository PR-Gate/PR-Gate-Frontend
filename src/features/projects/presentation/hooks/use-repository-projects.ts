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
  organization = '',
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
  const repos = useInfiniteQuery({
    queryKey: [...root, 'github', organization],
    enabled: student && open,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      cases.repositories(pageParam, signal, organization),
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
    retry: false,
  });
  const organizations = useInfiniteQuery({
    queryKey: [...root, 'github-organizations'],
    enabled: student && open,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => cases.organizations(pageParam, signal),
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
    retry: false,
  });
  const selections = useQuery({
    queryKey: [...root, 'selections', page],
    enabled: student,
    queryFn: ({ signal }) => cases.selections(page, signal),
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
  const invalidate = () => client.invalidateQueries({ queryKey: root });
  const select = useMutation({
    mutationFn: (input: Parameters<RepositoryProjectsUseCases['select']>[0]) =>
      cases.select(input),
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
    courses,
    repos,
    organizations,
    selections,
    catalog,
    admissions,
    pending,
    select,
    createCourse,
    enroll,
    decide,
  };
}
