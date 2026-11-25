import { useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ArrowUpRight, Check, CircleDashed, Clock3, ShieldCheck, X } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/shared/services/auth/auth-context';
import { useEvaluationApi } from '@/features/metrics/presentation/hooks/use-evaluation';
import { useActiveProject } from '@/features/projects/presentation/hooks/use-active-project';
import '../styles/cicd.css';

const labels: Record<string, string> = {
  QUEUED: 'En cola', IN_PROGRESS: 'En curso', COMPLETED: 'Finalizada',
  SUCCESS: 'Exitosa', FAILURE: 'Fallida', CANCELLED: 'Cancelada',
  TIMED_OUT: 'Tiempo agotado', SKIPPED: 'Omitida', OK: 'Aprobado', ERROR: 'Fallido',
};

const tones: Partial<Record<string, 'positive' | 'negative' | 'pending'>> = {
  SUCCESS: 'positive', OK: 'positive', PASSED: 'positive',
  FAILURE: 'negative', ERROR: 'negative', FAILED: 'negative', TIMED_OUT: 'negative',
  QUEUED: 'pending', IN_PROGRESS: 'pending', REQUESTED: 'pending', WAITING: 'pending',
};

const stageIcons = {
  positive: Check,
  negative: X,
  pending: Clock3,
  link: ArrowUpRight,
  neutral: CircleDashed,
};

