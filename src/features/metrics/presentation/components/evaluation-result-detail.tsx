import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/shared/services/auth/auth-context';
import type { TechnicalEvaluation } from '../../domain/evaluation';
import { useEvaluationApi } from '../hooks/use-evaluation';
import { EvaluationEmpty, EvaluationError, evaluationStatus } from './evaluation-feedback';

const metricNames: Record<string, string> = { coverage: 'Cobertura (%)', duplicated_lines_density: 'Duplicación (%)', ncloc: 'Líneas de código', bugs: 'Problemas de fiabilidad', vulnerabilities: 'Vulnerabilidades', code_smells: 'Problemas de mantenibilidad', sqale_index: 'Deuda técnica (minutos)', sqale_debt_ratio: 'Ratio de deuda (%)' };

export function EvaluationResultDetail({ projectId, evaluation, teacher }: { projectId: string; evaluation: TechnicalEvaluation; teacher: boolean }) {
  const api = useEvaluationApi(); const { user } = useAuth(); const client = useQueryClient();
  const key = ['live-evaluation', user?.id, projectId] as const;
  const configuration = useQuery({ queryKey: [...key, 'configuration', evaluation.configurationId], queryFn: ({ signal }) => api.configuration(projectId, evaluation.configurationId, signal) });
  const evidence = useQuery({ queryKey: [...key, 'evidence', evaluation.id, evaluation.evidenceState], queryFn: ({ signal }) => api.evidence(projectId, evaluation.id, signal) });
  const estimateKey = [...key, 'estimate', evaluation.id, evaluation.evidenceState, evaluation.decisions.length];
  const estimate = useQuery({
    queryKey: estimateKey,
    queryFn: ({ signal }) => api.estimate(projectId, evaluation.id, signal),
    refetchInterval: (query) => query.state.data === null ? 10_000 : false,
  });
  const generate = useMutation({ mutationFn: () => api.generateEstimate(projectId, evaluation.id), onSuccess: value => client.setQueryData(estimateKey, value) });
  const refresh = () => client.invalidateQueries({ queryKey: key });
  const compliance = evaluation.technicalCompliance;
  return <div className="evaluation-detail">
    <section className="evaluation-card"><div className="evaluation-heading-row"><h2>Cumplimiento técnico</h2><span className="evaluation-badge">{evaluationStatus(evaluation.status)}</span></div>
      <p className="evaluation-subtitle">Revisión <code>{evaluation.commitSha.slice(0, 12)}</code>. Estos porcentajes describen cumplimiento, no una nota.</p>
      <div className="evaluation-stat-grid"><div><span>Cumplimiento completo</span><strong>{compliance.completeCompliancePercent === null ? 'Pendiente' : `${compliance.completeCompliancePercent}%`}</strong></div><div><span>Puntos de rúbrica con evidencia</span><strong>{compliance.evaluatedMaxPoints === 0 ? 'Sin puntos evaluables' : `${compliance.evaluatedMaxPoints} de 20`}</strong></div><div><span>Estado de la evidencia</span><strong>{evaluationStatus(evaluation.evidenceState)}</strong></div></div>
      {configuration.isError && <EvaluationError retry={() => void configuration.refetch()} />}
      {compliance.criteria.map(criterion => {
        const definition = configuration.data?.rubric.criteria.find(c => c.id === criterion.criterionId);
        return <article key={criterion.criterionId} className="evaluation-criterion-result"><div className="evaluation-heading-row"><h3>{definition?.description ?? 'Criterio de la rúbrica'}</h3><span>{criterion.maxPoints} puntos máximos · {evaluationStatus(criterion.status)}</span></div>
          {definition && <p>{definition.objective}</p>}
          {criterion.checks.map(check => <div key={check.id} className="evaluation-check-result"><span>{evaluationStatus(check.status)}</span>
            {teacher && configuration.data?.checks.some(c => c.id === check.id && c.type === 'MANUAL') && !evaluation.decisions.some(d => d.checkId === check.id) && <ManualReview projectId={projectId} evaluationId={evaluation.id} checkId={check.id} onSaved={() => void refresh()} />}
          </div>)}
        </article>;
      })}
    </section>
    <section className="evaluation-card"><h2>Evidencia del análisis</h2>
      {evidence.isError && <EvaluationError retry={() => void evidence.refetch()} />}
      {evidence.isPending && <p role="status">Consultando evidencia…</p>}
      {evidence.data && <><p className="evaluation-subtitle">Quality Gate reportado por este análisis: <strong>{evidence.data.reference.qualityGateStatus}</strong>. Corresponde a la configuración existente cuando se analizó esa revisión.</p>
        {Object.keys(evidence.data.evidence.measures).length ? <dl className="evaluation-measures">{Object.entries(evidence.data.evidence.measures).map(([name, value]) => <div key={name}><dt>{metricNames[name] ?? name}</dt><dd>{value}</dd></div>)}</dl> : <EvaluationEmpty>Todavía no hay valores verificables para esta revisión. Los datos ausentes no se interpretan como cero.</EvaluationEmpty>}</>}
    </section>
    <section className="evaluation-card"><div className="evaluation-heading-row"><h2>Estimación según la rúbrica</h2>{teacher && estimate.isSuccess && !estimate.data && <Button disabled={generate.isPending} onClick={() => generate.mutate()}>{generate.isPending ? 'Generando estimación…' : 'Generar ahora'}</Button>}</div>
      <p className="evaluation-estimate-notice">Orientativa · No es una calificación oficial. El docente conserva la decisión académica.</p>
      {(estimate.isError || generate.isError) && <EvaluationError retry={() => void estimate.refetch()} />}
      {generate.isPending && <p role="status">La IA está revisando la evidencia. Esto puede tardar unos momentos.</p>}
      {estimate.isPending && <p role="status">Consultando estimación…</p>}
      {estimate.isSuccess && !estimate.data && <EvaluationEmpty>La estimación se genera automáticamente a partir de la rúbrica y la evidencia de esta revisión.</EvaluationEmpty>}
      {estimate.data && <><p className="evaluation-estimated-score">{estimate.data.estimatedScore === null ? 'Estimación parcial' : `${estimate.data.estimatedScore} / 20`}</p><p>{estimate.data.summary}</p>
        {estimate.data.estimatedScore === null && <p>Subtotal estimado: {estimate.data.estimatedSubtotal} de {estimate.data.coveredMaxPoints} puntos con evidencia. El total sobre 20 permanece pendiente.</p>}
        {estimate.data.criteria.map(c => <article key={c.criterionId} className="evaluation-criterion-result"><h3>{configuration.data?.rubric.criteria.find(r => r.id === c.criterionId)?.description ?? 'Criterio'}</h3><p><strong>{c.estimatedPoints === null ? 'Evidencia pendiente' : `${c.estimatedPoints} puntos estimados`}</strong></p><p>{c.justification}</p></article>)}</>}
    </section>
  </div>;
}

function ManualReview({ projectId, evaluationId, checkId, onSaved }: { projectId: string; evaluationId: string; checkId: string; onSaved: () => void }) {
  const api = useEvaluationApi(); const [decision, setDecision] = useState(''); const [reason, setReason] = useState('');
  const review = useMutation({ mutationFn: () => api.review(projectId, evaluationId, { checkId, passed: decision === 'pass', justification: reason.trim() }), onSuccess: onSaved });
  function submit(event: FormEvent) { event.preventDefault(); if (decision && reason.trim()) review.mutate(); }
  return <form onSubmit={submit} className="evaluation-form evaluation-manual"><label>Resultado de la revisión<select value={decision} onChange={e => setDecision(e.target.value)} disabled={review.isPending} required><option value="">Selecciona un resultado</option><option value="pass">Cumple</option><option value="fail">No cumple</option></select></label><label>Justificación del docente<textarea value={reason} onChange={e => setReason(e.target.value)} disabled={review.isPending} maxLength={2000} required /></label>
    <Button type="submit" disabled={!decision || !reason.trim() || review.isPending}>Guardar revisión docente</Button>{review.isError && <EvaluationError />}</form>;
}
