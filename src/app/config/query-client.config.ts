import { QueryClient } from '@tanstack/react-query';
import { HttpError } from '@/shared/services/http/http-error';
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: (count, error) =>
          !(
            error instanceof HttpError &&
            error.status >= 400 &&
            error.status < 500
          ) && count < 1,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  });
}
