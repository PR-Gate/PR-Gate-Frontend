import { renderHook, waitFor } from '@testing-library/react';
import { expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { createTestWrapper } from '@/testing/test-providers';
import { server } from '@/testing/mocks/server';
import { useProjects } from './use-projects';
it('transitions from pending to mapped domain projects', async () => {
  const { result } = renderHook(() => useProjects(), {
    wrapper: createTestWrapper(),
  });
  expect(result.current.isPending).toBe(true);
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.[0]?.updatedAt).toBeInstanceOf(Date);
});
it('exposes HTTP errors', async () => {
  server.use(
    http.get(
      'http://localhost/api/projects',
      () => new HttpResponse(null, { status: 503 }),
    ),
  );
  const { result } = renderHook(() => useProjects(), {
    wrapper: createTestWrapper(),
  });
  await waitFor(() => expect(result.current.isError).toBe(true));
});
