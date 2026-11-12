import { createContext, useContext } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  GetGitHubLinkUseCase,
  AuthorizeGitHubLinkUseCase,
} from '../../application/use-cases/github-link.use-cases';

export interface GitHubLinkDependencies {
  get: GetGitHubLinkUseCase;
  authorize: AuthorizeGitHubLinkUseCase;
}
export const GitHubLinkContext = createContext<GitHubLinkDependencies | null>(
  null,
);

export function useGitHubLink(userId: string, enabled: boolean) {
  const cases = useContext(GitHubLinkContext);
  if (!cases) throw new Error('GitHubLinkContext es obligatorio');
  const query = useQuery({
    queryKey: ['users', userId, 'github-link'],
    queryFn: ({ signal }) => cases.get.execute(signal),
    enabled,
    retry: false,
    refetchOnWindowFocus: true,
  });
  const authorization = useMutation({
    mutationFn: () => cases.authorize.execute(),
  });
  return { query, authorization };
}
