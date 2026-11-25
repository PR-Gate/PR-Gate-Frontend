import { useQuery } from '@tanstack/react-query';
import { Activity, FolderKanban, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import { useActiveProject } from '@/features/projects/presentation/hooks/use-active-project';
import { ErrorState } from '@/shared/components/feedback/async-state';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/shared/services/auth/auth-context';
import { useEvaluationApi } from '../hooks/use-evaluation';
import { StudentSummaryCards } from '../components/student-summary-cards';
import { StudentProjectsOverview } from '../components/student-projects-overview';
import { StudentLatestEvaluation } from '../components/student-latest-evaluation';
import { StudentNextStep } from '../components/student-next-step';
import type { StudentOverview } from '../../domain/entities/student-overview.entity';
import '../styles/student-dashboard.css';

export function LiveStudentDashboardPage() {
  const { user } = useAuth();
  const { active, catalog, projects } = useActiveProject();
  const api = useEvaluationApi();
  const projectId = active?.id ?? '';
  const runs = useQuery({
    queryKey: ['student-dashboard-runs', user?.id, projectId],
    enabled: Boolean(projectId),
    queryFn: ({ signal }) => api.pipelineRuns(projectId, 0, signal),
  });
  const latest = runs.data?.[0];
  const evaluation = useQuery({
    queryKey: ['student-dashboard-evaluation', user?.id, projectId],
    enabled: Boolean(projectId),
    refetchInterval: 15_000,
    queryFn: async ({ signal }) => {
      const repositories = await api.repositories(projectId, signal);
      const ids = [...new Set(repositories.map((repository) => repository.id))];
      const candidates = await Promise.all(ids.map(async (id) => {
        const [result] = await api.evaluations(projectId, id, 0, signal);
        if (!result) return [];
        const evidence = await api.evidence(projectId, result.id, signal);
        return [{ result, evidence }];
      }));
      return candidates.flat().sort((a, b) =>
        Date.parse(b.evidence.reference.analyzedAt) - Date.parse(a.evidence.reference.analyzedAt))[0] ?? null;
    },
  });
  const evaluationId = evaluation.data?.result.id ?? '';
  const estimate = useQuery({
    queryKey: ['student-dashboard-estimate', user?.id, projectId, evaluationId],
    enabled: Boolean(evaluationId),
    queryFn: ({ signal }) => api.estimate(projectId, evaluationId, signal),
    refetchInterval: (query) => query.state.data === null ? 10_000 : false,
  });
  const score = estimate.data?.estimatedScore;
  const grade = estimate.data?.status === 'COMPLETE' && score != null
    ? { value: score, maximum: estimate.data.maxScore } : null;
  const gate = latest?.sonarAnalysis?.qualityGateStatus;
  const conclusion = latest?.conclusion;
  const recentRuns = runs.data;
  const measuredGates = recentRuns?.flatMap((run) => {
    const result = run.sonarAnalysis?.qualityGateStatus;
    return result === 'OK' || result === 'WARN' || result === 'ERROR' ? [result] : [];
  });
  const overview: StudentOverview = {
    projects: catalog.isSuccess ? {
      total: projects.length, active: null, completed: null,
      items: catalog.data.flatMap(({ course, projects: courseProjects }) =>
        courseProjects.map((project) => ({
          id: project.id, name: project.name, course: course.name,
          status: project.id === projectId ? 'Proyecto activo' : project.organizationLogin ? 'Organización vinculada' : 'Por vincular',
          grade: project.id === projectId ? grade : null,
        }))),
    } : null,
    pipelines: recentRuns ? {
      total: recentRuns.length,
      successful: recentRuns.filter((run) => run.conclusion === 'SUCCESS').length,
      periodLabel: 'hasta 20 intentos del proyecto',
    } : null,
    qualityGates: measuredGates ? {
      total: measuredGates.length,
      passed: measuredGates.filter((result) => result === 'OK').length,
      requiringCorrection: measuredGates.filter((result) => result === 'ERROR').length,
    } : null,
    currentGrade: grade,
    latestEvaluation: active && evaluation.data ? {
      projectName: active.name,
      pipelineLabel: evaluation.data.result.commitSha.slice(0, 8),
      reviewLabel: evaluation.data.result.status === 'COMPLETED' ? 'Completa' : 'Parcial',
      grade,
      metrics: [
        { id: 'coverage', label: 'Cobertura', unit: '%' },
        { id: 'sqale_debt_ratio', label: 'Deuda técnica', unit: '%' },
        { id: 'vulnerabilities', label: 'Vulnerabilidades', unit: '' },
      ].map(({ id, label, unit }) => {
        const value = evaluation.data?.evidence.evidence.measures[id];
        return { id, label, formattedValue: value == null ? null : `${value}${unit}`, assessmentLabel: value == null ? null : 'SonarQube' };
      }),
    } : null,
    recommendation: !active
      ? { title: 'Elige tu proyecto', description: 'Selecciona un proyecto en la barra lateral o abre tus cursos para crear uno.' }
      : gate === 'ERROR'
        ? { title: 'Revisa el Quality Gate', description: 'La última ejecución tiene condiciones de calidad que requieren atención.' }
        : evaluation.data
          ? { title: 'Revisa tu evaluación', description: 'Consulta los criterios de la rúbrica y la evidencia del código.' }
          : { title: 'Consulta la ejecución del proyecto', description: 'Revisa GitHub Actions y el estado del análisis desde Pipelines.' },
  };
  return (
    <section className="student-dashboard">
      <header className="student-page-heading">
        <div><h1 className="page-title">Hola, {user?.name.trim().split(/\s+/)[0]}</h1>
          {active && <p>{active.name}</p>}
        </div>
        <Button asChild variant="outline"><Link to="/projects"><FolderKanban size={16} />Mis proyectos</Link></Button>
      </header>
      {catalog.isPending && <p role="status">Cargando tus proyectos…</p>}
      {catalog.isError && <ErrorState error={catalog.error} retry={() => void catalog.refetch()} />}
      {catalog.isSuccess && !active && <p>{projects.length ? 'Selecciona un proyecto en la barra lateral.' : 'Aún no tienes proyectos. Entra a un curso para crear uno.'}</p>}
      <StudentSummaryCards overview={overview} gradeLabel="Estimación de IA" />
      <div className="student-widget-grid">
        <StudentProjectsOverview overview={overview} />
        <StudentLatestEvaluation overview={overview} resultPath={active ? '/my-rubric' : undefined} />
      </div>
      {active && evaluation.isPending && <p role="status">Cargando evaluación…</p>}
      {evaluation.isError && <ErrorState error={evaluation.error} retry={() => void evaluation.refetch()} />}
      {estimate.isError && <ErrorState error={estimate.error} retry={() => void estimate.refetch()} />}
      {active && (
        <div className="student-widget-grid">
          <article className="student-panel space-y-3 p-6">
            <h2 className="flex items-center gap-2 font-semibold"><Activity size={18} className="text-primary" />Última ejecución CI/CD</h2>
            {runs.isPending && <p role="status">Cargando ejecuciones…</p>}
            {runs.isError && <ErrorState error={runs.error} retry={() => void runs.refetch()} />}
            {runs.isSuccess && <p className="text-sm text-muted-foreground">
              {latest ? `${latest.repository} · ${latest.branch} · ${latest.commitSha.slice(0, 8)}` : 'Aún no hay ejecuciones registradas.'}
            </p>}
            {latest && <p className="text-sm font-medium">{conclusion === 'SUCCESS' ? 'Exitosa' : conclusion === 'FAILURE' ? 'Fallida' : conclusion ?? latest.status}</p>}
            <Button asChild variant="outline"><Link to="/pipelines">Ver ejecuciones</Link></Button>
          </article>
          <article className="student-panel space-y-3 p-6">
            <h2 className="flex items-center gap-2 font-semibold"><ShieldCheck size={18} className="text-primary" />Quality Gate</h2>
            {runs.isSuccess && <p className="text-sm text-muted-foreground">{gate === 'OK' ? 'Aprobado' : gate === 'ERROR' ? 'Fallido' : gate ?? 'Sin resultado de SonarQube para la última ejecución.'}</p>}
          </article>
        </div>
      )}
      <StudentNextStep overview={overview} action={{
        to: !active ? '/projects' : evaluation.data || gate === 'ERROR' ? '/my-rubric' : '/pipelines',
        label: !active ? 'Ver proyectos' : evaluation.data || gate === 'ERROR' ? 'Ver resultados' : 'Ver ejecuciones',
      }} />
    </section>
  );
}
