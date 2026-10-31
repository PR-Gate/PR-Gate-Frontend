import type { StudentCriterionResult } from '../../domain/rubric';
export function EvidenceTrace({ result }: { result: StudentCriterionResult }) {
  return (
    <ol className="rubric-evidence-trace" aria-label="Trazabilidad del puntaje">
      {[
        ['Métrica técnica', result.technicalResult],
        ['Regla de la rúbrica', result.appliedRule],
        ['Nivel de logro', result.achievementLevel],
        [
          'Puntaje académico preliminar',
          `${result.score} de ${result.maxScore} puntos`,
        ],
      ].map(([label, value], index) => (
        <li key={label}>
          <span>{index + 1}</span>
          <div>
            <strong>{label}</strong>
            <p>{value}</p>
          </div>
          {index < 3 && <i aria-hidden="true">↓</i>}
        </li>
      ))}
    </ol>
  );
}
