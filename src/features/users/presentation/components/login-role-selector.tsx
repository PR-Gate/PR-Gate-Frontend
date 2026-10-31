import { BookOpen, Users } from 'lucide-react';
import type { LoginProfile } from '@/shared/services/auth/auth-session.service';

export function LoginRoleSelector({
  value,
  onChange,
  disabled,
}: {
  value: LoginProfile;
  onChange(value: LoginProfile): void;
  disabled: boolean;
}) {
  return (
    <fieldset className="login-role-fieldset" disabled={disabled}>
      <legend className="sr-only">Perfil de acceso</legend>
      <div className="login-role-selector">
        {(
          [
            { value: 'teacher', label: 'Docente', icon: BookOpen },
            { value: 'student', label: 'Estudiante', icon: Users },
          ] as const
        ).map(({ value: profile, label, icon: Icon }) => (
          <label key={profile} className="login-role-option">
            <input
              type="radio"
              name="login-profile"
              value={profile}
              checked={value === profile}
              onChange={() => onChange(profile)}
              className="peer sr-only"
            />
            <span className="peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#265dcc]">
              <Icon size={17} strokeWidth={1.5} aria-hidden="true" />
              {label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
