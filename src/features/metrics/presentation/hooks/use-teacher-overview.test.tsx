import { renderHook, waitFor } from '@testing-library/react';
import { expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { createTestWrapper } from '@/testing/test-providers';
import { server } from '@/testing/mocks/server';
import { useTeacherOverview } from './use-teacher-overview';
it('loads domain data and keeps separate caches for course and period', async () => {
  const { result, rerender } = renderHook(
    ({ course, period }: { course: string; period: '7' | '30' }) =>
      useTeacherOverview(course, period),
    {
      initialProps: { course: 'software', period: '30' },
      wrapper: createTestWrapper(),
    },
  );
  expect(result.current.isPending).toBe(true);
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.generatedAt).toBeInstanceOf(Date);
  expect(result.current.data?.evaluatedProjects).toBe(24);
  rerender({ course: 'architecture', period: '7' });
  await waitFor(() =>
    expect(result.current.data?.course.id).toBe('architecture'),
  );
  expect(result.current.data?.evaluatedProjects).toBe(8);
});
it('exposes failed requests without using stale values as success', async () => {
  server.use(
    http.get(
      'http://localhost/api/demo/teacher-overview',
      () => new HttpResponse(null, { status: 400 }),
    ),
  );
  const { result } = renderHook(() => useTeacherOverview('', '30'), {
    wrapper: createTestWrapper(),
  });
  await waitFor(() => expect(result.current.isError).toBe(true));
  expect(result.current.data).toBeUndefined();
});
