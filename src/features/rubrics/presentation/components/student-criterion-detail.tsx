import { useState } from 'react';
import { Dialog } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import type {
  RubricCriterion,
  StudentCriterionResult,
} from '../../domain/rubric';
import { sourceLabels } from '../rubric-labels';
import { EvidenceTrace } from './evidence-trace';
export function StudentCriterionDetail({
  criterion,
  result,
}: {
  criterion: RubricCriterion;
  result?: StudentCriterionResult;
}) {
  const [evidence, setEvidence] = useState(false);
  return (
    <article className="rubric-student-detail">
      <h2>{criterion.name}</h2>
      <p>{criterion.description}</p>
      <p className="rubric-notice">
        Fuente: {sourceLabels[criterion.evidenceSource].name}.{' '}
        {sourceLabels[criterion.evidenceSource].explanation}
      </p>
      {result ? (
        <>
          <strong className="rubric-result-score">
            {result.score} de {result.maxScore} puntos
          </strong>
          <progress
            max={100}
            value={result.percentage}
            aria-label="Progreso del criterio seleccionado"
          />
          <p className="rubric-hint">
            {result.percentage}% del puntaje máximo. No es necesariamente el
            porcentaje de la métrica técnica.
          </p>
          <EvidenceTrace result={result} />
          <h3>Qué puedes mejorar</h3>
          <p>
            {result.recommendation ||
              'Consulta a tu docente para recibir orientación.'}
          </p>
          <Button variant="outline" onClick={() => setEvidence(true)}>
            Ver evidencia completa
          </Button>
          <Dialog
            open={evidence}
            onOpenChange={setEvidence}
            title={`Evidencia de ${criterion.name}`}
            description={result.evidence}
          >
            <pre className="rubric-evidence-document">
              {result.evidenceDetails}
            </pre>
            <p className="rubric-notice">
              Evidencia de demostración. No se realizó una consulta a SonarQube,
              GitHub o al pipeline real.
            </p>
          </Dialog>
        </>
      ) : (
        <p className="rubric-empty-inline">
          Aún no hay un resultado para este criterio.
        </p>
      )}
    </article>
  );
}
