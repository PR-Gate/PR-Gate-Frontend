import { setupWorker } from 'msw/browser';
import { createProjectHandlers } from './handlers';
export async function startMocks(baseUrl: string) {
  const base = new URL(baseUrl, window.location.origin)
    .toString()
    .replace(/\/$/, '');
  const worker = setupWorker(...createProjectHandlers(base, 400));
  await worker.start({ onUnhandledFrame: 'bypass' });
}
