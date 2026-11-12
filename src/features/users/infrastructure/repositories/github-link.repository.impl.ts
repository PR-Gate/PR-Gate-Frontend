import type { GitHubLinkRepository } from '../../domain/repositories/github-link.repository';
import type { GitHubLinkApiService } from '../services/github-link-api.service';

export class GitHubLinkRepositoryImpl implements GitHubLinkRepository {
  constructor(private readonly api: GitHubLinkApiService) {}
  get(signal?: AbortSignal) {
    return this.api.get(signal);
  }
  authorize() {
    return this.api.authorize();
  }
}
