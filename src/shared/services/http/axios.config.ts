import axios from 'axios';
import type { HttpClient } from './http-client';
import { installInterceptors } from './interceptors';

export function createHttpClient(
  baseURL: string,
  getToken: () => Promise<string | undefined>,
  onUnauthorized: () => Promise<void>,
  withCredentials = false,
  options: { requireAccessToken?: boolean; timeoutMs?: number } = {},
): HttpClient {
  const client = axios.create({
    baseURL,
    timeout: options.timeoutMs ?? 15_000,
    withCredentials,
    headers: { Accept: 'application/json' },
  });
  installInterceptors(
    client,
    getToken,
    onUnauthorized,
    options.requireAccessToken,
  );
  return {
    async patch<T>(path: string, body: unknown, signal?: AbortSignal) {
      return (await client.patch<T>(path, body, { signal })).data;
    },
    async get<T>(path: string, signal?: AbortSignal) {
      return (await client.get<T>(path, { signal })).data;
    },
    async post<T>(path: string, body: unknown, signal?: AbortSignal) {
      return (await client.post<T>(path, body, { signal })).data;
    },
  };
}
