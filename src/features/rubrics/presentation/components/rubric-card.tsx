import type { Rubric, RubricCourse } from '../../domain/rubric';
import { publicationIssues } from '../../domain/rubric';
import { Button } from '@/shared/components/ui/button';
import { RubricStatusBadge } from './rubric-status-badge';
import { rubricDate } from '../rubric-labels';
export function RubricCard({
  rubric,
  courses,
  busy,
  onAction,
}: {
  rubric: Rubric;
  courses: readonly RubricCourse[];
  busy: boolean;
  onAction(
    action: 'view' | 'edit' | 'duplicate' | 'publish' | 'archive' | 'delete',
    rubric: Rubric,
  ): void;
}) {
  const course = courses.find((course) => course.id === rubric.courseId);
  const issues = publicationIssues(rubric);
  return (
    <article className="rubric-card">
      <div className="rubric-row">
        <RubricStatusBadge status={rubric.status} />
        <span className="rubric-hint">v{rubric.version}</span>
      </div>
      <h3>{rubric.name || 'Rúbrica sin nombre'}</h3>
      <p>
        {course?.name || 'Curso pendiente'} —{' '}
        {course?.sections.find((section) => section.id === rubric.sectionId)
          ?.name || 'Sección pendiente'}
      </p>
      <dl className="rubric-card-stats">
        <div>
          <dt>Criterios</dt>
          <dd>{rubric.criteria.length}</dd>
        </div>
        <div>
          <dt>Puntaje total</dt>
          <dd>{rubric.totalScore} puntos</dd>
        </div>
      </dl>
      <p className="rubric-hint">
        Última modificación: {rubricDate(rubric.updatedAt)} · Lima
      </p>
      <div className="rubric-actions">
        <Button size="sm" onClick={() => onAction('view', rubric)}>
          Ver
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => onAction('edit', rubric)}
        >
          Editar
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => onAction('duplicate', rubric)}
        >
          Duplicar
        </Button>
        {rubric.status === 'draft' && (
          <Button
            size="sm"
            variant="outline"
            disabled={busy || Boolean(issues.length)}
            title={issues[0]}
            onClick={() => onAction('publish', rubric)}
          >
            Publicar
          </Button>
        )}
        {rubric.status !== 'archived' && (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => onAction('archive', rubric)}
          >
            Archivar
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={() => onAction('delete', rubric)}
        >
          Eliminar
        </Button>
      </div>
      {rubric.status === 'draft' && issues[0] && (
        <p className="rubric-hint">Para publicar: {issues[0]}</p>
      )}
    </article>
  );
}
