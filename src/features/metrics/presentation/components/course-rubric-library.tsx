import { useState, type FormEvent } from 'react';
import { ListChecks } from 'lucide-react';
import { interpretRubricDocument } from '../../application/use-cases/interpret-rubric-document';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { useAuth } from '@/shared/services/auth/auth-context';
import { HttpError } from '@/shared/services/http/http-error';
import type { PublishedRubric } from '../../domain/evaluation';
import { useEvaluationApi } from '../hooks/use-evaluation';
import { EvaluationError } from './evaluation-feedback';

const emptyCriterion = () => ({
  id: crypto.randomUUID(),
  description: '',
  objective: '',
  points: '',
});

export function CourseRubricLibrary({
  courseId,
  teacher,
}: {
  courseId: string;
  teacher: boolean;
}) {
  const api = useEvaluationApi();
  const client = useQueryClient();
  const { user } = useAuth();
  const [draft, setDraft] = useState<PublishedRubric | null | undefined>();
  const [toArchive, setToArchive] = useState<PublishedRubric>();
  const [source, setSource] = useState<{ name: string; text: string }>();
  const upload = useMutation({
    mutationFn: async (file: File) => ({
      name: file.name,
      text: await api.readRubricDocument(file),
    }),
    onSuccess: (document) => {
      setSource(document);
      setDraft(null);
    },
  });
  const queryKey = ['live-evaluation', user?.id, 'course-rubrics', courseId];
  const rubrics = useInfiniteQuery({
    queryKey,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      api.rubrics(courseId, pageParam, signal),
    getNextPageParam: (last, _, page) =>
      last.length === 100 ? page + 1 : undefined,
  });
  const items = rubrics.data?.pages.flat() ?? [];
  const archive = useMutation({
    mutationFn: (rubricId: string) => api.archiveRubric(courseId, rubricId),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey });
      setToArchive(undefined);
    },
  });
  return (
    <section className="evaluation-card">
      <div className="evaluation-heading-row">
        <h2 className="evaluation-heading-title"><ListChecks size={20} className="text-primary" aria-hidden="true" />Rúbricas del curso</h2>
        {teacher && rubrics.isSuccess && items.length === 0 && (
          <div className="evaluation-actions">
            <label>
              {upload.isPending ? 'Leyendo documento…' : 'Subir rúbrica'}
              <input
                aria-label="Subir rúbrica"
                type="file"
                accept=".pdf,.docx,.xlsx"
                disabled={upload.isPending || draft !== undefined}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  if (file) upload.mutate(file);
                }}
              />
            </label>
            <Button disabled={upload.isPending || draft !== undefined} onClick={() => setDraft(null)}>
              Crear rúbrica
            </Button>
          </div>
        )}
      </div>
      {upload.isError && (
        <p role="alert">
          {upload.error instanceof Error
            ? upload.error.message
            : 'No se pudo leer el documento.'}
        </p>
      )}
      {rubrics.isPending && <p role="status">Cargando rúbricas…</p>}
      {rubrics.isError && (
        <EvaluationError retry={() => void rubrics.refetch()} />
      )}
      {rubrics.isSuccess && !items.length && (
        <p>Aún no hay rúbricas publicadas para este curso.</p>
      )}
      {teacher && items.length > 1 && (
        <p>Este curso tiene varias rúbricas. Retira las que sobran para conservar una sola.</p>
      )}
      {items.map((rubric) => (
        <article key={rubric.id} className="evaluation-rubric">
          <div className="evaluation-heading-row">
            <h3>{rubric.title}</h3>
            <span className="evaluation-badge">Versión {rubric.version} · Máximo {rubric.maxPoints} puntos</span>
          </div>
          <ul>
            {rubric.criteria.map((item) => (
              <li key={item.id}>
                {item.description}
                <strong className="evaluation-criterion-points">Máx. {item.maxPoints} pts</strong>
              </li>
            ))}
          </ul>
          {teacher && (
            <div className="evaluation-actions">
              <Button variant="outline" onClick={() => setDraft(rubric)}>
                Nueva versión
              </Button>
              <Button variant="outline" onClick={() => {
                archive.reset();
                setToArchive(rubric);
              }}>
                Retirar rúbrica
              </Button>
            </div>
          )}
        </article>
      ))}
      {rubrics.hasNextPage && (
        <Button
          variant="outline"
          disabled={rubrics.isFetchingNextPage}
          onClick={() => void rubrics.fetchNextPage()}
        >
          Cargar más rúbricas
        </Button>
      )}
      {toArchive && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open && !archive.isPending) setToArchive(undefined);
          }}
          title="Retirar rúbrica del curso"
          description={`«${toArchive.title}» se quitará del curso. Se conservarán las evaluaciones previas. Los repositorios ya configurados requieren que apruebes una nueva configuración para cambiar de rúbrica.`}
        >
          <div className="evaluation-actions">
            <Button variant="outline" disabled={archive.isPending} onClick={() => setToArchive(undefined)}>
              Cancelar
            </Button>
            <Button disabled={archive.isPending} onClick={() => archive.mutate(toArchive.id)}>
              {archive.isPending ? 'Retirando…' : 'Retirar rúbrica'}
            </Button>
          </div>
          {archive.isError && <p role="alert">No se pudo retirar la rúbrica. Actualiza la página e inténtalo de nuevo.</p>}
        </Dialog>
      )}
      {draft !== undefined && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setDraft(undefined);
              setSource(undefined);
            }
          }}
          title={
            source
              ? 'Revisar rúbrica importada'
              : draft
                ? 'Nueva versión'
                : 'Crear rúbrica'
          }
          description="Distribuye 20 puntos entre los criterios del curso."
        >
          <CourseRubricForm
            courseId={courseId}
            previous={draft}
            source={source}
            onSaved={() => {
              setDraft(undefined);
              setSource(undefined);
              void client.invalidateQueries({ queryKey });
            }}
          />
        </Dialog>
      )}
    </section>
  );
}