export function LivePipelinesPage() {
  const api = useEvaluationApi();
  const { user } = useAuth();
  const { projectId: routeProjectId } = useParams();
  const [searchParams] = useSearchParams();
  const [selectedRunId, setSelectedRunId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { active } = useActiveProject();
  const projectId = routeProjectId ?? searchParams.get('projectId') ?? active?.id ?? '';
  const runs = useInfiniteQuery({
    queryKey: ['pipeline-runs', user?.id, projectId],
    enabled: Boolean(projectId && user),
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => api.pipelineRuns(projectId, pageParam, signal),
    getNextPageParam: (last, _, page) => last.length === 20 ? page + 1 : undefined,
    refetchInterval: 15_000,
    retry: false,
  });
  const items = runs.data?.pages.flat() ?? [];
  const term = searchTerm.trim().toLowerCase();
  const visibleRuns = items.filter((item) =>
    (!statusFilter || (item.conclusion ?? item.status) === statusFilter) &&
    (!term || `${item.repository} ${item.branch} ${item.commitSha} ${item.workflowName}`.toLowerCase().includes(term)),
  );
  const run = visibleRuns.find((item) => item.id === selectedRunId) ?? visibleRuns[0];
  const statuses = [...new Set(items.map((item) => item.conclusion ?? item.status))];
  const state = run?.conclusion ?? run?.status;
  const gate = run?.sonarAnalysis?.qualityGateStatus;
  const seconds = run?.startedAt && run.completedAt
    ? Math.max(0, Math.floor((Date.parse(run.completedAt) - Date.parse(run.startedAt)) / 1000))
    : null;
  const stages = [
    ['Commit', 'Recibido', run ? `${run.branch} · ${run.commitSha}` : '', 'positive'],
    ['Build', 'GitHub Actions', 'Consulta el resultado de la compilación en GitHub Actions.', 'link'],
    ['Tests', 'GitHub Actions', 'Consulta los resultados de las pruebas en GitHub Actions.', 'link'],
    ['SonarQube', run?.sonarAnalysis ? 'Recibido' : 'Sin resultado recibido', 'Análisis técnico del código.', run?.sonarAnalysis ? 'positive' : 'neutral'],
    ['Quality Gate', gate ? labels[gate] ?? gate : 'Sin resultado recibido', 'Resultado reportado por SonarQube.', gate ? tones[gate] ?? 'neutral' : 'neutral'],
  ] as const;
  return (
    <section className="cicd-page">
      <nav className="cicd-navigation" aria-label="Navegación del proyecto">
        <Link to="/projects">Proyectos</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Ejecuciones CI/CD</span>
      </nav>
      <header>
        <p className="eyebrow">SEGUIMIENTO DEL PROYECTO</p>
        <h1 className="page-title">Ejecución CI/CD</h1>
        <p className="cicd-subtitle">Consulta el historial y las etapas del pipeline.</p>
      </header>
      {!projectId && <p>Selecciona un proyecto en la barra lateral para consultar su historial.</p>}
      {projectId && runs.isPending && <p role="status">Cargando ejecuciones…</p>}
      {runs.isError && (
        <p role="alert">
          No se pudieron consultar las ejecuciones de este proyecto.{' '}
          <Button variant="outline" onClick={() => void runs.refetch()}>Reintentar</Button>
        </p>
      )}
      {runs.isSuccess && items.length === 0 && (
        <p>CI/CD aún no tiene ejecuciones registradas para este proyecto.</p>
      )}
      {items.length > 0 && (
        <section className="cicd-panel p-5" aria-labelledby="run-history">
          <h2 id="run-history">Historial de ejecuciones</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-[2fr_1fr]">
            <label className="cicd-run-picker">
              Buscar por repositorio, rama o commit
              <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Ej. backend, main o d38e4759" />
            </label>
            <label className="cicd-run-picker">
              Estado
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">Todos los estados</option>
                {statuses.map((status) => <option key={status} value={status}>{labels[status] ?? status}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="cicd-help" role="status">{visibleRuns.length} de {items.length} ejecuciones cargadas</p>
            {(term || statusFilter) && <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(''); setStatusFilter(''); }}>Limpiar filtros</Button>}
          </div>
          {visibleRuns.length ? (
            <ul className="mt-2 max-h-72 divide-y divide-border overflow-y-auto rounded-lg border border-border">
              {visibleRuns.map((item) => {
                const result = item.conclusion ?? item.status;
                return (
                  <li key={item.id}>
                    <button type="button" aria-pressed={run?.id === item.id} onClick={() => setSelectedRunId(item.id)}
                      className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left text-sm hover:bg-muted aria-pressed:bg-primary-soft">
                      <span className="min-w-0">
                        <span className="block break-words font-medium">{item.repository}</span>
                        <span className="text-xs text-muted-foreground">{item.branch} · {item.commitSha.slice(0, 8)} · Intento {item.attempt}</span>
                      </span>
                      <span className="cicd-badge" data-tone={tones[result] ?? 'neutral'}>{labels[result] ?? result}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : <p className="mt-4 text-sm text-muted-foreground">Ninguna ejecución cargada coincide con los filtros.</p>}
          {runs.hasNextPage && (
            <Button className="mt-4" variant="outline" disabled={runs.isFetchingNextPage} onClick={() => void runs.fetchNextPage()}>
              Cargar más ejecuciones
            </Button>
          )}
        </section>
      )}
      {run && (
        <>
          <dl className="cicd-panel cicd-summary">
            <div><dt>Commit y rama</dt><dd>{run.branch} · <code title={run.commitSha}>{run.commitSha.slice(0, 8)}</code></dd></div>
            <div><dt>{run.startedAt ? 'Iniciado' : 'Registrado'}</dt><dd>{new Date(run.startedAt ?? run.createdAt).toLocaleString('es-PE')}</dd></div>
            <div><dt>Duración</dt><dd>{seconds === null ? '—' : `${Math.floor(seconds / 60)} min ${seconds % 60} s`}</dd></div>
            <div><dt>Estado de ejecución</dt><dd>{state && <span className="cicd-badge" data-tone={tones[state] ?? 'neutral'}>{labels[state] ?? state}</span>}</dd></div>
          </dl>
          <section className="cicd-panel cicd-timeline" aria-labelledby="live-stages-heading">
            <h2 id="live-stages-heading">Etapas de la ejecución</h2>
            <p className="cicd-help">{run.workflowName} · Intento {run.attempt}</p>
            <ol>
              {stages.map(([name, status, description, tone]) => {
                const Icon = stageIcons[tone];
                return (
                <li key={name}>
                  <span className="cicd-stage-icon" data-tone={tone}><Icon size={20} aria-hidden="true" /></span>
                  <div className="cicd-stage-copy">
                    <div className="cicd-stage-title"><h3>{name}</h3><span className="cicd-badge" data-tone={tone}>{status}</span></div>
                    <p className="break-all">{description}</p>
                  </div>
                </li>
                );
              })}
            </ol>
            <Button asChild variant="outline">
              <a href={run.runUrl} target="_blank" rel="noreferrer">Ver build y tests en GitHub Actions</a>
            </Button>
          </section>
          <aside className="cicd-notice">
            <ShieldCheck size={22} aria-hidden="true" />
            <div><h2>¿Cómo se genera la evaluación?</h2><p>La evaluación compara las métricas del código con las condiciones aprobadas.</p></div>
          </aside>
          <div className="cicd-footer">
            <Button asChild variant="outline">
              <Link to={`/my-rubric?projectId=${encodeURIComponent(projectId)}`}>Ver rúbrica y resultados</Link>
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
