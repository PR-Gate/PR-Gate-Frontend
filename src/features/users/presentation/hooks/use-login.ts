import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { useAuth } from '@/shared/services/auth/auth-context';
import type { LoginProfile } from '@/shared/services/auth/auth-session.service';
import {
  clearLoginDestination,
  readLoginDestination,
  safeLoginDestination,
  saveLoginDestination,
} from '@/shared/services/auth/login-navigation';

const profileKey = 'pr-gate:login-profile';
function readProfile(): LoginProfile | null {
  try {
    const value = localStorage.getItem(profileKey);
    return value === 'teacher' || value === 'student' ? value : null;
  } catch {
    return null;
  }
}

export function useLogin() {
  const auth = useAuth();
  const location = useLocation();
  const [preferences] = useState(() => readProfile());
  const [profile, setProfile] = useState<LoginProfile>(
    preferences ?? 'teacher',
  );
  const [rememberProfile, setRememberProfile] = useState(preferences !== null);
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);
  const [destination] = useState(() => {
    const state: unknown = location.state;
    const from =
      typeof state === 'object' && state !== null && 'from' in state
        ? state.from
        : null;
    return safeLoginDestination(from) ?? readLoginDestination() ?? '/projects';
  });

  useEffect(() => {
    if (auth.user) clearLoginDestination();
  }, [auth.user]);

  const submit = async (email?: string, register = false) => {
    if (auth.loading || inFlight.current) return;
    inFlight.current = true;
    setSubmitting(true);
    saveLoginDestination(destination);
    try {
      try {
        if (rememberProfile) localStorage.setItem(profileKey, profile);
        else localStorage.removeItem(profileKey);
      } catch {
        /* Remembering a profile is optional. */
      }
      await auth.login({
        profile,
        ...(email?.trim() ? { loginHint: email.trim() } : {}),
        ...(register ? { register: true } : {}),
      });
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  return {
    ...auth,
    profile,
    setProfile,
    rememberProfile,
    setRememberProfile,
    submitting,
    submit,
    destination,
  };
}
