import axios from 'axios';
import type { HttpClient } from './http-client';
import { installInterceptors } from './interceptors';

export function createHttpClient(
  baseURL: string,
  getToken: () => Promise<string | undefined>,
  onUnauthorized: () => Promise<void>,
): HttpClient {
  const client = axios.create({
    baseURL,
    timeout: 15_000,
    headers: { Accept: 'application/json' },
  });
  installInterceptors(client, getToken, onUnauthorized);
  return {
    async get<T>(path: string, signal?: AbortSignal) {
      return (await client.get<T>(path, { signal })).data;
    },
    async post<T>(path: string, body: unknown, signal?: AbortSignal) {
      return (await client.post<T>(path, body, { signal })).data;
    },
  };
}
