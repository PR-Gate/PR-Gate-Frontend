import { useState } from 'react';
import { Link } from 'react-router';
import { Check, Clock3, GitBranch, X } from 'lucide-react';
import type { TeacherOverview } from '../../domain/entities/teacher-overview.entity';
import { formatOverviewDate } from '../utils/overview-format';
const icons = { pipeline: Check, gate: X, push: GitBranch, evaluation: Clock3 };
const tones = {
  pipeline: 'green',
  gate: 'red',
  push: 'blue',
  evaluation: 'amber',
};
export function RecentActivityList({
  activities,
}: {
  activities: TeacherOverview['activities'];
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <article className="teacher-card">
      <div className="teacher-card-heading">
        <h2>Actividad reciente</h2>
        {activities.length > 2 && (
          <button
            onClick={() => setExpanded((value) => !value)}
            className="teacher-text-button"
            aria-expanded={expanded}
          >
            {expanded ? 'Ver menos' : 'Ver todo'}
          </button>
        )}
      </div>
      <p className="teacher-card-description">
        Eventos de demostración · sin conexión en tiempo real
      </p>
      {!activities.length ? (
        <p className="teacher-widget-empty">No hay actividad en este curso.</p>
      ) : (
        <ul className="teacher-activity-list">
          {activities.slice(0, expanded ? undefined : 2).map((activity) => {
            const Icon = icons[activity.kind];
            return (
              <li key={activity.id}>
                <span
                  className={`teacher-icon teacher-tone-${tones[activity.kind]}`}
                >
                  <Icon size={16} aria-hidden="true" />
                </span>
                <div>
                  <Link to={`/projects/${activity.projectId}`}>
                    {activity.title}
                  </Link>
                  <p>{activity.detail}</p>
                  <time dateTime={activity.occurredAt.toISOString()}>
                    {formatOverviewDate(activity.occurredAt)}
                  </time>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
