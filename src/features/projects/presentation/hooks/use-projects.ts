import { useQuery } from '@tanstack/react-query';
import { useProjectsDependencies } from './projects-context';
export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: string) => ['projects', id] as const,
};
export function useProjects() {
  const { getProjects } = useProjectsDependencies();
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: ({ signal }) => getProjects.execute(signal),
  });
}
export function useProject(id: string) {
  const { getProjectById } = useProjectsDependencies();
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: ({ signal }) => getProjectById.execute(id, signal),
    enabled: Boolean(id),
  });
}
