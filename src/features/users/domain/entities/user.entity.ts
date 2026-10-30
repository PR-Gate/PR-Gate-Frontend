export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';
export interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly roles: readonly UserRole[];
}
