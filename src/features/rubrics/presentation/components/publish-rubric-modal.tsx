import { Dialog } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import type { RubricDraft } from '../../domain/rubric';
import { rubricTotal } from '../../domain/rubric';
export function PublishRubricModal({
  draft,
  courseName,
  busy,
  error,
  onPublish,
  onClose,
}: {
  draft: RubricDraft;
  courseName: string;
  busy: boolean;
  error: string;
  onPublish(): void;
  onClose(): void;
}) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
      title="Revisar y publicar"
      description="Confirma los criterios y puntajes antes de publicar esta versión."
    >
      <dl className="rubric-definition">
        {[
          ['Nombre', draft.name],
          ['Curso', courseName],
          ['Número de criterios', draft.criteria.length],
          ['Puntaje total', rubricTotal(draft.criteria)],
          [
            'Criterios automáticos',
            draft.criteria.filter(
              (item) => item.evaluationType !== 'teacher-review',
            ).length,
          ],
          [
            'Criterios con revisión docente',
            draft.criteria.filter((item) => item.evaluationType !== 'automatic')
              .length,
          ],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="rubric-notice">
        Publicación simulada. Las reglas no se ejecutan ni califican alumnos
        desde esta pantalla.
      </p>
      {error && (
        <p role="alert" className="rubric-error">
          {error}
        </p>
      )}
      <div className="rubric-actions">
        <Button variant="outline" disabled={busy} onClick={onClose}>
          Volver a editar
        </Button>
        <Button disabled={busy} onClick={onPublish}>
          {busy ? 'Publicando…' : 'Publicar rúbrica'}
        </Button>
      </div>
    </Dialog>
  );
}
