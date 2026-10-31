import { ChevronRight, GitBranch } from 'lucide-react';
import { Link } from 'react-router';
import type { AttentionProject } from '../../domain/entities/teacher-overview.entity';
import { formatOverviewDate } from '../utils/overview-format';
export function ProjectsAttentionTable({
  projects,
  hasSearch,
}: {
  projects: readonly AttentionProject[];
  hasSearch: boolean;
}) {
  return (
    <article className="teacher-card teacher-attention">
      <div className="teacher-table-title">
        <div>
          <h2>Proyectos que requieren atención</h2>
          <p className="teacher-card-description">
            Priorizados por el servicio simulado
          </p>
        </div>
        <span className="teacher-status teacher-tone-amber">
          {projects.length} en esta lista
        </span>
      </div>
      {!projects.length ? (
        <p className="teacher-widget-empty">
          {hasSearch
            ? 'No hay coincidencias para tu búsqueda.'
            : 'No hay proyectos que requieran atención.'}
        </p>
      ) : (
        <div className="teacher-table-scroll">
          <table>
            <caption className="sr-only">
              Proyectos que requieren atención en el curso seleccionado
            </caption>
            <thead>
              <tr>
                {[
                  'Proyecto / equipo',
                  'Repositorio',
                  'Último commit',
                  'Pipeline',
                  'Quality Gate',
                  'Calificación',
                  'Detalle',
                ].map((title) => (
                  <th scope="col" key={title}>
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <th scope="row">
                    <Link to={`/projects/${project.id}`}>{project.name}</Link>
                    <small>{project.team}</small>
                  </th>
                  <td>
                    <span className="teacher-repo">
                      <GitBranch size={13} aria-hidden="true" />
                      {project.repository}
                    </span>
                  </td>
                  <td>
                    <time dateTime={project.lastCommit.toISOString()}>
                      {formatOverviewDate(project.lastCommit)}
                    </time>
                  </td>
                  <td>
                    <span
                      className={`teacher-status teacher-tone-${project.pipeline === 'success' ? 'green' : 'red'}`}
                    >
                      {project.pipeline === 'success'
                        ? '✓ Exitoso'
                        : '× Fallido'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`teacher-status teacher-tone-${project.qualityGate === 'passed' ? 'green' : project.qualityGate === 'failed' ? 'red' : 'amber'}`}
                    >
                      {project.qualityGate === 'passed'
                        ? '✓ Aprobado'
                        : project.qualityGate === 'failed'
                          ? '× Fallido'
                          : '◷ Pendiente'}
                    </span>
                  </td>
                  <td className="teacher-grade">
                    {project.grade === null
                      ? '—'
                      : project.grade.toLocaleString('es-PE', {
                          minimumFractionDigits: 1,
                        })}
                  </td>
                  <td>
                    <Link
                      className="teacher-detail-link"
                      to={`/projects/${project.id}`}
                      aria-label={`Ver ${project.name}`}
                    >
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
