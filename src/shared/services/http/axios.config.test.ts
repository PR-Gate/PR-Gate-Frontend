import { expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/testing/mocks/server';
import { createHttpClient } from './axios.config';

it('does not send a protected request if the session has no access token', async () => {
  const received = vi.fn(() => HttpResponse.json({}));
  server.use(http.post('http://localhost/api/me/session', received));
  const client = createHttpClient(
    'http://localhost/api',
    async () => undefined,
    async () => {},
    true,
    { requireAccessToken: true },
  );
  await expect(client.post('/me/session', {})).rejects.toMatchObject({
    status: 401,
    code: 'ACCESS_TOKEN_MISSING',
  });
  expect(received).not.toHaveBeenCalled();
});

it('waits for the token before sending the bearer header', async () => {
  let complete: (token: string) => void = () => {};
  const pending = new Promise<string>((resolve) => {
    complete = resolve;
  });
  const received = vi.fn(({ request }: { request: Request }) => {
    expect(request.headers.get('Authorization')).toBe(
      'Bearer initialized-fixture',
    );
    return HttpResponse.json({ ok: true });
  });
  server.use(http.post('http://localhost/api/me/session', received));
  const client = createHttpClient(
    'http://localhost/api',
    () => pending,
    async () => {},
    true,
    { requireAccessToken: true },
  );
  const response = client.post('/me/session', {});
  expect(received).not.toHaveBeenCalled();
  complete('initialized-fixture');
  expect(await response).toEqual({ ok: true });
  expect(received).toHaveBeenCalledOnce();
});
