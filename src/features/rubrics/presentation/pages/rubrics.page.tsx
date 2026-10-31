import { useState } from 'react';
import { FileUp, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import {
  ErrorState,
  LoadingState,
} from '@/shared/components/feedback/async-state';
import type { Rubric, RubricDraft, RubricStatus } from '../../domain/rubric';
import { publicationIssues } from '../../domain/rubric';
import { useRubricActions, useRubricLibrary } from '../hooks/use-rubrics';
import { evaluationLabels, sourceLabels } from '../rubric-labels';
import { RubricLibrary } from '../components/rubric-library';
import { RubricEditor } from '../components/rubric-editor';
import { RubricUploadModal } from '../components/rubric-upload-modal';
import { PublishRubricModal } from '../components/publish-rubric-modal';
import { RubricStatusBadge } from '../components/rubric-status-badge';
import '../styles/rubrics.css';
export default function RubricsPage() {
  const query = useRubricLibrary();
  const actions = useRubricActions();
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('');
  const [status, setStatus] = useState<RubricStatus | ''>('');
  const [editing, setEditing] = useState<
    Rubric | RubricDraft | null | undefined
  >();
  const [upload, setUpload] = useState(false);
  const [view, setView] = useState<Rubric | null>(null);
  const [publish, setPublish] = useState<Rubric | null>(null);
  const [confirm, setConfirm] = useState<{
    action: 'archive' | 'delete';
    rubric: Rubric;
  } | null>(null);
  const [error, setError] = useState('');
  const busy =
    actions.duplicate.isPending ||
    actions.archive.isPending ||
    actions.remove.isPending ||
    actions.publish.isPending;
  const courses = query.data?.courses ?? [];
  const filtered = (query.data?.rubrics ?? []).filter(
    (rubric) =>
      rubric.name
        .toLocaleLowerCase('es')
        .includes(search.trim().toLocaleLowerCase('es')) &&
      (!course || rubric.courseId === course) &&
      (!status || rubric.status === status),
  );
  const action = async (
    kind: 'view' | 'edit' | 'duplicate' | 'publish' | 'archive' | 'delete',
    rubric: Rubric,
  ) => {
    setError('');
    if (kind === 'view') setView(rubric);
    else if (kind === 'edit') setEditing(rubric);
    else if (kind === 'publish') {
      if (!publicationIssues(rubric).length) setPublish(rubric);
    } else if (kind === 'archive' || kind === 'delete')
      setConfirm({ action: kind, rubric });
    else
      try {
        await actions.duplicate.mutateAsync(rubric.id);
        toast.success('Rúbrica duplicada como borrador.');
      } catch {
        toast.error('No se pudo duplicar la rúbrica.');
      }
  };
  const publishNow = async () => {
    if (!publish) return;
    setError('');
    try {
      await actions.publish.mutateAsync(publish.id);
      setPublish(null);
      toast.success('Rúbrica publicada correctamente.');
    } catch {
      setError(
        'No se pudo publicar. Actualiza la biblioteca e inténtalo nuevamente.',
      );
    }
  };
  const confirmAction = async () => {
    if (!confirm) return;
    setError('');
    try {
      if (confirm.action === 'delete')
        await actions.remove.mutateAsync(confirm.rubric.id);
      else await actions.archive.mutateAsync(confirm.rubric.id);
      toast.success(
        confirm.action === 'delete'
          ? 'Rúbrica eliminada de la biblioteca.'
          : 'Rúbrica archivada.',
      );
      setConfirm(null);
    } catch {
      setError('No se pudo completar la acción. Inténtalo nuevamente.');
    }
  };
  return (
    <section className="rubrics-page">
      <div className="rubric-heading">
        <div>
          <p className="eyebrow">ESPACIO DOCENTE</p>
          <h1>Rúbricas</h1>
          <p>
            Crea una rúbrica desde cero o sube una que ya utiliza tu
            institución.
          </p>
        </div>
        <div className="rubric-actions">
          <Button disabled={!query.data} onClick={() => setEditing(null)}>
            <Plus size={16} />
            Crear rúbrica
          </Button>
          <Button variant="outline" onClick={() => setUpload(true)}>
            <FileUp size={16} />
            Subir rúbrica
          </Button>
        </div>
      </div>
      <p className="rubric-demo">
        Demostración · Datos simulados mediante MSW. Los cambios se reinician al
        recargar.
      </p>
      <div className="rubric-filters">
        <label className="rubric-search">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Buscar rúbrica</span>
          <input
            placeholder="Buscar por nombre"
            aria-label="Buscar rúbrica"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">Filtrar por curso</span>
          <select
            aria-label="Filtrar por curso"
            value={course}
            onChange={(event) => setCourse(event.target.value)}
          >
            <option value="">Todos los cursos</option>
            {courses.map((course) => (
              <option value={course.id} key={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filtrar por estado</span>
          <select
            aria-label="Filtrar por estado"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as RubricStatus | '')
            }
          >
            <option value="">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="published">Publicada</option>
            <option value="archived">Archivada</option>
          </select>
        </label>
      </div>
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          error={query.error}
          retry={() => {
            void query.refetch();
          }}
        />
      ) : (
        <RubricLibrary
          rubrics={filtered}
          courses={courses}
          busy={busy}
          onAction={(kind, rubric) => {
            void action(kind, rubric);
          }}
        />
      )}
      {editing !== undefined && query.data && (
        <RubricEditor
          initial={editing ?? undefined}
          courses={courses}
          onClose={() => setEditing(undefined)}
        />
      )}
      {upload && (
        <RubricUploadModal
          onClose={() => setUpload(false)}
          onPreview={(draft) => {
            setUpload(false);
            setEditing(draft);
          }}
        />
      )}
      {publish && (
        <PublishRubricModal
          draft={publish}
          courseName={
            courses.find((course) => course.id === publish.courseId)?.name ?? ''
          }
          busy={busy}
          error={error}
          onClose={() => {
            if (!busy) setPublish(null);
          }}
          onPublish={() => {
            void publishNow();
          }}
        />
      )}
      <Dialog
        open={Boolean(confirm)}
        onOpenChange={(open) => {
          if (!open && !busy) setConfirm(null);
        }}
        title={
          confirm?.action === 'delete' ? 'Eliminar rúbrica' : 'Archivar rúbrica'
        }
        description={`¿Confirmas esta acción sobre “${confirm?.rubric.name || 'Rúbrica sin nombre'}”? La versión ya asignada al estudiante se conserva sin cambios.`}
      >
        {error && (
          <p role="alert" className="rubric-error">
            {error}
          </p>
        )}
        <div className="rubric-actions">
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => setConfirm(null)}
          >
            Cancelar
          </Button>
          <Button
            disabled={busy}
            onClick={() => {
              void confirmAction();
            }}
          >
            {busy
              ? 'Guardando…'
              : confirm?.action === 'delete'
                ? 'Confirmar eliminación'
                : 'Confirmar archivo'}
          </Button>
        </div>
      </Dialog>
      <Dialog
        open={Boolean(view)}
        onOpenChange={(open) => {
          if (!open) setView(null);
        }}
        title={view?.name || 'Rúbrica sin nombre'}
        description={`${view?.criteria.length ?? 0} criterios · ${view?.totalScore ?? 0} puntos · Versión ${view?.version ?? ''}`}
        contentClassName="rubric-editor-dialog"
      >
        {view && (
          <>
            <RubricStatusBadge status={view.status} />
            <p className="rubric-notice">
              {courses.find((course) => course.id === view.courseId)?.name ||
                'Curso pendiente'}{' '}
              · Sección {view.sectionId || 'pendiente'}
            </p>
            <p>{view.description}</p>
            <ol className="rubric-criteria-list">
              {view.criteria.map((criterion, index) => (
                <li key={criterion.id}>
                  <strong>
                    {index + 1}. {criterion.name || 'Criterio sin nombre'} ·{' '}
                    {criterion.maxScore} puntos
                  </strong>
                  <p>{criterion.description}</p>
                  <p>
                    {sourceLabels[criterion.evidenceSource].name} ·{' '}
                    {evaluationLabels[criterion.evaluationType]}
                  </p>
                  <ul>
                    {criterion.levels.map((level) => (
                      <li key={level.id}>
                        {level.name}: {level.condition} → {level.score} puntos
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </>
        )}
      </Dialog>
    </section>
  );
}
