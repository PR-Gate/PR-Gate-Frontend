import { createContext, useContext } from 'react';
import type { SessionUser } from './auth-session.service';

export interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  error: string | null;
  login(): Promise<void>;
  logout(): Promise<void>;
}
export const AuthContext = createContext<AuthState | null>(null);
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider es obligatorio');
  return context;
}
