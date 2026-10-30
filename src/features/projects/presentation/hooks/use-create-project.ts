import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateProjectInput } from '../../domain/repositories/project.repository';
import { useProjectsDependencies } from './projects-context';
import { projectKeys } from './use-projects';
export function useCreateProject() {
  const { createProject } = useProjectsDependencies();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject.execute(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: projectKeys.all }),
  });
}
