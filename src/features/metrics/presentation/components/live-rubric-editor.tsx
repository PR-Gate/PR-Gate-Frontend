import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import type {
  PublishedRubric,
  EvaluationCheck,
} from '../../domain/evaluation';
import { useEvaluationApi } from '../hooks/use-evaluation';
import { EvaluationError } from './evaluation-feedback';
import { useRubricProposal } from './rubric-technical-proposal';

const metrics = [
  ['coverage', 'Cobertura de pruebas (%)'],
  ['duplicated_lines_density', 'Duplicación (%)'],
  ['vulnerabilities', 'Vulnerabilidades'],
  ['bugs', 'Problemas de fiabilidad'],
  ['code_smells', 'Problemas de mantenibilidad'],
  ['ncloc', 'Líneas de código'],
  ['sqale_index', 'Deuda técnica (minutos)'],
  ['sqale_debt_ratio', 'Ratio de deuda técnica (%)'],
] as const;
interface DraftCriterion {
  id: string;
  description: string;
  objective: string;
  points: string;
  type: 'METRIC' | 'MANUAL';
  metric: string;
  operator: 'GTE' | 'LTE';
  threshold: string;
}
const blankCriterion = (): DraftCriterion => ({
  id: crypto.randomUUID(),
  description: '',
  objective: '',
  points: '',
  type: 'METRIC',
  metric: 'coverage',
  operator: 'GTE',
  threshold: '',
});

