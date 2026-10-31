import { renderHook, waitFor } from '@testing-library/react';
import { expect, it } from 'vitest';
import { createTestWrapper } from '@/testing/test-providers';
import { useStudents } from './use-students';
it('loads and isolates the server cache by course', async () => {
  const { result, rerender } = renderHook(({ course }) => useStudents(course), {
    initialProps: { course: 'software' },
    wrapper: createTestWrapper(),
  });
  expect(result.current.isPending).toBe(true);
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.students).toHaveLength(5);
  rerender({ course: 'quality' });
  await waitFor(() => expect(result.current.data?.course.id).toBe('quality'));
  expect(result.current.data?.students).toHaveLength(4);
});
