import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import type {
  ApprovedEvaluation,
  EvaluationRepository,
  PublishedRubric,
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
  projectId,
  repository,
  rubric,
  configureOnly = false,
  onSaved,
}: {
  projectId: string;
  repository: EvaluationRepository;
  rubric?: PublishedRubric;
  configureOnly?: boolean;
  onSaved: (value: ApprovedEvaluation) => void;
}) {
  const api = useEvaluationApi();
  const { proposal } = useRubricProposal(rubric);
  const [title, setTitle] = useState(rubric?.title ?? '');
  const [criteria, setCriteria] = useState<DraftCriterion[]>(() =>
    rubric
      ? rubric.criteria.map((c) => ({
          ...blankCriterion(),
          ...c,
          type: 'MANUAL',
          points: String(c.maxPoints),
        }))
      : [blankCriterion()],
  );
  const [published, setPublished] = useState<PublishedRubric | undefined>(
    configureOnly ? rubric : undefined,
  );
  const [validation, setValidation] = useState('');
  const frozen = Boolean(published);
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
    mutationFn: async () => {
      let version = published;
      if (!version) {
        version = await api.publish(
          projectId,
          {
            title: title.trim(),
            criteria: criteria.map((c) => ({
              id: c.id,
              description: c.description.trim(),
              objective: c.objective.trim(),
              maxPoints: Number(c.points),
            })),
          },
          rubric?.id,
        );
        setPublished(version);
      }
      return api.approve(projectId, {
        rubricId: version.id,
        rubricVersion: version.version,
        repositoryId: repository.id,
        gitRef: repository.gitRef,
        checks: criteria.map((c) => ({
          criterionId: c.id,
          type: c.type,
          key: c.type === 'MANUAL' ? c.objective.trim() : c.metric,
          operator: c.type === 'MANUAL' ? null : c.operator,
          threshold: c.type === 'MANUAL' ? null : Number(c.threshold),
        })),
      });
    },
    onSuccess: onSaved,
  });
  function submit(event: FormEvent) {
    event.preventDefault();
    setValidation('');
    if (
      !title.trim() ||
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
    save.mutate();
  }
  return (
    <form className="evaluation-form" onSubmit={submit}>
      {proposal && configureOnly && (
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
      <label>
        Nombre de la rúbrica
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={frozen || save.isPending}
          maxLength={200}
          required
        />
      </label>
      <p className="evaluation-subtitle">
        Condiciones para {repository.fullName}, rama{' '}
        {repository.gitRef.replace('refs/heads/', '')}.
      </p>
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
                disabled={frozen}
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
                disabled={frozen}
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
              disabled={frozen}
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
          {!frozen && criteria.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setCriteria((current) =>
                  current.filter((c) => c.id !== criterion.id),
                )
              }
            >
              Quitar criterio {index + 1}
            </Button>
          )}
        </fieldset>
      ))}
      {!frozen && (
        <Button
          type="button"
          variant="outline"
          disabled={save.isPending || criteria.length >= 100}
          onClick={() =>
            setCriteria((current) => [...current, blankCriterion()])
          }
        >
          Añadir criterio
        </Button>
      )}
      <p className="evaluation-total">
        Total de la rúbrica: <strong>{total} / 20 puntos</strong>
      </p>
      <p className="evaluation-subtitle">
        Las condiciones se enviarán a SonarQube. La rúbrica publicada se
        conserva como una versión y la IA podrá generar una estimación, no una
        calificación oficial.
      </p>
      {validation && (
        <p role="alert" className="evaluation-validation">
          {validation}
        </p>
      )}
      {save.isError && (
        <>
          <EvaluationError />
          {published && (
            <p>
              La rúbrica quedó guardada. Puedes reintentar la configuración sin
              volver a publicarla.
            </p>
          )}
        </>
      )}
      <Button type="submit" disabled={save.isPending}>
        {save.isPending
          ? 'Guardando…'
          : published
            ? 'Confirmar condiciones'
            : 'Publicar y configurar Quality Gate'}
      </Button>
    </form>
  );
}
