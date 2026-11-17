import { Link } from 'react-router';
import { lazy, Suspense } from 'react';
import { ArrowRight, FolderKanban, ShieldCheck } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/shared/services/auth/auth-context';
const StudentDashboardPage = lazy(async () => ({
  default: (await import('@/features/metrics')).StudentDashboardPage,
}));
export function DashboardPage() {
  const { user } = useAuth();
  if (
    user?.roles.includes('STUDENT') &&
    !user.roles.some((role) => role === 'TEACHER' || role === 'ADMIN')
  ) {
    return (
      <Suspense fallback={<p role="status">Cargando resumen…</p>}>
        <StudentDashboardPage />
      </Suspense>
    );
  }
  return (
    <section>
      <p className="eyebrow">VISTA GENERAL</p>
      <h1 className="page-title">Hola, {user?.name.split(' ')[0]}.</h1>
      <p className="mt-3 text-muted-foreground">
        Cada proyecto es una oportunidad para aprender.
      </p>
      <div className="mt-8 overflow-hidden rounded-2xl bg-sidebar p-8 text-white sm:p-12">
        <ShieldCheck className="mb-6 text-sidebar-highlight" size={32} />
        <h2 className="max-w-xl text-3xl font-semibold leading-tight">
          Acompaña el proceso.
          <br />
          Haz visible el aprendizaje.
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/60">
          Organiza los proyectos de tu curso y reúne evidencia del trabajo de
          tus equipos en un solo lugar.
        </p>
        <Button asChild className="mt-8">
          <Link to="/projects">
            <FolderKanban size={16} />
            Explorar proyectos
            <ArrowRight size={16} />
          </Link>
        </Button>
      </div>
      <p className="mt-7 text-sm text-muted-foreground">
        Las métricas académicas se incorporarán cuando estén disponibles los
        contratos del backend.
      </p>
    </section>
  );
}
export function UnauthorizedPage() {
  return (
    <main className="mx-auto max-w-xl p-12">
      <h1 className="text-2xl font-semibold">Acceso no autorizado</h1>
      <p className="my-4">
        Tu cuenta no tiene el rol necesario para abrir esta sección.
      </p>
      <Button asChild>
        <Link to="/dashboard">Volver al panel</Link>
      </Button>
    </main>
  );
}
export function NotFoundPage() {
  return (
    <main className="mx-auto max-w-xl p-12">
      <p className="eyebrow">404</p>
      <h1 className="page-title">Página no encontrada</h1>
      <p className="my-5 text-muted-foreground">
        La dirección no existe en este espacio.
      </p>
      <Button asChild>
        <Link to="/dashboard">Volver al inicio</Link>
      </Button>
    </main>
  );
}
