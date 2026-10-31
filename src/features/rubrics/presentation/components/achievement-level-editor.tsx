import { useState } from 'react';
import { Dialog } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import type { AchievementLevel } from '../../domain/rubric';
import { numericValue } from '../rubric-labels';
export function AchievementLevelEditor({
  level,
  maxScore,
  onSave,
  onClose,
}: {
  level?: AchievementLevel;
  maxScore: number;
  onSave(level: AchievementLevel): void;
  onClose(): void;
}) {
  const [value, setValue] = useState<AchievementLevel>(() =>
    level
      ? structuredClone(level)
      : {
          id: crypto.randomUUID(),
          name: '',
          description: '',
          condition: '',
          score: 0,
        },
  );
  const invalid = value.score > maxScore;
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={level ? 'Editar nivel de logro' : 'Agregar nivel de logro'}
      description="Describe el nivel, su condición y cuántos puntos representa."
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
          Nombre del nivel
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
            Completa el nombre antes de publicar la rúbrica.
          </p>
        )}
        <label>
          Descripción del nivel
          <textarea
            maxLength={3000}
            value={value.description}
            onChange={(event) =>
              setValue({ ...value, description: event.target.value })
            }
          />
        </label>
        <label>
          Condición
          <input
            maxLength={1000}
            placeholder="Ej. cobertura entre 70% y 79%"
            value={value.condition}
            onChange={(event) =>
              setValue({ ...value, condition: event.target.value })
            }
          />
        </label>
        {!value.condition.trim() && (
          <p className="rubric-hint">
            La condición es una descripción; no se ejecuta como una regla en
            React.
          </p>
        )}
        <label>
          Puntaje del nivel
          <input
            type="number"
            min="0"
            max="1000"
            step="0.1"
            value={value.score}
            onChange={(event) =>
              setValue({ ...value, score: numericValue(event.target.value) })
            }
          />
        </label>
        {invalid && (
          <p role="alert" className="rubric-error">
            El nivel supera el máximo del criterio ({maxScore}). Puedes
            conservarlo en un borrador y corregirlo antes de publicar.
          </p>
        )}
        <div className="rubric-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Guardar nivel</Button>
        </div>
      </form>
    </Dialog>
  );
}
