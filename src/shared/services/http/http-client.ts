export interface HttpClient {
  get<T>(path: string, signal?: AbortSignal): Promise<T>;
  post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T>;
  patch?<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T>;
}
