import { useAuth } from '@/shared/services/auth/auth-context';
import { GitHubLinkCard } from '../components/github-link-card';
export default function ProfilePage({ demo = false }: { demo?: boolean }) {
  const { user } = useAuth();
  return (
    <section>
      <p className="eyebrow">TU CUENTA</p>
      <h1 className="page-title">Perfil</h1>
      <dl className="mt-8 space-y-5 rounded-xl border border-border bg-white p-7">
        {[
          ['Nombre', user?.name],
          ['Correo', user?.email],
          ['Roles', user?.roles.join(', ')],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="mt-1 font-medium">{value || 'No disponible'}</dd>
          </div>
        ))}
      </dl>
      {user?.roles.includes('STUDENT') && <GitHubLinkCard demo={demo} />}
    </section>
  );
}
