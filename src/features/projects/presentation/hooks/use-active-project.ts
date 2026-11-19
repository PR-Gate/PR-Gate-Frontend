import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EvaluationPage } from '@/features/metrics/domain/evaluation';
import { useEvaluationApi } from '@/features/metrics/presentation/hooks/use-evaluation';
import { useAuth } from '@/shared/services/auth/auth-context';

const useProjectSelection = create(persist<{
  byUser: Record<string, string>;
  select: (userId: string, projectId: string) => void;
}>((set) => ({
  byUser: {},
  select: (userId, projectId) => set(({ byUser }) => ({
    byUser: { ...byUser, [userId]: projectId },
  })),
}), { name: 'prgate.active-project' }));

async function allPages<T>(fetchPage: (page: number) => Promise<EvaluationPage<T>>) {
  const items: T[] = [];
  for (let page = 0; ; page += 1) {
    const result = await fetchPage(page);
    items.push(...result.items);
    if (!result.hasNext) return items;
  }
}

export function useActiveProject() {
  const { user } = useAuth();
  const api = useEvaluationApi();
  const userId = user?.id ?? '';
  const savedId = useProjectSelection((state) => state.byUser[userId]);
  const select = useProjectSelection((state) => state.select);
  const catalog = useQuery({
    queryKey: ['student-project-catalog', userId],
    enabled: Boolean(userId && user?.roles.includes('STUDENT')),
    queryFn: async ({ signal }) => {
      const courses = await allPages((page) => api.courses(page, signal));
      return Promise.all(courses.map(async (course) => ({
        course,
        projects: await allPages((page) => api.projects(course.id, page, signal)),
      })));
    },
    staleTime: 30_000,
  });
  const projects = catalog.data?.flatMap((group) => group.projects) ?? [];
  return {
    catalog,
    projects,
    active: projects.find((project) => project.id === savedId),
    selectProject: (projectId: string) => {
      if (projectId === '' || projects.some((project) => project.id === projectId)) {
        select(userId, projectId);
      }
    },
  };
}
