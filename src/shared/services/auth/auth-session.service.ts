export interface SessionUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly roles: readonly string[];
  readonly academicProfilePending?: boolean;
  readonly academicProfileError?: string;
  readonly academicProfileRequired?: boolean;
}
export type LoginProfile = 'teacher' | 'student';
export interface LoginOptions {
  profile?: LoginProfile;
  loginHint?: string;
  register?: boolean;
}
export interface AuthSessionService {
  readonly registrationEnabled?: boolean;
  getUser(): Promise<SessionUser | null>;
  getAccessToken(): Promise<string | undefined>;
  login(options?: LoginOptions): Promise<void>;
  completeProfile?(profile: LoginProfile): Promise<SessionUser>;
  logout(): Promise<void>;
  expire(): Promise<void>;
  subscribe(listener: () => void): () => void;
}
