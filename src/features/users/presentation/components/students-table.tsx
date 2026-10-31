import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import type { CourseStudent } from '../../domain/entities/student.entity';
import { StudentStatusBadge } from './student-status-badge';
export function StudentsTable({
  students,
  courseId,
  search,
}: {
  students: readonly CourseStudent[];
  courseId: string;
  search: string;
}) {
  return (
    <div className="students-table-scroll">
      <table className="students-table">
        <caption className="sr-only">
          Estudiantes del curso seleccionado y sus señales orientativas de
          participación
        </caption>
        <thead>
          <tr>
            {[
              'Estudiante',
              'Equipo',
              'Proyecto',
              'Participación',
              'Commits',
              'Estado',
              'Detalle',
            ].map((label) => (
              <th scope="col" key={label}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const target = `/teacher/students/${encodeURIComponent(student.id)}?${new URLSearchParams({ course: courseId, ...(search ? { q: search } : {}) })}`;
            return (
              <tr key={student.id}>
                <th scope="row">
                  <Link to={target} className="student-identity">
                    <span className="student-avatar" aria-hidden="true">
                      {student.name
                        .split(' ')
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join('')}
                    </span>
                    <span>
                      <strong>{student.name}</strong>
                      <small>{student.email}</small>
                    </span>
                  </Link>
                </th>
                <td data-label="Equipo">{student.team}</td>
                <td data-label="Proyecto">
                  <Link
                    to={`/projects/${encodeURIComponent(student.projectId)}`}
                  >
                    {student.projectName}
                  </Link>
                </td>
                <td data-label="Participación">
                  <div
                    className={`student-participation student-participation-${student.status}`}
                  >
                    <span>{student.participation}%</span>
                    <progress
                      aria-label={`Participación de ${student.name}`}
                      value={student.participation}
                      max={100}
                    />
                  </div>
                </td>
                <td data-label="Commits">{student.commits}</td>
                <td data-label="Estado">
                  <StudentStatusBadge status={student.status} />
                </td>
                <td data-label="Detalle">
                  <Link
                    className="student-open-detail"
                    to={target}
                    aria-label={`Revisar contribución de ${student.name}`}
                  >
                    <ChevronRight size={15} aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
