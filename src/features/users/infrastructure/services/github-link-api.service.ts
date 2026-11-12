import { z } from 'zod';
import type { HttpClient } from '@/shared/services/http/http-client';
import { HttpError } from '@/shared/services/http/http-error';
import type { GitHubLinkRepository } from '../../domain/repositories/github-link.repository';

const linkSchema = z.object({
  login: z.string().min(1),
  linkedAt: z.iso.datetime(),
});
const authorizationSchema = z.object({
  authorizationUrl: z.url().refine((value) => {
    const url = new URL(value);
    return (
      url.origin === 'https://github.com' &&
      url.pathname === '/login/oauth/authorize'
    );
  }),
  expiresAt: z.iso.datetime(),
});

export class GitHubLinkApiService implements GitHubLinkRepository {
  constructor(private readonly http: HttpClient) {}

  async get(signal?: AbortSignal) {
    try {
      return linkSchema.parse(
        await this.http.get<unknown>('/me/integrations/github', signal),
      );
    } catch (error) {
      if (
        error instanceof HttpError &&
        error.status === 404 &&
        error.code === 'GITHUB_NOT_LINKED'
      )
        return null;
      throw error;
    }
  }

  async authorize() {
    return authorizationSchema.parse(
      await this.http.post<unknown>(
        '/me/integrations/github/authorization',
        {},
      ),
    );
  }
}
