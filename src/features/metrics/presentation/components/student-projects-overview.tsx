import { Folder, FolderOpen } from 'lucide-react';
import { Link } from 'react-router';
import type { StudentOverview } from '../../domain/entities/student-overview.entity';
import { formatStudentValue } from '../utils/student-overview-format';

export function StudentProjectsOverview({
  overview,
}: {
  overview?: StudentOverview;
}) {
  const projects = overview?.projects;
  return (
    <section
      className="student-panel student-projects"
      aria-labelledby="student-projects-heading"
    >
      <header className="student-panel-heading">
        <div>
          <h2 id="student-projects-heading">Estado general de mis proyectos</h2>
          <p>El avance de tu trabajo, en un solo lugar.</p>
        </div>
        <Link to="/projects" className="student-text-link">
          Ver todos
        </Link>
      </header>
      {projects?.items.length ? (
        <ul className="student-project-list">
          {projects.items.map((project) => (
            <li key={project.id}>
              <span className="student-icon student-icon-blue">
                <Folder size={19} aria-hidden="true" />
              </span>
              <div className="student-project-name">
                <h3>{project.name}</h3>
                <p>{project.course}</p>
              </div>
              <span className="student-neutral-badge">
                {project.status ?? 'Estado pendiente'}
              </span>
              <div className="student-project-grade">
                <strong>{formatStudentValue(project.grade?.value)}</strong>
                <span>
                  {project.grade
                    ? `de ${formatStudentValue(project.grade.maximum)}`
                    : 'Sin nota'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="student-projects-empty">
          <span className="student-empty-icon">
            <FolderOpen size={28} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <h3>
            {projects ? 'Aún no tienes proyectos' : 'Tus proyectos, aquí'}
          </h3>
          <p>
            {projects
              ? 'Cuando tengas proyectos, podrás consultar su avance en este espacio.'
              : 'La información de tus proyectos estará disponible aquí.'}
          </p>
          <span className="student-neutral-badge">
            {projects ? 'Sin proyectos' : 'Información pendiente'}
          </span>
        </div>
      )}
    </section>
  );
}
