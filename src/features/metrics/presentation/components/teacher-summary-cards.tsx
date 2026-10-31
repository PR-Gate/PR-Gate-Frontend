import { BookOpen, Check, Clock3, TriangleAlert } from 'lucide-react';
import type { TeacherOverview } from '../../domain/entities/teacher-overview.entity';
export function TeacherSummaryCards({
  overview,
}: {
  overview: TeacherOverview;
}) {
  const cards = [
    {
      label: 'Cursos activos',
      value: overview.activeCourses,
      note: 'En tu espacio académico',
      icon: BookOpen,
      tone: 'blue',
    },
    {
      label: 'Proyectos evaluados',
      value: overview.evaluatedProjects,
      note: 'En el periodo seleccionado',
      icon: Check,
      tone: 'green',
    },
    {
      label: 'Evaluaciones pendientes',
      value: overview.pendingEvaluations,
      note: 'Requieren revisión',
      icon: Clock3,
      tone: 'amber',
    },
    {
      label: 'Alertas críticas',
      value: overview.criticalAlerts,
      note: 'Quality Gates con incidencias',
      icon: TriangleAlert,
      tone: 'red',
    },
  ];
  return (
    <div className="teacher-summary-grid">
      {cards.map(({ label, value, note, icon: Icon, tone }) => (
        <article key={label} className="teacher-card teacher-stat">
          <span className={`teacher-icon teacher-tone-${tone}`}>
            <Icon size={19} aria-hidden="true" />
          </span>
          <div>
            <h2>{label}</h2>
            <p className="teacher-stat-value">{value}</p>
            <p className="teacher-stat-note">{note}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
