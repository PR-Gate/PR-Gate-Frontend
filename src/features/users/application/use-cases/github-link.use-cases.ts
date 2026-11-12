import type { GitHubLinkRepository } from '../../domain/repositories/github-link.repository';

export class GetGitHubLinkUseCase {
  constructor(private readonly repository: GitHubLinkRepository) {}
  execute(signal?: AbortSignal) {
    return this.repository.get(signal);
  }
}

export class AuthorizeGitHubLinkUseCase {
  constructor(private readonly repository: GitHubLinkRepository) {}
  execute() {
    return this.repository.authorize();
  }
}
