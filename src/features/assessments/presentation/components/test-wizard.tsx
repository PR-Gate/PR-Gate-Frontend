import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import type {
  Assessment,
  AssessmentCatalog,
  Question,
  TestDraft,
} from '../../domain/assessment';
import { useTestActions } from '../hooks/use-assessments';
import { limaInput, limaIso, testBasicsSchema } from '../schemas/test.schema';
import { QuestionEditor } from './question-editor';
import { testDate } from '../test-labels';
type Basics = Pick<
  TestDraft,
  'title' | 'courseId' | 'durationMinutes' | 'instructions'
>;
export function TestWizard({
  catalog,
  existing,
  onClose,
  onSaved,
}: {
  catalog: AssessmentCatalog;
  existing?: Assessment;
  onClose(): void;
  onSaved(id: string): void;
}) {
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState<Question[]>(
    existing?.questions ?? [],
  );
  const [assignment, setAssignment] = useState<TestDraft['assignment']>(
    existing?.assignment ?? { mode: 'all', ids: [] },
  );
  const [opens, setOpens] = useState(limaInput(existing?.opensAt ?? ''));
  const [closes, setCloses] = useState(limaInput(existing?.closesAt ?? ''));
  const [editing, setEditing] = useState<Question | null | undefined>();
  const [bank, setBank] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [error, setError] = useState('');
  const [savedId, setSavedId] = useState(existing?.id);
  const actions = useTestActions();
  const busy = actions.save.isPending || actions.publish.isPending;
  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState: { errors, isDirty },
  } = useForm<Basics>({
    resolver: zodResolver(testBasicsSchema),
    defaultValues: {
      title: existing?.title ?? '',
      courseId: existing?.courseId ?? '',
      durationMinutes: existing?.durationMinutes ?? 45,
      instructions: existing?.instructions ?? '',
    },
  });
  const courseId = useWatch({ control, name: 'courseId' });
  const course = catalog.courses.find((course) => course.id === courseId);
  const total = questions.reduce((sum, question) => sum + question.points, 0);
  const recipients =
    course?.students.filter(
      (student) =>
        assignment.mode === 'all' ||
        assignment.ids.includes(
          assignment.mode === 'teams' ? student.teamId : student.id,
        ),
    ) ?? [];
  const input = (): TestDraft => ({
    ...getValues(),
    questions,
    assignment,
    opensAt: limaIso(opens),
    closesAt: limaIso(closes),
  });
  const requestClose = () => {
    if (busy) return;
    if (isDirty || questions.length || savedId) setDiscard(true);
    else onClose();
  };
  const save = async (publish: boolean) => {
    setError('');
    try {
      const draft = await actions.save.mutateAsync({
        input: input(),
        id: savedId,
      });
      setSavedId(draft.id);
      if (publish) await actions.publish.mutateAsync(draft.id);
      toast.success(
        publish
          ? 'Test publicado o programado en la demostración'
          : 'Borrador guardado en la demostración',
      );
      onSaved(draft.id);
    } catch {
      setError(
        publish
          ? 'No se pudo publicar. Si se guardó el borrador, puedes volver a intentarlo sin duplicarlo.'
          : 'No se pudo guardar el borrador. Inténtalo nuevamente.',
      );
      setConfirm(false);
    }
  };
  const preparePublish = () => {
    if (
      !questions.length ||
      !recipients.length ||
      !opens ||
      !closes ||
      Date.parse(limaIso(closes)) <=
        Math.max(Date.parse(limaIso(opens)), Date.now())
    ) {
      setError(
        'Agrega preguntas, selecciona alumnos y define una fecha límite futura posterior a la apertura.',
      );
      return;
    }
    setError('');
    setConfirm(true);
  };
  const move = (index: number, direction: number) =>
    setQuestions((values) => {
      const next = [...values];
      const other = index + direction;
      if (!next[other] || !next[index]) return values;
      [next[index], next[other]] = [next[other]!, next[index]!];
      return next;
    });
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) requestClose();
      }}
      title={existing ? 'Editar test' : 'Crear un test'}
      description={
        [
          'Primero, completa los datos básicos.',
          'Ahora agrega las preguntas.',
          'Por último, elige quiénes recibirán el test.',
        ][step] ?? ''
      }
    >
      <div className="assessment-wizard">
        <ol className="test-stepper" aria-label="Progreso de creación">
          {['Datos', 'Preguntas', 'Alumnos'].map((label, index) => (
            <li key={label} aria-current={step === index ? 'step' : undefined}>
              <span>{index + 1}</span>
              {label}
            </li>
          ))}
        </ol>
        <p className="test-points" aria-live="polite">
          {questions.length} preguntas · {total} puntos en total
        </p>
        {existing?.status === 'scheduled' && (
          <p className="assessment-notice">
            Guardar cambios como borrador retirará la programación. Confirma
            “Publicar test” para programarlo de nuevo.
          </p>
        )}
        {error && (
          <p role="alert" className="assessment-error">
            {error}
          </p>
        )}
        {discard ? (
          <div className="assessment-notice">
            <p>
              ¿Cerrar la edición? Los cambios que no hayas guardado se perderán.
            </p>
            <div className="assessment-actions">
              <Button variant="outline" onClick={() => setDiscard(false)}>
                Seguir editando
              </Button>
              <Button onClick={onClose}>Cerrar sin guardar</Button>
            </div>
          </div>
        ) : confirm ? (
          <div className="test-confirmation">
            <h3>Revisa antes de publicar</h3>
            <dl>
              {[
                ['Nombre', getValues('title')],
                ['Curso', `${course?.name} · Sección ${course?.section}`],
                ['Preguntas', questions.length],
                ['Puntaje total', total],
                ['Duración', `${getValues('durationMinutes')} minutos`],
                ['Estudiantes asignados', recipients.length],
                ['Apertura', testDate(limaIso(opens))],
                ['Fecha límite', testDate(limaIso(closes))],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <p>
              Se guardará primero como borrador. Si la apertura es futura,
              quedará programado.
            </p>
            <div className="assessment-actions">
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => setConfirm(false)}
              >
                Volver
              </Button>
              <Button
                disabled={busy}
                onClick={() => {
                  void save(true);
                }}
              >
                {busy ? 'Publicando…' : 'Confirmar publicación'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {step === 0 && (
              <form
                className="assessment-form"
                noValidate
                onSubmit={handleSubmit(() => {
                  setError('');
                  setStep(1);
                })}
              >
                <label>
                  ¿Cómo se llama el test?
                  <input
                    {...register('title')}
                    placeholder="Repaso de Quality Gates"
                    aria-invalid={Boolean(errors.title)}
                  />
                </label>
                {errors.title && <p role="alert">{errors.title.message}</p>}
                <label>
                  ¿Para qué curso es?
                  <select
                    {...register('courseId', {
                      onChange: () => setAssignment({ mode: 'all', ids: [] }),
                    })}
                  >
                    <option value="">Elige un curso</option>
                    {catalog.courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name} — Sección {course.section}
                      </option>
                    ))}
                  </select>
                </label>
                {errors.courseId && (
                  <p role="alert">{errors.courseId.message}</p>
                )}
                <label>
                  ¿Cuánto tiempo tendrán? (minutos)
                  <input
                    type="number"
                    min="1"
                    max="300"
                    {...register('durationMinutes', { valueAsNumber: true })}
                  />
                </label>
                {errors.durationMinutes && (
                  <p role="alert">{errors.durationMinutes.message}</p>
                )}
                <label>
                  Indicaciones para los alumnos — opcional
                  <textarea
                    {...register('instructions')}
                    placeholder="Lee cada pregunta con atención."
                  />
                </label>
                {errors.instructions && (
                  <p role="alert">{errors.instructions.message}</p>
                )}
                <div className="assessment-actions">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={requestClose}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Siguiente</Button>
                </div>
              </form>
            )}
            {step === 1 && (
              <>
                <div className="assessment-actions">
                  <Button onClick={() => setEditing(null)}>
                    Crear pregunta
                  </Button>
                  <Button variant="outline" onClick={() => setBank(true)}>
                    Usar pregunta guardada
                  </Button>
                </div>
                <ol className="test-question-list">
                  {questions.map((question, index) => (
                    <li key={question.id}>
                      <div>
                        <strong>
                          {index + 1}. {question.prompt}
                        </strong>
                        <p>
                          {question.points} puntos ·{' '}
                          {question.kind === 'open'
                            ? 'Respuesta abierta · Requiere revisión docente'
                            : question.kind === 'boolean'
                              ? 'Verdadero o falso'
                              : 'Selección múltiple'}
                        </p>
                      </div>
                      <div className="test-question-tools">
                        <button
                          aria-label={`Subir pregunta ${index + 1}`}
                          disabled={index === 0}
                          onClick={() => move(index, -1)}
                        >
                          ↑
                        </button>
                        <button
                          aria-label={`Bajar pregunta ${index + 1}`}
                          disabled={index === questions.length - 1}
                          onClick={() => move(index, 1)}
                        >
                          ↓
                        </button>
                        <button onClick={() => setEditing(question)}>
                          Editar
                        </button>
                        <button
                          onClick={() =>
                            setQuestions((values) =>
                              values.filter((item) => item.id !== question.id),
                            )
                          }
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
                {!questions.length && (
                  <p className="test-subtle">
                    Todavía no has agregado preguntas. Puedes guardar un
                    borrador sin preguntas.
                  </p>
                )}
                <div className="assessment-actions">
                  <Button variant="outline" onClick={() => setStep(0)}>
                    Volver
                  </Button>
                  <Button onClick={() => setStep(2)}>Siguiente</Button>
                </div>
              </>
            )}
            {step === 2 && (
              <div className="assessment-form">
                <fieldset>
                  <legend>¿Quiénes recibirán el test?</legend>
                  {(
                    [
                      { value: 'all', label: 'Todos los alumnos del curso' },
                      { value: 'teams', label: 'Equipos específicos' },
                      { value: 'students', label: 'Algunos alumnos' },
                    ] as const
                  ).map((option) => (
                    <label className="test-check" key={option.value}>
                      <input
                        type="radio"
                        name="assignment"
                        checked={assignment.mode === option.value}
                        onChange={() =>
                          setAssignment({ mode: option.value, ids: [] })
                        }
                      />
                      {option.label}
                    </label>
                  ))}
                </fieldset>
                {assignment.mode !== 'all' && (
                  <fieldset>
                    <legend>
                      {assignment.mode === 'teams'
                        ? 'Elige los equipos'
                        : 'Elige los alumnos'}
                    </legend>
                    {(assignment.mode === 'teams'
                      ? course?.teams
                      : course?.students
                    )?.map((item) => (
                      <label className="test-check" key={item.id}>
                        <input
                          type="checkbox"
                          checked={assignment.ids.includes(item.id)}
                          onChange={(event) =>
                            setAssignment((value) => ({
                              ...value,
                              ids: event.target.checked
                                ? [...value.ids, item.id]
                                : value.ids.filter((id) => id !== item.id),
                            }))
                          }
                        />
                        {item.name}
                      </label>
                    ))}
                  </fieldset>
                )}
                <p aria-live="polite">
                  {recipients.length} estudiantes seleccionados
                </p>
                <label>
                  Fecha y hora de apertura (Lima)
                  <input
                    type="datetime-local"
                    value={opens}
                    onChange={(event) => setOpens(event.target.value)}
                  />
                </label>
                <label>
                  Fecha y hora límite (Lima)
                  <input
                    type="datetime-local"
                    value={closes}
                    onChange={(event) => setCloses(event.target.value)}
                  />
                </label>
                <p className="assessment-notice">
                  El test se guardará primero como borrador para que puedas
                  revisarlo.
                </p>
                <div className="assessment-actions">
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => setStep(1)}
                  >
                    Volver
                  </Button>
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => {
                      void save(false);
                    }}
                  >
                    {busy ? 'Guardando…' : 'Guardar como borrador'}
                  </Button>
                  <Button disabled={busy} onClick={preparePublish}>
                    Publicar test
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
        {editing !== undefined && (
          <QuestionEditor
            question={editing}
            onClose={() => setEditing(undefined)}
            onSave={(question) => {
              setQuestions((values) =>
                values.some((value) => value.id === question.id)
                  ? values.map((value) =>
                      value.id === question.id ? question : value,
                    )
                  : [...values, question],
              );
              setEditing(undefined);
            }}
          />
        )}
        <Dialog
          open={bank}
          onOpenChange={setBank}
          title="Preguntas guardadas"
          description="Elige una pregunta para copiarla al test. Podrás editarla después."
        >
          <ul className="test-bank">
            {catalog.savedQuestions.map((question) => (
              <li key={question.id}>
                <p>{question.prompt}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuestions((values) => [
                      ...values,
                      { ...structuredClone(question), id: crypto.randomUUID() },
                    ]);
                    setBank(false);
                  }}
                >
                  Usar esta pregunta
                </Button>
              </li>
            ))}
          </ul>
        </Dialog>
      </div>
    </Dialog>
  );
}
