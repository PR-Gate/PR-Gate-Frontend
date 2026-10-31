import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { loginSchema, type LoginFormValues } from '../schemas/login.schema';
import { LoginRoleSelector } from './login-role-selector';
import type { useLogin } from '../hooks/use-login';

export function LoginForm({
  demo,
  session,
}: {
  demo: boolean;
  session: ReturnType<typeof useLogin>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '' },
  });
  const busy = session.loading || session.submitting;
  return (
    <form
      className="login-form"
      noValidate
      onSubmit={handleSubmit((values) => session.submit(values.email))}
      aria-label="Acceso institucional"
      aria-busy={busy}
    >
      <LoginRoleSelector
        value={session.profile}
        onChange={session.setProfile}
        disabled={busy}
      />
      <div className="login-field">
        <label htmlFor="login-email">
          Correo institucional <span>(opcional)</span>
        </label>
        <div className="login-input-wrap">
          <Mail size={16} aria-hidden="true" />
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            placeholder="nombre@universidad.edu"
            {...register('email')}
            disabled={busy}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={
              errors.email ? 'login-email-error' : 'login-email-help'
            }
          />
        </div>
        {errors.email ? (
          <p id="login-email-error" role="alert" className="login-field-error">
            {errors.email.message}
          </p>
        ) : (
          <p id="login-email-help" className="login-field-help">
            {demo
              ? 'Puedes explorar la demo sin ingresar un correo.'
              : 'Si lo indicas, se enviará al proveedor para facilitar el acceso.'}
          </p>
        )}
      </div>
      <div className="login-field">
        <label htmlFor="login-password">Contraseña</label>
        <div className="login-input-wrap login-input-disabled">
          <ShieldCheck size={16} aria-hidden="true" />
          <input
            id="login-password"
            type="password"
            disabled
            placeholder={
              demo
                ? 'No se requiere en la demostración'
                : 'Se solicita en el acceso institucional'
            }
            aria-describedby="login-password-help"
          />
        </div>
        <p id="login-password-help" className="login-field-help">
          {demo
            ? 'La demo utiliza perfiles de ejemplo y datos simulados.'
            : 'La contraseña y su recuperación se gestionan con tu institución.'}
        </p>
      </div>
      <label className="login-remember">
        <input
          type="checkbox"
          checked={session.rememberProfile}
          disabled={busy}
          onChange={(event) => session.setRememberProfile(event.target.checked)}
        />
        <span>Recordar mi perfil</span>
      </label>
      {session.error && (
        <p role="alert" className="login-auth-error">
          {session.error}
        </p>
      )}
      <Button type="submit" className="login-primary" disabled={busy}>
        {busy && (
          <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
        )}
        {session.loading
          ? 'Recuperando sesión…'
          : session.submitting
            ? 'Iniciando sesión…'
            : demo
              ? 'Explorar demostración'
              : 'Iniciar sesión'}
      </Button>
      {!demo && (
        <>
          <div className="login-divider">
            <span>o continúa con</span>
          </div>
          <Button
            type="button"
            variant="outline"
            className="login-sso"
            disabled={busy}
            onClick={() => {
              void session.submit();
            }}
          >
            <ShieldCheck size={17} strokeWidth={1.5} aria-hidden="true" />
            SSO institucional
          </Button>
        </>
      )}
      <p className="login-access-note">
        {demo
          ? 'El perfil seleccionado define la experiencia de demostración.'
          : 'Tu institución determina los permisos de tu cuenta.'}
      </p>
    </form>
  );
}