function CourseRubricForm({
  courseId,
  previous,
  source,
  onSaved,
}: {
  courseId: string;
  previous: PublishedRubric | null;
  source?: { name: string; text: string };
  onSaved: () => void;
}) {
  const api = useEvaluationApi();
  const [criteria, setCriteria] = useState<
    { id: string; description: string; objective: string; points: string }[]
  >(() => {
    if (previous)
      return previous.criteria.map((c) => ({
        ...c,
        points: String(c.maxPoints),
      }));
    const imported = source ? interpretRubricDocument(source.text) : [];
    return imported.length
      ? imported.map((item) => ({ ...item, id: crypto.randomUUID() }))
      : [emptyCriterion()];
  });
  const [error, setError] = useState('');
  const fitsAnalysis = (text: string) =>
    text.length <= 100_000 &&
    new TextEncoder().encode(JSON.stringify({ text })).length <= 262_144;
  const needsExcerpt = Boolean(source && !fitsAnalysis(source.text));
  const [excerpt, setExcerpt] = useState('');
  const [title, setTitle] = useState(
    previous?.title ?? source?.name.replace(/\.[^.]+$/, '').slice(0, 200) ?? '',
  );
  const analyze = useMutation({
    mutationFn: (text: string) => api.analyzeRubricDocument(courseId, text),
    onSuccess: (result) => {
      if (!result.criteria.length) {
        setError(
          'La IA no encontró criterios de evaluación en este documento.',
        );
        return;
      }
      setError('');
      if (result.title.trim()) setTitle(result.title.trim().slice(0, 200));
      setCriteria(
        result.criteria.map((criterion) => ({
          id: crypto.randomUUID(),
          description: criterion.description.slice(0, 1000),
          objective: criterion.objective.slice(0, 2000),
          points:
            criterion.maxPoints === null ? '' : String(criterion.maxPoints),
        })),
      );
    },
  });
  const save = useMutation({
    mutationFn: (title: string) =>
      api.publish(
        courseId,
        {
          title,
          criteria: criteria.map(({ id, description, objective, points }) => ({
            id,
            description: description.trim(),
            objective: objective.trim(),
            maxPoints: Number(points),
          })),
        },
        previous?.id,
      ),
    onSuccess: onSaved,
  });
  const total = criteria.reduce(
    (sum, item) => sum + Math.round(Number(item.points) * 100),
    0,
  );
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = String(new FormData(event.currentTarget).get('title')).trim();
    if (
      !title ||
      total !== 2000 ||
      criteria.some(
        (c) =>
          !c.description.trim() || !c.objective.trim() || Number(c.points) <= 0,
      )
    ) {
      setError('Completa los campos y distribuye exactamente 20 puntos.');
      return;
    }
    setError('');
    save.mutate(title);
  }
  function update(
    id: string,
    key: 'description' | 'objective' | 'points',
    value: string,
  ) {
    setCriteria((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    );
  }
  return (
    <form className="evaluation-form" onSubmit={submit}>
      <fieldset
        disabled={save.isPending || analyze.isPending}
        className="evaluation-form"
      >
        <label>
          Nombre de la rúbrica
          <input
            name="title"
            required
            maxLength={200}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        {source && (
          <div>
            {needsExcerpt && (
              <label>
                Fragmento para analizar
                <textarea
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
                  placeholder="Copia aquí la sección de evaluación desde «Ver texto del documento»."
                />
                <span className="evaluation-subtitle">
                  El documento completo supera el límite. Incluye los criterios,
                  sus niveles y puntajes.
                </span>
              </label>
            )}
            <Button
              type="button"
              variant="outline"
              disabled={needsExcerpt && !excerpt.trim()}
              onClick={() => {
                const text = (needsExcerpt ? excerpt : source.text).trim();
                if (!fitsAnalysis(text)) {
                  setError(
                    'El fragmento todavía supera el límite. Reduce el texto a la tabla de evaluación.',
                  );
                  return;
                }
                setError('');
                analyze.mutate(text);
              }}
            >
              {analyze.isPending
                ? 'Analizando documento…'
                : 'Analizar documento con IA'}
            </Button>
            <p className="evaluation-subtitle">
              {needsExcerpt
                ? 'Se enviará el fragmento seleccionado a Gemini.'
                : 'Se enviará el texto del documento a Gemini.'}{' '}
              La propuesta reemplazará los criterios de esta vista previa.
            </p>
            {analyze.isError && (
              <p role="alert">
                No se pudo analizar el documento. Tus criterios actuales siguen
                disponibles para editar.
              </p>
            )}
          </div>
        )}
        {source && (
          <details>
            <summary>Ver texto del documento</summary>
            <pre className="max-h-56 overflow-auto whitespace-pre-wrap">
              {source.text}
            </pre>
          </details>
        )}
        {criteria.map((item, index) => (
          <fieldset key={item.id} className="evaluation-criterion-editor">
            <legend>Criterio {index + 1}</legend>
            <label>
              Descripción
              <input
                required
                maxLength={1000}
                value={item.description}
                onChange={(e) => update(item.id, 'description', e.target.value)}
              />
            </label>
            <label>
              Qué se verificará
              <textarea
                required
                maxLength={2000}
                value={item.objective}
                onChange={(e) => update(item.id, 'objective', e.target.value)}
              />
            </label>
            <label>
              Puntos máximos
              <input
                required
                type="number"
                min="0.01"
                max="20"
                step="0.01"
                value={item.points}
                onChange={(e) => update(item.id, 'points', e.target.value)}
              />
            </label>
            {criteria.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setCriteria((current) =>
                    current.filter((c) => c.id !== item.id),
                  )
                }
              >
                Quitar criterio {index + 1}
              </Button>
            )}
          </fieldset>
        ))}
        <Button
          type="button"
          variant="outline"
          disabled={criteria.length >= 100}
          onClick={() =>
            setCriteria((current) => [...current, emptyCriterion()])
          }
        >
          Añadir criterio
        </Button>
        <p className="evaluation-total">Total {total / 100} / 20 puntos</p>
        {error && <p role="alert">{error}</p>}
        {save.isError && (
          save.error instanceof HttpError && save.error.status === 409 && !previous
            ? <p role="alert">Este curso ya tiene una rúbrica técnica. Actualiza la página para verla.</p>
            : <EvaluationError />
        )}
        <Button type="submit">
          {save.isPending ? 'Publicando…' : 'Publicar rúbrica'}
        </Button>
      </fieldset>
    </form>
  );
}
