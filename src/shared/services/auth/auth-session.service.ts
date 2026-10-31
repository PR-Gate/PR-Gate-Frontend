export interface SessionUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly roles: readonly string[];
}
export type LoginProfile = 'teacher' | 'student';
export interface LoginOptions {
  profile?: LoginProfile;
  loginHint?: string;
}
export interface AuthSessionService {
  getUser(): Promise<SessionUser | null>;
  getAccessToken(): Promise<string | undefined>;
  login(options?: LoginOptions): Promise<void>;
  logout(): Promise<void>;
  expire(): Promise<void>;
  subscribe(listener: () => void): () => void;
}