export function LiveRubricEditor({
  courseId,
  rubric,
  checks,
  onSaved,
}: {
  courseId: string;
  rubric: PublishedRubric;
  checks?: EvaluationCheck[];
  onSaved: () => void;
}) {
  const api = useEvaluationApi();
  const { proposal } = useRubricProposal(rubric);
  const [criteria, setCriteria] = useState<DraftCriterion[]>(() =>
    rubric.criteria.map((criterion) => {
      const check = checks?.find((item) => item.criterionId === criterion.id && item.type === 'METRIC');
      return {
        ...blankCriterion(),
        ...criterion,
        points: String(criterion.maxPoints),
        type: check ? 'METRIC' : 'MANUAL',
        metric: check?.key ?? '',
        operator: check?.operator === 'GTE' ? 'GTE' : 'LTE',
        threshold: check?.threshold?.toString() ?? '',
      };
    }),
  );
  const [validation, setValidation] = useState('');
  function applyProposal() {
    if (!proposal) return;
    setCriteria((current) =>
      current.map((criterion) => {
        const metric = proposal.checks.find(
          (check) =>
            check.criterionId === criterion.id &&
            check.mechanism === 'SONAR_METRIC' &&
            metrics.some(([key]) => key === check.target),
        );
        if (!metric) return { ...criterion, type: 'MANUAL' };
        const operator = metric.parameters.operator?.toUpperCase();
        const threshold = metric.parameters.threshold?.trim();
        const supported = operator === 'GTE' || operator === 'LTE';
        return {
          ...criterion,
          type: 'METRIC',
          metric: metric.target,
          operator: supported
            ? operator
            : metric.target === 'coverage'
              ? 'GTE'
              : 'LTE',
          threshold:
            supported && threshold && Number.isFinite(Number(threshold))
              ? threshold
              : '',
        };
      }),
    );
  }
  const total =
    criteria.reduce(
      (sum, c) => sum + Math.round((Number(c.points) || 0) * 100),
      0,
    ) / 100;
  const update = (id: string, value: Partial<DraftCriterion>) =>
    setCriteria((current) =>
      current.map((c) => (c.id === id ? { ...c, ...value } : c)),
    );
  const save = useMutation({
    mutationFn: () =>
      api.approveCourseGate(courseId, {
        rubricId: rubric.id,
        rubricVersion: rubric.version,
        checks: criteria.map((c) => ({
          criterionId: c.id,
          type: c.type,
          key: c.type === 'MANUAL' ? c.objective.trim() : c.metric,
          operator: c.type === 'MANUAL' ? null : c.operator,
          threshold: c.type === 'MANUAL' ? null : Number(c.threshold),
        })),
      }),
    onSuccess: onSaved,
  });
  function submit(event: FormEvent) {
    event.preventDefault();
    setValidation('');
    if (
      total !== 20 ||
      criteria.some(
        (c) =>
          !c.description.trim() ||
          !c.objective.trim() ||
          Number(c.points) <= 0 ||
          !/^\d+(\.\d{1,2})?$/.test(c.points),
      )
    ) {
      setValidation(
        'Completa los criterios y distribuye exactamente 20 puntos, con un máximo de dos decimales.',
      );
      return;
    }
    if (
      criteria.some(
        (c) =>
          c.type === 'METRIC' &&
          (c.threshold.trim() === '' ||
            !Number.isFinite(Number(c.threshold)) ||
            Number(c.threshold) < 0 ||
            (['coverage', 'duplicated_lines_density'].includes(c.metric) &&
              Number(c.threshold) > 100)),
      )
    ) {
      setValidation(
        'Completa cada umbral. Los porcentajes deben estar entre 0 y 100.',
      );
      return;
    }
    const conditions = new Map<string, DraftCriterion>();
    for (const criterion of criteria) {
      if (criterion.type === 'MANUAL') {
        if (criterion.objective.trim().length > 1000) {
          setValidation(`Acorta a 1000 caracteres las instrucciones de revisión de «${criterion.description}». Si la rúbrica ya está publicada, edítalas en una nueva versión.`);
          return;
        }
        continue;
      }
      const previous = conditions.get(criterion.metric);
      if (previous && (previous.operator !== criterion.operator || Number(previous.threshold) !== Number(criterion.threshold))) {
        const name = metrics.find(([key]) => key === criterion.metric)?.[1] ?? criterion.metric;
        setValidation(`«${previous.description}» y «${criterion.description}» usan ${name} con condiciones distintas. Usa el mismo operador y umbral o elige otra forma de evaluación.`);
        return;
      }
      conditions.set(criterion.metric, criterion);
    }
    if (conditions.size === 0) {
      setValidation('Configura al menos una métrica para publicar el Quality Gate.');
      return;
    }
    save.mutate();
  }
  return (
    <form className="evaluation-form" onSubmit={submit}>
      {proposal && (
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={applyProposal}
            disabled={save.isPending}
          >
            Cargar métricas sugeridas
          </Button>
          <p className="evaluation-subtitle">
            Se carga una métrica compatible por criterio. Revisa los umbrales.
            Los demás criterios quedan para revisión docente.
          </p>
        </div>
      )}
      <p className="evaluation-subtitle">{rubric.title} · Versión {rubric.version}</p>
      {criteria.map((criterion, index) => (
        <fieldset
          key={criterion.id}
          disabled={save.isPending}
          className="evaluation-criterion-editor"
        >
          <legend>Criterio {index + 1}</legend>
          <div className="evaluation-form-grid">
            <label>
              Criterio
              <input
                value={criterion.description}
                onChange={(e) =>
                  update(criterion.id, { description: e.target.value })
                }
                readOnly
                maxLength={1000}
                required
              />
            </label>
            <label>
              Puntos máximos
              <input
                type="number"
                min="0.01"
                max="20"
                step="0.01"
                value={criterion.points}
                onChange={(e) =>
                  update(criterion.id, { points: e.target.value })
                }
                readOnly
                required
              />
            </label>
          </div>
          <label>
            Qué se verificará
            <textarea
              value={criterion.objective}
              onChange={(e) =>
                update(criterion.id, { objective: e.target.value })
              }
              readOnly
              maxLength={1000}
              required
            />
          </label>
          <label>
            Forma de evaluación
            <select
              value={criterion.type}
              onChange={(e) =>
                update(criterion.id, {
                  type: e.target.value as DraftCriterion['type'],
                })
              }
            >
              <option value="METRIC">Métrica del código</option>
              <option value="MANUAL">Revisión del docente</option>
            </select>
          </label>
          {criterion.type === 'METRIC' && (
            <div className="evaluation-form-grid evaluation-conditions">
              <label>
                Métrica
                <select
                  value={criterion.metric}
                  onChange={(e) =>
                    update(criterion.id, {
                      metric: e.target.value,
                      operator: e.target.value === 'coverage' ? 'GTE' : 'LTE',
                      threshold: '',
                    })
                  }
                >
                  {metrics.map(([key, name]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Condición
                <select
                  value={criterion.operator}
                  onChange={(e) =>
                    update(criterion.id, {
                      operator: e.target.value as 'GTE' | 'LTE',
                    })
                  }
                >
                  <option value="GTE">Al menos (≥)</option>
                  <option value="LTE">Como máximo (≤)</option>
                </select>
              </label>
              <label>
                Umbral
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={criterion.threshold}
                  onChange={(e) =>
                    update(criterion.id, { threshold: e.target.value })
                  }
                  required
                />
              </label>
            </div>
          )}
        </fieldset>
      ))}
      <p className="evaluation-total">
        Total de la rúbrica: <strong>{total} / 20 puntos</strong>
      </p>
      <p className="evaluation-subtitle">
        Todos los proyectos del curso usan estas condiciones. Cada repositorio conserva su historial.
      </p>
      {validation && (
        <p role="alert" className="evaluation-validation">
          {validation}
        </p>
      )}
      {save.isError && <EvaluationError />}
      <Button type="submit" disabled={save.isPending}>
        {save.isPending ? 'Publicando…' : 'Publicar Quality Gate del curso'}
      </Button>
    </form>
  );
}
