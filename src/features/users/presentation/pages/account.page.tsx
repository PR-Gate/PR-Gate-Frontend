import { CheckCircle2, LogOut } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '@/shared/services/auth/auth-context';
import { Button } from '@/shared/components/ui/button';
import { GitHubLinkCard } from '../components/github-link-card';
import { CompleteProfileForm } from '../components/complete-profile-form';

export default function AccountPage({ demo = false }: { demo?: boolean }) {
  const { user, logout, error, refreshSession } = useAuth();
  return (
    <section
      className="mx-auto my-16 max-w-xl rounded-2xl border border-border bg-white p-8 shadow-sm"
      aria-labelledby="account-heading"
    >
      <CheckCircle2
        className="mb-5 text-emerald-600"
        size={36}
        aria-hidden="true"
      />
      <p className="eyebrow">TU CUENTA EN PR GATE</p>
      <h1 id="account-heading" className="page-title">
        Sesión iniciada
      </h1>
      <p className="mt-3 text-muted-foreground">
        Tu identidad se verificó correctamente.
      </p>
      <dl className="my-7 space-y-4">
        <div>
          <dt className="text-sm text-muted-foreground">Nombre</dt>
          <dd className="font-medium">{user?.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Correo</dt>
          <dd className="font-medium">{user?.email || 'No disponible'}</dd>
        </div>
      </dl>
      {!user?.academicProfilePending && !demo && (
        <p
          className="mb-5 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800"
          role="status"
        >
          Servicio de usuarios conectado · Perfil {user?.roles.join(', ')}{' '}
          confirmado.
        </p>
      )}
      {user?.academicProfilePending && (
        <div className="mb-6 rounded-lg bg-muted p-4 text-sm">
          <p role={user.academicProfileError ? 'alert' : undefined}>
            {user.academicProfileError ??
              'Tu sesión está iniciada. Falta conectar tu perfil académico con el servicio de usuarios.'}
          </p>
          {refreshSession && (
            <Button
              type="button"
              variant="outline"
              className="mt-3"
              onClick={() => void refreshSession()}
            >
              Reintentar conexión
            </Button>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-700">
          {error}
        </p>
      )}
      {user?.academicProfileRequired && <CompleteProfileForm />}
      {(user?.academicProfilePending || user?.roles.includes('STUDENT')) && (
        <div className="mb-6">
          <GitHubLinkCard demo={demo} />
        </div>
      )}
      {!user?.academicProfilePending && (
        <Button asChild variant="outline" className="mb-4 mr-3">
          <Link to="/dashboard">Ir a mi espacio</Link>
        </Button>
      )}
      <Button
        type="button"
        onClick={() => {
          void logout();
        }}
      >
        <LogOut size={16} aria-hidden="true" />
        Cerrar sesión
      </Button>
    </section>
  );
}
