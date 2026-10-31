import { afterEach, expect, it } from 'vitest';
import {
  clearLoginDestination,
  readLoginDestination,
  safeLoginDestination,
  saveLoginDestination,
} from './login-navigation';

afterEach(() => sessionStorage.clear());
it('keeps internal destinations, including filters and anchors', () => {
  expect(
    safeLoginDestination('/projects/campus-connect?view=activity#latest'),
  ).toBe('/projects/campus-connect?view=activity#latest');
});
it('rejects external locations, backslashes, login loops and malformed values', () => {
  for (const value of [
    'https://outside.test',
    '//outside.test',
    '/\\outside.test',
    '/login',
    '/login/?next=/projects',
    '/projects/../login',
    '/\n/evil.test',
    null,
    4,
  ])
    expect(safeLoginDestination(value)).toBeNull();
});
it('retains a safe destination across the provider redirect and clears it', () => {
  saveLoginDestination('/projects?status=active');
  expect(readLoginDestination()).toBe('/projects?status=active');
  clearLoginDestination();
  expect(readLoginDestination()).toBeNull();
  saveLoginDestination('//outside.test');
  expect(readLoginDestination()).toBeNull();
});
