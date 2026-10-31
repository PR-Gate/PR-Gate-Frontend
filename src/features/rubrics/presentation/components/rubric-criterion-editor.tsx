import { useState } from 'react';
import { Dialog } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import type { AchievementLevel, RubricCriterion } from '../../domain/rubric';
import { evaluationNotice, numericValue } from '../rubric-labels';
import { AchievementLevelEditor } from './achievement-level-editor';
import { EvidenceSourceSelect, EvaluationTypeSelect } from './evidence-selects';
export function RubricCriterionEditor({
  criterion,
  onSave,
  onClose,
}: {
  criterion?: RubricCriterion;
  onSave(criterion: RubricCriterion): void;
  onClose(): void;
}) {
  const [value, setValue] = useState<RubricCriterion>(() =>
    criterion
      ? structuredClone(criterion)
      : {
          id: crypto.randomUUID(),
          name: '',
          description: '',
          maxScore: 0,
          evidenceSource: 'teacher-review',
          evaluationType: 'teacher-review',
          levels: [],
        },
  );
  const [level, setLevel] = useState<AchievementLevel | null | undefined>();
  const [remove, setRemove] = useState<string | null>(null);
  const move = (index: number, direction: number) =>
    setValue((current) => {
      const levels = [...current.levels];
      const other = index + direction;
      if (!levels[other]) return current;
      [levels[index], levels[other]] = [levels[other]!, levels[index]!];
      return { ...current, levels };
    });
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={criterion ? 'Editar criterio' : 'Agregar criterio'}
      description="Define qué se evalúa, su evidencia y los niveles de logro."
      contentClassName="rubric-criterion-dialog"
    >
      <form
        className="rubric-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(value);
        }}
        noValidate
      >
        <label>
          Nombre del criterio
          <input
            maxLength={200}
            value={value.name}
            onChange={(event) =>
              setValue({ ...value, name: event.target.value })
            }
          />
        </label>
        {!value.name.trim() && (
          <p className="rubric-hint">
            Puedes completarlo después en el borrador; será obligatorio para
            publicar.
          </p>
        )}
        <label>
          Descripción del criterio
          <textarea
            maxLength={3000}
            value={value.description}
            onChange={(event) =>
              setValue({ ...value, description: event.target.value })
            }
          />
        </label>
        <label>
          Puntaje máximo
          <input
            type="number"
            min="0"
            max="1000"
            step="0.1"
            value={value.maxScore}
            onChange={(event) =>
              setValue({ ...value, maxScore: numericValue(event.target.value) })
            }
          />
        </label>
        {value.maxScore === 0 && (
          <p className="rubric-hint">
            Define un puntaje mayor que cero antes de publicar.
          </p>
        )}
        <EvidenceSourceSelect
          value={value.evidenceSource}
          onChange={(evidenceSource) => setValue({ ...value, evidenceSource })}
        />
        <EvaluationTypeSelect
          value={value.evaluationType}
          onChange={(evaluationType) => setValue({ ...value, evaluationType })}
        />
        <p className="rubric-notice">{evaluationNotice}</p>
        <div className="rubric-row">
          <h3>Niveles de logro</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={value.levels.length >= 20}
            onClick={() => setLevel(null)}
          >
            Agregar nivel
          </Button>
        </div>
        {!value.levels.length && (
          <p className="rubric-hint">
            Los criterios automáticos necesitan niveles antes de publicar.
          </p>
        )}
        <ol className="rubric-levels">
          {value.levels.map((item, index) => (
            <li key={item.id}>
              <strong>
                {index + 1}. {item.name || 'Nivel sin nombre'} · {item.score}{' '}
                puntos
              </strong>
              <p>{item.condition || 'Condición pendiente'}</p>
              <p>{item.description}</p>
              <div className="rubric-mini-actions">
                <button
                  type="button"
                  aria-label={`Subir nivel ${index + 1}`}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label={`Bajar nivel ${index + 1}`}
                  disabled={index === value.levels.length - 1}
                  onClick={() => move(index, 1)}
                >
                  ↓
                </button>
                <button type="button" onClick={() => setLevel(item)}>
                  Editar nivel
                </button>
                <button type="button" onClick={() => setRemove(item.id)}>
                  Eliminar nivel
                </button>
              </div>
            </li>
          ))}
        </ol>
        <div className="rubric-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Guardar criterio</Button>
        </div>
      </form>
      {level !== undefined && (
        <AchievementLevelEditor
          level={level ?? undefined}
          maxScore={value.maxScore}
          onClose={() => setLevel(undefined)}
          onSave={(updated) => {
            setValue((current) => ({
              ...current,
              levels: current.levels.some((item) => item.id === updated.id)
                ? current.levels.map((item) =>
                    item.id === updated.id ? updated : item,
                  )
                : [...current.levels, updated],
            }));
            setLevel(undefined);
          }}
        />
      )}
      <Dialog
        open={Boolean(remove)}
        onOpenChange={(open) => {
          if (!open) setRemove(null);
        }}
        title="Eliminar nivel"
        description="Esta acción elimina el nivel del borrador que estás editando."
      >
        <div className="rubric-actions">
          <Button variant="outline" onClick={() => setRemove(null)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              setValue((current) => ({
                ...current,
                levels: current.levels.filter((item) => item.id !== remove),
              }));
              setRemove(null);
            }}
          >
            Confirmar eliminación
          </Button>
        </div>
      </Dialog>
    </Dialog>
  );
}
