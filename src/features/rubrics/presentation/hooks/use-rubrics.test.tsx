import { act, renderHook, waitFor } from '@testing-library/react';
import { expect, it } from 'vitest';
import { createTestWrapper } from '@/testing/test-providers';
import { useRubricActions, useRubricLibrary } from './use-rubrics';
it('loads domain models and refreshes the library after duplicating a rubric', async () => {
  const { result } = renderHook(
    () => ({ query: useRubricLibrary(), actions: useRubricActions() }),
    { wrapper: createTestWrapper() },
  );
  expect(result.current.query.isPending).toBe(true);
  await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
  await act(async () => {
    await result.current.actions.duplicate.mutateAsync('quality-rubric');
  });
  await waitFor(() =>
    expect(result.current.query.data?.rubrics).toHaveLength(5),
  );
  expect(result.current.query.data?.rubrics[0]?.status).toBe('draft');
});
