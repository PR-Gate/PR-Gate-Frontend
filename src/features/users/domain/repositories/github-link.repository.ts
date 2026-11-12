export interface GitHubLink {
  login: string;
  linkedAt: string;
}

export interface GitHubAuthorization {
  authorizationUrl: string;
  expiresAt: string;
}

export interface GitHubLinkRepository {
  get(signal?: AbortSignal): Promise<GitHubLink | null>;
  authorize(): Promise<GitHubAuthorization>;
}
