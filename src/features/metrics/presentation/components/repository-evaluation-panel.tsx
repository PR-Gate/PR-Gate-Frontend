import { useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/shared/services/auth/auth-context';
import type { EvaluationRepository } from '../../domain/evaluation';
import { useEvaluationApi } from '../hooks/use-evaluation';
import { EvaluationEmpty, EvaluationError, evaluationStatus } from './evaluation-feedback';
import { EvaluationResultDetail } from './evaluation-result-detail';

export function RepositoryEvaluationPanel({ projectId, repository, teacher }: { projectId: string; repository: EvaluationRepository; teacher: boolean }) {
  const api = useEvaluationApi(); const { user } = useAuth(); const client = useQueryClient();
  const key = ['live-evaluation', user?.id, projectId] as const;
  const [eventId, setEventId] = useState(''); const [evaluationId, setEvaluationId] = useState('');
  const configurations = useQuery({ queryKey: [...key, 'configurations', repository.id], queryFn: ({ signal }) => api.configurations(projectId, repository.id, signal) });
  const configuration = configurations.data?.find(c => c.gitRef === repository.gitRef);
  const gate = useQuery({ queryKey: [...key, 'gate', configuration?.id], enabled: Boolean(configuration), queryFn: ({ signal }) => api.gate(projectId, configuration!.id, signal), refetchInterval: query => ['PENDING', 'DELIVERED'].includes(query.state.data?.synchronization_state ?? '') ? 2000 : false });
  const retryGate = useMutation({ mutationFn: () => api.retryGate(projectId, configuration!.id), onSuccess: () => client.invalidateQueries({ queryKey: [...key, 'gate'] }) });
  const analyses = useInfiniteQuery({ queryKey: [...key, 'analyses', repository.id, repository.gitRef], initialPageParam: 0, queryFn: ({ signal, pageParam }) => api.analyses(projectId, repository, pageParam, signal), getNextPageParam: (last, _, page) => last.length === 20 ? page + 1 : undefined, refetchInterval: 10_000 });
  const results = useInfiniteQuery({ queryKey: [...key, 'results', repository.id], initialPageParam: 0, queryFn: ({ signal, pageParam }) => api.evaluations(projectId, repository.id, pageParam, signal), getNextPageParam: (last, _, page) => last.length === 20 ? page + 1 : undefined, refetchInterval: 10_000 });
  const revisions = analyses.data?.pages.flat() ?? [];
  const latestAnalysis = revisions[0];
  const sonarStatus = latestAnalysis?.qualityGateStatus;
  const evaluations = results.data?.pages.flat().filter(e => e.gitRef === repository.gitRef) ?? [];
  const event = revisions.find(e => e.eventId === eventId) ?? revisions[0];
  const result = evaluations.find(e => e.id === evaluationId) ?? evaluations[0];
  const evaluate = useMutation({ mutationFn: () => api.evaluate(projectId, configuration!.id, event!.eventId), onSuccess: async value => { setEvaluationId(value.id); await client.invalidateQueries({ queryKey: [...key, 'results'] }); } });
  return <>
    <section className="evaluation-card">
      <div className="evaluation-heading-row">
        <div><h2>Quality Gate de SonarQube</h2>
          {latestAnalysis && <p className="evaluation-subtitle">Último análisis · <code>{latestAnalysis.commitSha.slice(0, 8)}</code> · {new Date(latestAnalysis.analyzedAt).toLocaleString('es-PE')}</p>}
        </div>
        {sonarStatus === 'OK' && <span className="evaluation-badge evaluation-badge-applied">Aprobado</span>}
        {sonarStatus === 'ERROR' && <span className="evaluation-badge evaluation-badge-failed">Fallido</span>}
        {sonarStatus === 'WARN' && <span className="evaluation-badge evaluation-badge-pending">Con advertencias</span>}
        {sonarStatus === 'NONE' && <span className="evaluation-badge">Sin veredicto</span>}
      </div>
      {analyses.isPending && <p role="status">Consultando SonarQube…</p>}
      {analyses.isError && <EvaluationError retry={() => void analyses.refetch()} />}
      {analyses.isSuccess && !latestAnalysis && <EvaluationEmpty>Todavía no se ha recibido un análisis de esta rama.</EvaluationEmpty>}
    </section>
    <section className="evaluation-card"><div className="evaluation-heading-row"><div><h2>Condiciones de evaluación de la rúbrica</h2><p className="evaluation-subtitle">Configuración aprobada para este repositorio y rama.</p></div>{gate.data && <span className={`evaluation-badge evaluation-badge-${gate.data.synchronization_state.toLowerCase()}`}>{evaluationStatus(gate.data.synchronization_state)}</span>}</div>
      {configurations.isError && <EvaluationError retry={() => void configurations.refetch()} />}
      {configurations.isSuccess && !configuration && <EvaluationEmpty>{teacher ? 'Publica una rúbrica y confirma sus condiciones para configurar el Quality Gate.' : 'Tu docente todavía no ha configurado la evaluación de este repositorio.'}</EvaluationEmpty>}
      {configuration && <><p><strong>{configuration.rubric.title}</strong> · versión {configuration.rubric.version}</p><ul className="evaluation-condition-list">{configuration.checks.map(c => <li key={c.id}>{configuration.rubric.criteria.find(r => r.id === c.criterionId)?.description ?? 'Criterio'}: {c.type === 'MANUAL' ? 'Revisión del docente' : `${metricLabel(c.key)} ${c.operator === 'GTE' ? '≥' : c.operator === 'LTE' ? '≤' : c.operator ?? ''} ${c.threshold ?? ''}`}</li>)}</ul>
        {gate.isPending && <p role="status">Consultando sincronización…</p>}
        {(gate.isError || retryGate.isError) && <EvaluationError retry={() => void gate.refetch()} />}
        {gate.data && ['PENDING', 'DELIVERED'].includes(gate.data.synchronization_state) && <p className="evaluation-subtitle" role="status">Las condiciones se están enviando a SonarQube. Espera a que aparezca «Configurado» antes del siguiente push.</p>}
        {teacher && gate.data?.synchronization_state === 'FAILED' && <Button variant="outline" disabled={retryGate.isPending} onClick={() => retryGate.mutate()}>Reintentar sincronización</Button>}
      </>}
    </section>
    {teacher && <section className="evaluation-card"><h2>Evaluar una revisión</h2><p className="evaluation-subtitle">Selecciona un análisis recibido. Evaluar una revisión anterior utiliza explícitamente los criterios de la rúbrica seleccionada.</p>
      <label>Revisión del código<select value={event?.eventId ?? ''} onChange={e => setEventId(e.target.value)}><option value="">Selecciona una revisión</option>{revisions.map(r => <option key={r.eventId} value={r.eventId}>{r.commitSha.slice(0, 8)} · {new Date(r.analyzedAt).toLocaleString('es-PE')}</option>)}</select></label>
      {analyses.isError && <EvaluationError retry={() => void analyses.refetch()} />}
      {analyses.hasNextPage && <Button variant="ghost" onClick={() => void analyses.fetchNextPage()}>Cargar más revisiones</Button>}
      <Button disabled={!configuration || !event || gate.data?.synchronization_state !== 'APPLIED' || evaluate.isPending} onClick={() => evaluate.mutate()}>{evaluate.isPending ? 'Evaluando…' : 'Evaluar esta revisión'}</Button>
      {evaluate.isError && <EvaluationError />}
    </section>}
    <section className="evaluation-card"><div className="evaluation-heading-row"><h2>Historial de evaluación</h2><Button variant="outline" onClick={() => { void results.refetch(); void analyses.refetch(); void configurations.refetch(); if (configuration) void gate.refetch(); }}>Actualizar resultados</Button></div>
      {results.isError && <EvaluationError retry={() => void results.refetch()} />}
      {results.isPending && <p role="status">Consultando evaluaciones…</p>}
      {results.isSuccess && evaluations.length === 0 && <EvaluationEmpty>Todavía no hay evaluaciones para este repositorio y rama.</EvaluationEmpty>}
      {evaluations.length > 0 && <label>Evaluación<select value={result?.id ?? ''} onChange={e => setEvaluationId(e.target.value)}>{evaluations.map(r => <option key={r.id} value={r.id}>{r.commitSha.slice(0, 8)} · {evaluationStatus(r.status)}</option>)}</select></label>}
      {results.hasNextPage && <Button variant="ghost" onClick={() => void results.fetchNextPage()}>Cargar más evaluaciones</Button>}
    </section>
    {result && <EvaluationResultDetail key={result.id} projectId={projectId} evaluation={result} teacher={teacher} />}
  </>;
}
export function metricLabel(key: string) {
  return ({ coverage: 'Cobertura (%)', duplicated_lines_density: 'Duplicación (%)', ncloc: 'Líneas de código', bugs: 'Problemas de fiabilidad', vulnerabilities: 'Vulnerabilidades', code_smells: 'Mantenibilidad', sqale_index: 'Deuda técnica (minutos)', sqale_debt_ratio: 'Ratio de deuda (%)' } as Record<string, string>)[key] ?? key;
}
