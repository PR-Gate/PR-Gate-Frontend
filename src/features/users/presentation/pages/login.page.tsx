import { Navigate, useLocation } from 'react-router';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/shared/services/auth/auth-context';
export default function LoginPage({ demo }: { demo: boolean }) {
  const { user, loading, login, error } = useAuth();
  const location = useLocation();
  const state: unknown = location.state;
  const from =
    typeof state === 'object' &&
    state !== null &&
    'from' in state &&
    typeof state.from === 'string' &&
    state.from.startsWith('/') &&
    !state.from.startsWith('//') &&
    state.from !== '/login'
      ? state.from
      : '/projects';
  if (user) return <Navigate to={from} replace />;
  return (
    <>
      <ShieldCheck className="mb-6 text-emerald-800" size={36} />
      <p className="eyebrow">BIENVENIDO A PR GATE</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Del código al aprendizaje.
      </h1>
      <p className="my-5 text-sm leading-relaxed text-muted-foreground">
        Un espacio para acompañar proyectos universitarios con evidencia técnica
        y retroalimentación pedagógica.
      </p>
      {demo && (
        <p className="mb-5 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
          Demostración local con datos simulados. Ingresa como docente para
          explorar el flujo de proyectos.
        </p>
      )}
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-700">
          {error}
        </p>
      )}
      <Button
        className="w-full"
        disabled={loading}
        onClick={() => {
          void login();
        }}
      >
        {loading
          ? 'Recuperando sesión…'
          : demo
            ? 'Explorar demostración'
            : 'Ingresar con tu cuenta institucional'}
        <ArrowRight size={16} />
      </Button>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Proyectos · Calidad de software · Aprendizaje
      </p>
    </>
  );
}
