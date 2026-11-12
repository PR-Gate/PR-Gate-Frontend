import { useState } from 'react';
import { Link, Navigate } from 'react-router';
import { useAuth } from '@/shared/services/auth/auth-context';
import type { LoginProfile } from '@/shared/services/auth/auth-session.service';
import { Button } from '@/shared/components/ui/button';
import { LoginRoleSelector } from '../components/login-role-selector';

export default function RegisterPage() {
  const auth = useAuth();
  const [profile, setProfile] = useState<LoginProfile>('student');
  const [submitting, setSubmitting] = useState(false);
  if (auth.user) return <Navigate to="/account" replace />;
  const busy = auth.loading || submitting;
  return (
    <section className="login-access-panel" aria-labelledby="register-heading">
      <div className="login-access-content">
        <p className="login-eyebrow">REGISTRO EN PR GATE</p>
        <h1 id="register-heading">Crear cuenta</h1>
        <p className="login-intro">
          Elige si eres docente o estudiante. Después completarás tus datos y
          contraseña en el registro institucional.
        </p>
        {auth.registrationEnabled ? (
          <form
            className="login-form"
            aria-label="Registro en PR Gate"
            onSubmit={(event) => {
              event.preventDefault();
              if (busy) return;
              setSubmitting(true);
              void auth
                .login({ register: true, profile })
                .finally(() => setSubmitting(false));
            }}
          >
            <p className="text-sm font-semibold">Tipo de cuenta</p>
            <LoginRoleSelector
              value={profile}
              onChange={setProfile}
              disabled={busy}
            />
            {auth.error && (
              <p role="alert" className="login-auth-error">
                {auth.error}
              </p>
            )}
            <Button type="submit" className="login-primary" disabled={busy}>
              {busy ? 'Abriendo registro…' : 'Continuar con el registro'}
            </Button>
          </form>
        ) : (
          <p role="status" className="mt-6 text-sm">
            El registro de cuentas no está habilitado en este entorno.
          </p>
        )}
        <p className="mt-6 text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-primary underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </section>
  );
}
