import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Dialog } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import type {
  Rubric,
  RubricCourse,
  RubricCriterion,
  RubricDraft,
} from '../../domain/rubric';
import { publicationIssues, rubricTotal } from '../../domain/rubric';
import { useRubricActions } from '../hooks/use-rubrics';
import { evaluationLabels, sourceLabels } from '../rubric-labels';
import { TotalScoreSummary } from './total-score-summary';
import { RubricCriterionEditor } from './rubric-criterion-editor';
import { PublishRubricModal } from './publish-rubric-modal';
const basicsSchema = z.object({
  name: z.string().max(200, 'Máximo 200 caracteres'),
  courseId: z.string(),
  sectionId: z.string(),
  description: z.string().max(3000, 'Máximo 3000 caracteres'),
});
type Basics = z.infer<typeof basicsSchema>;
export function RubricEditor({
  initial,
  courses,
  onClose,
}: {
  initial?: Rubric | RubricDraft;
  courses: readonly RubricCourse[];
  onClose(): void;
}) {
  const [base] = useState<RubricDraft>(() =>
    initial
      ? structuredClone(initial)
      : {
          name: '',
          courseId: '',
          sectionId: '',
          description: '',
          expectedScore: 20,
          version: '1.0',
          criteria: [],
        },
  );
  const newVersion =
    initial && 'status' in initial && initial.status !== 'draft';
  const [savedId, setSavedId] = useState(
    initial && 'id' in initial && initial.status === 'draft'
      ? initial.id
      : undefined,
  );
  const [criteria, setCriteria] = useState<RubricCriterion[]>(base.criteria);
  const [editing, setEditing] = useState<RubricCriterion | null | undefined>();
  const [remove, setRemove] = useState<string | null>(null);
  const [discard, setDiscard] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [issues, setIssues] = useState<string[]>([]);
  const [error, setError] = useState('');
  const actions = useRubricActions();
  const busy = actions.save.isPending || actions.publish.isPending;
  const {
    register,
    control,
    setValue,
    getValues,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isDirty },
  } = useForm<Basics>({
    resolver: zodResolver(basicsSchema),
    defaultValues: {
      name: base.name,
      courseId: base.courseId,
      sectionId: base.sectionId,
      description: base.description,
    },
  });
  const courseId = useWatch({ control, name: 'courseId' });
  const course = courses.find((item) => item.id === courseId);
  const expected = course?.expectedScore ?? base.expectedScore;
  const total = rubricTotal(criteria);
  const draft = (): RubricDraft => ({
    ...getValues(),
    criteria,
    expectedScore: expected,
    version: newVersion
      ? `${(Number.parseInt(base.version) || 1) + 1}.0`
      : base.version,
  });
  const close = () => {
    if (busy) return;
    if (
      isDirty ||
      JSON.stringify(criteria) !== JSON.stringify(base.criteria) ||
      (!savedId && (base.name || base.criteria.length))
    )
      setDiscard(true);
    else onClose();
  };
  const save = async (publish: boolean) => {
    setError('');
    try {
      const saved = await actions.save.mutateAsync({
        draft: draft(),
        id: savedId,
      });
      setSavedId(saved.id);
      if (publish) await actions.publish.mutateAsync(saved.id);
      toast.success(
        publish
          ? 'Rúbrica publicada correctamente.'
          : 'Rúbrica guardada como borrador.',
      );
      onClose();
    } catch {
      setError(
        publish
          ? 'No se pudo publicar. El borrador guardado puede reintentarse sin duplicarlo.'
          : 'No se pudo guardar el borrador. Inténtalo nuevamente.',
      );
    }
  };
  const prepare = () => {
    const values = getValues();
    if (!values.name.trim())
      setFieldError('name', { message: 'Escribe el nombre de la rúbrica.' });
    if (!values.courseId)
      setFieldError('courseId', {
        message: 'Selecciona un curso antes de publicar.',
      });
    if (!values.sectionId)
      setFieldError('sectionId', {
        message: 'Selecciona una sección antes de publicar.',
      });
    const found = publicationIssues(draft());
    setIssues(found);
    if (!found.length) {
      setError('');
      setConfirm(true);
    }
  };
  const move = (index: number, direction: number) =>
    setCriteria((current) => {
      const next = [...current];
      const other = index + direction;
      if (!next[other]) return current;
      [next[index], next[other]] = [next[other]!, next[index]!];
      return next;
    });
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
      title={initial ? 'Editar rúbrica' : 'Crear rúbrica'}
      description="Detalla qué se evaluará y cuántos puntos vale cada criterio."
      contentClassName="rubric-editor-dialog"
    >
      <TotalScoreSummary total={total} expected={expected} />
      {newVersion && (
        <p className="rubric-notice">
          Se creará un nuevo borrador de versión. La versión publicada y los
          resultados ya asignados no cambiarán.
        </p>
      )}
      {error && !confirm && (
        <p role="alert" className="rubric-error">
          {error}
        </p>
      )}
      {issues.length > 0 && (
        <div role="alert" className="rubric-error">
          <strong>Antes de publicar:</strong>
          <ul>
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
      <form className="rubric-form" onSubmit={handleSubmit(prepare)} noValidate>
        <fieldset disabled={busy} className="rubric-basics">
          <legend className="sr-only">Datos generales</legend>
          <label>
            Nombre de la rúbrica
            <input
              {...register('name')}
              maxLength={200}
              placeholder="Calidad de Software"
              aria-invalid={Boolean(errors.name)}
            />
          </label>
          {errors.name && (
            <p role="alert" className="rubric-error">
              {errors.name.message}
            </p>
          )}
          <div className="rubric-two-columns">
            <div>
              <label>
                Curso
                <select
                  aria-invalid={Boolean(errors.courseId)}
                  {...register('courseId', {
                    onChange: () =>
                      setValue('sectionId', '', { shouldDirty: true }),
                  })}
                >
                  <option value="">Selecciona un curso</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </label>
              {errors.courseId && (
                <p role="alert" className="rubric-error">
                  {errors.courseId.message}
                </p>
              )}
            </div>
            <div>
              <label>
                Sección
                <select
                  {...register('sectionId')}
                  disabled={!course}
                  aria-invalid={Boolean(errors.sectionId)}
                >
                  <option value="">Selecciona una sección</option>
                  {course?.sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </label>
              {errors.sectionId && (
                <p role="alert" className="rubric-error">
                  {errors.sectionId.message}
                </p>
              )}
            </div>
          </div>
          <label>
            Descripción opcional
            <textarea {...register('description')} maxLength={3000} />
          </label>
          {errors.description && (
            <p role="alert" className="rubric-error">
              {errors.description.message}
            </p>
          )}
        </fieldset>
        <div className="rubric-row">
          <h3>Criterios de evaluación</h3>
          <Button
            type="button"
            variant="outline"
            disabled={busy || criteria.length >= 100}
            onClick={() => setEditing(null)}
          >
            Agregar otro criterio
          </Button>
        </div>
        {!criteria.length && (
          <p className="rubric-empty-inline">
            Aún no hay criterios. Puedes guardar un borrador y completarlo
            después.
          </p>
        )}
        <ol className="rubric-criteria-list">
          {criteria.map((criterion, index) => (
            <li key={criterion.id}>
              <div>
                <strong>
                  {index + 1}. {criterion.name || 'Criterio sin nombre'}
                </strong>
                <span>{criterion.maxScore} puntos</span>
              </div>
              <p>{criterion.description || 'Descripción pendiente'}</p>
              <p>
                {sourceLabels[criterion.evidenceSource].name} ·{' '}
                {evaluationLabels[criterion.evaluationType]} ·{' '}
                {criterion.levels.length} niveles
              </p>
              <div className="rubric-mini-actions">
                <button
                  type="button"
                  aria-label={`Subir criterio ${index + 1}`}
                  disabled={busy || index === 0}
                  onClick={() => move(index, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label={`Bajar criterio ${index + 1}`}
                  disabled={busy || index === criteria.length - 1}
                  onClick={() => move(index, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setEditing(criterion)}
                >
                  Editar criterio
                </button>
                <button
                  type="button"
                  disabled={busy || criteria.length >= 100}
                  onClick={() =>
                    setCriteria((current) => [
                      ...current,
                      {
                        ...structuredClone(criterion),
                        id: crypto.randomUUID(),
                        levels: criterion.levels.map((level) => ({
                          ...level,
                          id: crypto.randomUUID(),
                        })),
                      },
                    ])
                  }
                >
                  Duplicar criterio
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setRemove(criterion.id)}
                >
                  Eliminar criterio
                </button>
              </div>
            </li>
          ))}
        </ol>
        <div className="rubric-editor-footer">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={close}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={handleSubmit(() => {
              void save(false);
            })}
          >
            {busy ? 'Guardando…' : 'Guardar como borrador'}
          </Button>
          <Button type="submit" disabled={busy}>
            Revisar y publicar
          </Button>
        </div>
      </form>
      {editing !== undefined && (
        <RubricCriterionEditor
          criterion={editing ?? undefined}
          onClose={() => setEditing(undefined)}
          onSave={(criterion) => {
            setCriteria((current) =>
              current.some((item) => item.id === criterion.id)
                ? current.map((item) =>
                    item.id === criterion.id ? criterion : item,
                  )
                : [...current, criterion],
            );
            setEditing(undefined);
            setIssues([]);
          }}
        />
      )}
      {confirm && (
        <PublishRubricModal
          draft={draft()}
          courseName={`${course?.name} — ${getValues('sectionId')}`}
          busy={busy}
          error={error}
          onClose={() => setConfirm(false)}
          onPublish={() => {
            void save(true);
          }}
        />
      )}
      <Dialog
        open={Boolean(remove)}
        onOpenChange={(open) => {
          if (!open) setRemove(null);
        }}
        title="Eliminar criterio"
        description="El criterio y sus niveles se quitarán de este borrador."
      >
        <div className="rubric-actions">
          <Button variant="outline" onClick={() => setRemove(null)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              setCriteria((current) =>
                current.filter((item) => item.id !== remove),
              );
              setRemove(null);
            }}
          >
            Confirmar eliminación
          </Button>
        </div>
      </Dialog>
      <Dialog
        open={discard}
        onOpenChange={setDiscard}
        title="¿Cerrar sin guardar?"
        description="Se perderán los cambios que no hayas guardado. Los borradores ya guardados se conservan durante la demostración."
      >
        <div className="rubric-actions">
          <Button variant="outline" onClick={() => setDiscard(false)}>
            Seguir editando
          </Button>
          <Button onClick={onClose}>Cerrar sin guardar</Button>
        </div>
      </Dialog>
    </Dialog>
  );
}
