import type { LoginProfile } from './auth-session.service';

const key = 'pr-gate:registration-profile';
// Temporary registration choice; the backend remains the source of official roles.
export function readRegistrationProfile(): LoginProfile | null {
  try {
    const value = sessionStorage.getItem(key);
    return value === 'teacher' || value === 'student' ? value : null;
  } catch {
    return null;
  }
}
export function saveRegistrationProfile(profile: LoginProfile) {
  try {
    sessionStorage.setItem(key, profile);
  } catch {
    /* The account page can ask again if storage is blocked. */
  }
}
export function clearRegistrationProfile() {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* Storage is optional. */
  }
}
