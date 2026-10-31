import type {
  TeacherOverview,
  ReviewStatus,
} from '../../domain/entities/teacher-overview.entity';
const labels: Record<ReviewStatus, { title: string; color: string }> = {
  approved: { title: 'Aprobado', color: '#15855d' },
  review: { title: 'En revisión', color: '#265dce' },
  correction: { title: 'Requiere corrección', color: '#d99b28' },
  failed: { title: 'Fallido', color: '#cf4449' },
};
export function ProjectStatusChart({
  overview,
}: {
  overview: TeacherOverview;
}) {
  return (
    <article className="teacher-card">
      <h2>Estado de proyectos</h2>
      <p className="teacher-card-description">Distribución del curso activo</p>
      {overview.totalProjects === 0 ? (
        <p className="teacher-widget-empty">
          Aún no hay proyectos evaluados en este curso.
        </p>
      ) : (
        <div className="teacher-chart-content">
          <svg
            viewBox="0 0 180 180"
            role="img"
            aria-label={`${overview.totalProjects} proyectos. Distribución detallada en la leyenda.`}
          >
            <circle
              cx="90"
              cy="90"
              r="66"
              fill="none"
              stroke="#eff3f9"
              strokeWidth="23"
            />
            {overview.distribution.map((item, index) => (
              <circle
                key={item.status}
                cx="90"
                cy="90"
                r="66"
                fill="none"
                stroke={labels[item.status].color}
                strokeWidth="23"
                pathLength="100"
                strokeDasharray={`${item.percentage} ${100 - item.percentage}`}
                strokeDashoffset={
                  -overview.distribution
                    .slice(0, index)
                    .reduce((total, segment) => total + segment.percentage, 0)
                }
                transform="rotate(-90 90 90)"
              />
            ))}
            <text
              x="90"
              y="90"
              textAnchor="middle"
              className="teacher-chart-total"
            >
              {overview.totalProjects}
            </text>
            <text
              x="90"
              y="109"
              textAnchor="middle"
              className="teacher-chart-caption"
            >
              proyectos
            </text>
          </svg>
          <ul aria-label="Distribución de proyectos">
            {overview.distribution.map((item) => (
              <li key={item.status}>
                <span>
                  <i style={{ background: labels[item.status].color }} />
                  {labels[item.status].title}
                </span>
                <strong>
                  {item.count} ·{' '}
                  {item.percentage.toLocaleString('es-PE', {
                    maximumFractionDigits: 1,
                  })}
                  %
                </strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
