import type { StudentOverview } from '../../domain/entities/student-overview.entity';
import { Button } from '@/shared/components/ui/button';
import { formatStudentValue } from '../utils/student-overview-format';

export function StudentLatestEvaluation({
  overview,
}: {
  overview?: StudentOverview;
}) {
  const evaluation = overview?.latestEvaluation;
  const metrics = evaluation?.metrics ?? [
    {
      id: 'coverage',
      label: 'Cobertura',
      formattedValue: null,
      assessmentLabel: null,
    },
    {
      id: 'technical-debt',
      label: 'Deuda técnica',
      formattedValue: null,
      assessmentLabel: null,
    },
    {
      id: 'vulnerabilities',
      label: 'Vulnerabilidades',
      formattedValue: null,
      assessmentLabel: null,
    },
  ];
  return (
    <section
      className="student-panel student-evaluation"
      aria-labelledby="student-evaluation-heading"
    >
      <header className="student-panel-heading">
        <div>
          <h2 id="student-evaluation-heading">Última evaluación</h2>
          <p>
            {evaluation
              ? [evaluation.projectName, evaluation.pipelineLabel]
                  .filter(Boolean)
                  .join(' · ')
              : 'Sin evaluación disponible'}
          </p>
        </div>
        <span className="student-neutral-badge">
          {evaluation?.reviewLabel ?? 'Pendiente'}
        </span>
      </header>
      <div className="student-evaluation-score">
        <p>
          <strong
            aria-label={
              evaluation?.grade ? undefined : 'Calificación pendiente'
            }
          >
            {formatStudentValue(evaluation?.grade?.value)}
          </strong>
          {evaluation?.grade && (
            <span> / {formatStudentValue(evaluation.grade.maximum)}</span>
          )}
        </p>
        <p>
          {evaluation?.grade
            ? 'Calificación de la evaluación'
            : 'Tu calificación aparecerá después de una evaluación.'}
        </p>
      </div>
      <dl className="student-metrics">
        {metrics.map((metric) => (
          <div key={metric.id}>
            <dt>{metric.label}</dt>
            <dd>
              <strong
                aria-label={
                  metric.formattedValue == null
                    ? 'Información pendiente'
                    : undefined
                }
              >
                {metric.formattedValue ?? '—'}
              </strong>
              <span>{metric.assessmentLabel ?? 'Sin evaluar'}</span>
            </dd>
          </div>
        ))}
      </dl>
      <Button
        variant="outline"
        disabled
        aria-describedby="student-result-help"
        className="w-full"
      >
        Entender mi resultado
      </Button>
      <p className="student-action-help" id="student-result-help">
        Disponible cuando puedas consultar el detalle de tu evaluación.
      </p>
    </section>
  );
}
