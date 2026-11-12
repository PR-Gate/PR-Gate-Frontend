import { useState } from 'react';
import { GitBranch, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/shared/services/auth/auth-context';
import { useGitHubLink } from '../hooks/use-github-link';

export function GitHubLinkCard({ demo = false }: { demo?: boolean }) {
  const { user } = useAuth();
  const enabled = Boolean(
    user?.roles.includes('STUDENT') && !user.academicProfilePending && !demo,
  );
  const { query, authorization } = useGitHubLink(user?.id ?? '', enabled);
  const [notice, setNotice] = useState('');

  async function link() {
    // Open synchronously so the browser can associate the window with the click.
    const popup = window.open('about:blank', '_blank');
    if (!popup) {
      setNotice(
        'Permite las ventanas emergentes para autorizar tu cuenta de GitHub.',
      );
      return;
    }
    popup.opener = null;
    setNotice('');
    try {
      const result = await authorization.mutateAsync();
      if (Date.parse(result.expiresAt) <= Date.now())
        throw new Error('expired');
      popup.location.replace(result.authorizationUrl);
      setNotice(
        'Completa la autorización en la otra pestaña. Después vuelve aquí y pulsa «Actualizar estado». Solo se mostrará la cuenta cuando el backend confirme el vínculo.',
      );
    } catch {
      popup.close();
      setNotice(
        'No se pudo iniciar la vinculación. Comprueba que la integración esté habilitada en el backend y vuelve a intentarlo.',
      );
    }
  }

  return (
    <section
      className="mt-7 rounded-xl border border-border bg-white p-6 sm:p-7"
      aria-labelledby="github-heading"
    >
      <div className="flex items-center gap-3">
        <GitBranch size={24} aria-hidden="true" />
        <h2 id="github-heading" className="text-lg font-semibold">
          Cuenta de GitHub
        </h2>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Se abrirá GitHub para que inicies sesión o selecciones tu cuenta y
        autorices el acceso de PR Gate a los repositorios permitidos por tu
        GitHub App, incluidos los privados que hayas autorizado en su
        instalación.
      </p>
      {!enabled ? (
        <p
          id="github-unavailable"
          className="my-4 rounded-lg bg-muted p-4 text-sm"
        >
          {demo
            ? 'Demostración: la vinculación real con GitHub no está habilitada en este modo.'
            : 'Pendiente de integración: tu sesión ya está iniciada, pero falta confirmar tu perfil de estudiante para habilitar la vinculación con GitHub.'}
        </p>
      ) : query.isPending ? (
        <p role="status" className="my-4 text-sm">
          Consultando vínculo en el backend…
        </p>
      ) : query.isError ? (
        <p role="alert" className="my-4 text-sm text-red-700">
          No se pudo consultar GitHub en el backend. Comprueba tu conexión y
          vuelve a intentarlo.
        </p>
      ) : query.data ? (
        <div
          role="status"
          className="my-4 flex items-center gap-2 text-sm text-emerald-700"
        >
          <CheckCircle2 size={18} aria-hidden="true" />
          Cuenta vinculada: @{query.data.login} ·{' '}
          {new Date(query.data.linkedAt).toLocaleDateString('es-PE')}
        </div>
      ) : (
        <p className="my-4 text-sm">
          Sin cuenta vinculada. El backend confirmará el estado después de
          autorizar en GitHub.
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        {
          <Button
            type="button"
            onClick={() => void link()}
            disabled={
              !enabled ||
              query.isFetching ||
              query.isError ||
              authorization.isPending
            }
            aria-describedby={!enabled ? 'github-unavailable' : undefined}
          >
            <GitBranch size={17} aria-hidden="true" />
            {authorization.isPending
              ? 'Iniciando autorización…'
              : query.data
                ? 'Renovar autorización de GitHub'
                : 'Vincular cuenta de GitHub'}
          </Button>
        }
        {enabled && (
          <Button
            type="button"
            variant="outline"
            disabled={query.isFetching || authorization.isPending}
            onClick={() => void query.refetch()}
          >
            {query.isFetching ? 'Consultando…' : 'Actualizar estado'}
          </Button>
        )}
      </div>
      {notice && (
        <p role="status" className="mt-4 text-sm">
          {notice}
        </p>
      )}
    </section>
  );
}
