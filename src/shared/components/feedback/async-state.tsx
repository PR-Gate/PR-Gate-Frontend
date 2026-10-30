import { AlertCircle, FolderOpen, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
export function LoadingState() {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      {[1, 2, 3].map((id) => (
        <div
          key={id}
          className="h-64 animate-pulse rounded-xl border border-border bg-white p-5"
        >
          <div className="mb-6 h-10 w-10 rounded bg-muted" />
          <div className="mb-3 h-5 w-3/4 rounded bg-muted" />
          <div className="h-4 rounded bg-muted" />
        </div>
      ))}
      <span className="sr-only">Cargando proyectos…</span>
    </div>
  );
}
export function ErrorState({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-100 bg-white p-10 text-center"
    >
      <AlertCircle className="mx-auto mb-3 text-red-600" />
      <h2 className="font-semibold">No pudimos cargar la información</h2>
      <p className="my-3 text-sm text-muted-foreground">
        {error instanceof Error ? error.message : 'Inténtalo nuevamente.'}
      </p>
      <Button variant="outline" onClick={retry}>
        <RefreshCw size={15} />
        Reintentar
      </Button>
    </div>
  );
}
export function EmptyState({
  title = 'Aún no hay proyectos',
  description = 'Crea tu primer proyecto para comenzar a reunir evidencia técnica.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center">
      <FolderOpen className="mx-auto mb-4 text-muted-foreground" size={32} />
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
