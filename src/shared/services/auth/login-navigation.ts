const destinationKey = 'pr-gate:login-destination';

export function safeLoginDestination(value: unknown): string | null {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    [...value].some(
      (character) => character === '\\' || character.charCodeAt(0) <= 32,
    )
  )
    return null;
  try {
    const destination = new URL(value, 'https://app.invalid');
    if (
      destination.origin !== 'https://app.invalid' ||
      destination.pathname.replace(/\/+$/, '') === '/login'
    )
      return null;
    return destination.pathname + destination.search + destination.hash;
  } catch {
    return null;
  }
}

export function readLoginDestination(): string | null {
  try {
    return safeLoginDestination(sessionStorage.getItem(destinationKey));
  } catch {
    return null;
  }
}
export function saveLoginDestination(value: string) {
  try {
    const safe = safeLoginDestination(value);
    if (safe) sessionStorage.setItem(destinationKey, safe);
    else sessionStorage.removeItem(destinationKey);
  } catch {
    /* Login also works when browser storage is unavailable. */
  }
}
export function clearLoginDestination() {
  try {
    sessionStorage.removeItem(destinationKey);
  } catch {
    /* Storage is optional. */
  }
}
