import { Navigate } from 'react-router';
import { ShieldCheck } from 'lucide-react';
import { LoginForm } from '../components/login-form';
import { useLogin } from '../hooks/use-login';
export default function LoginPage({ demo }: { demo: boolean }) {
  const session = useLogin();
  if (session.user) return <Navigate to={session.destination} replace />;
  return (
    <section className="login-access-panel" aria-labelledby="login-heading">
      <div className="login-access-content">
        <p className="login-eyebrow">ACCESO INSTITUCIONAL</p>
        <h1 id="login-heading">Bienvenido de nuevo</h1>
        <p className="login-intro">
          Selecciona tu perfil para entrar a tu espacio académico.
        </p>
        {demo && (
          <p className="login-demo-notice">Demostración · Datos simulados</p>
        )}
        <LoginForm demo={demo} session={session} />
        <p className="login-security-note">
          <ShieldCheck size={14} aria-hidden="true" />
          {demo
            ? 'PR Gate · Entorno de demostración'
            : 'Acceso cifrado y protegido por tu institución'}
        </p>
      </div>
    </section>
  );
}
