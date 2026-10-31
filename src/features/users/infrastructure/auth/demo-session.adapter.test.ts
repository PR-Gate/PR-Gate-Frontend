import { expect, it } from 'vitest';
import { createDemoSession } from './demo-session.adapter';

it('preserves teacher login as the default and clears it on logout', async () => {
  const session = createDemoSession();
  await session.login();
  expect((await session.getUser())?.roles).toEqual(['TEACHER']);
  await session.logout();
  expect(await session.getUser()).toBeNull();
});
it('supports student demo without granting teacher privileges or issuing tokens', async () => {
  const session = createDemoSession();
  await session.login({
    profile: 'student',
    loginHint: 'someone@example.test',
  });
  expect(await session.getUser()).toMatchObject({
    id: 'demo-student',
    roles: ['STUDENT'],
    email: 'estudiante@example.test',
  });
  expect(await session.getAccessToken()).toBeUndefined();
  await session.expire();
  expect(await session.getUser()).toBeNull();
});
