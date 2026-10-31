import { act, renderHook, waitFor } from '@testing-library/react';
import { expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { createTestWrapper } from '@/testing/test-providers';
import { server } from '@/testing/mocks/server';
import { useTests, useTestActions } from './use-assessments';
it('loads mapped data and invalidates the list after saving a draft', async () => {
  const { result } = renderHook(
    () => ({ query: useTests(), actions: useTestActions() }),
    { wrapper: createTestWrapper() },
  );
  expect(result.current.query.isPending).toBe(true);
  await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
  expect(result.current.query.data?.tests[0]?.courseName).toBe(
    'Ingeniería de Software',
  );
  await act(async () => {
    await result.current.actions.save.mutateAsync({
      input: {
        title: 'Borrador desde hook',
        courseId: 'software',
        durationMinutes: 30,
        instructions: '',
        questions: [],
        assignment: { mode: 'all', ids: [] },
        opensAt: '',
        closesAt: '',
      },
    });
  });
  await waitFor(() => expect(result.current.query.data?.tests).toHaveLength(5));
  expect(result.current.query.data?.tests[0]).toMatchObject({
    title: 'Borrador desde hook',
    status: 'draft',
  });
});
it('exposes errors rather than presenting a failed list as empty', async () => {
  server.use(
    http.get(
      'http://localhost/api/demo/assessments',
      () => new HttpResponse(null, { status: 400 }),
    ),
  );
  const { result } = renderHook(() => useTests(), {
    wrapper: createTestWrapper(),
  });
  await waitFor(() => expect(result.current.isError).toBe(true));
  expect(result.current.data).toBeUndefined();
});
