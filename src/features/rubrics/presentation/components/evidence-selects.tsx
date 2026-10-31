import type { EvidenceSource, EvaluationType } from '../../domain/rubric';
import { evaluationLabels, sourceLabels } from '../rubric-labels';
export function EvidenceSourceSelect({
  value,
  onChange,
}: {
  value: EvidenceSource;
  onChange(value: EvidenceSource): void;
}) {
  return (
    <div>
      <label>
        Fuente de evidencia
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as EvidenceSource)}
        >
          {Object.entries(sourceLabels).map(([key, item]) => (
            <option key={key} value={key}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <p className="rubric-hint">
        {sourceLabels[value].name}: {sourceLabels[value].explanation}
      </p>
    </div>
  );
}
export function EvaluationTypeSelect({
  value,
  onChange,
}: {
  value: EvaluationType;
  onChange(value: EvaluationType): void;
}) {
  return (
    <label>
      Tipo de evaluación
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as EvaluationType)}
      >
        {Object.entries(evaluationLabels).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
