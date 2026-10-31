import { Clock3 } from 'lucide-react';
import type { TeacherOverview } from '../../domain/entities/teacher-overview.entity';
export function TeacherProgressStrip({
  overview,
}: {
  overview: TeacherOverview;
}) {
  return (
    <div className="teacher-progress-strip">
      <div className="teacher-progress-time">
        <span className="teacher-icon">
          <Clock3 size={20} aria-hidden="true" />
        </span>
        <div>
          <p>Tiempo estimado ahorrado · periodo seleccionado</p>
          <strong>
            {Math.floor(overview.savedMinutes / 60)} h{' '}
            {overview.savedMinutes % 60} min
          </strong>
        </div>
      </div>
      <progress
        aria-label="Estudiantes activos"
        max={overview.totalStudents || 1}
        value={overview.activeStudents}
      />
      <div>
        <p>Estudiantes activos</p>
        <strong>
          {overview.activeStudents} de {overview.totalStudents}
        </strong>
      </div>
    </div>
  );
}
