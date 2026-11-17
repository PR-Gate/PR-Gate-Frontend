import {
  BookOpen,
  Download,
  Info,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import '../styles/teacher-students.css';

export function TeacherStudentsPage() {
  return (
    <section
      className="teacher-students"
      aria-labelledby="teacher-students-heading"
    >
      <header className="teacher-students-heading">
        <div>
          <p className="eyebrow">SEGUIMIENTO DEL CURSO</p>
          <h1 className="page-title" id="teacher-students-heading">
            Estudiantes
          </h1>
          <p>
            Selecciona un curso y luego un estudiante para revisar su
            contribución.
          </p>
        </div>
        <div>
          <Button
            variant="outline"
            disabled
            aria-describedby="student-export-help"
          >
            <Download size={16} aria-hidden="true" />
            Exportar lista
          </Button>
          <p className="teacher-students-muted" id="student-export-help">
            Disponible cuando haya estudiantes para exportar.
          </p>
        </div>
      </header>
      <section
        className="teacher-students-panel teacher-students-course"
        aria-labelledby="student-course-heading"
      >
        <div>
          <h2 id="student-course-heading">Curso seleccionado</h2>
          <p>Información pendiente</p>
          <span className="teacher-students-muted">
            Sección y ciclo pendientes
          </span>
        </div>
        <div className="teacher-students-course-control">
          <BookOpen size={22} aria-hidden="true" />
          <label htmlFor="teacher-student-course">
            Seleccionar curso
            <select
              id="teacher-student-course"
              disabled
              aria-describedby="student-course-help"
            >
              <option>Sin cursos disponibles para seleccionar</option>
            </select>
          </label>
        </div>
        <p className="teacher-students-muted" id="student-course-help">
          Tus cursos aparecerán cuando se conecte la información académica.
        </p>
      </section>
      <section
        className="teacher-students-toolbar"
        aria-label="Indicadores y búsqueda"
      >
        <dl>
          {[
            'Estudiantes en este curso',
            'Actividad regular',
            'Requieren revisión',
          ].map((label) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd aria-label="Información pendiente">—</dd>
            </div>
          ))}
        </dl>
        <div className="teacher-students-search">
          <label htmlFor="teacher-student-search">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Buscar estudiante</span>
            <input
              id="teacher-student-search"
              type="search"
              placeholder="Buscar estudiante"
              disabled
              aria-describedby="student-search-help"
            />
          </label>
          <p id="student-search-help" className="teacher-students-muted">
            Selecciona un curso disponible para buscar estudiantes.
          </p>
        </div>
      </section>
      <section
        className="teacher-students-panel teacher-students-list"
        aria-labelledby="teacher-student-list-heading"
      >
        <header>
          <div>
            <h2 id="teacher-student-list-heading">Lista de estudiantes</h2>
            <p className="teacher-students-muted">
              Consulta su actividad y evidencia para acompañar su aprendizaje.
            </p>
          </div>
          <span className="teacher-students-badge">Curso pendiente</span>
        </header>
        <div className="teacher-students-table-scroll">
          <table>
            <caption className="sr-only">
              Estudiantes del curso seleccionado
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
                ].map((label) => (
                  <th scope="col" key={label}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6}>
                  <div className="teacher-students-empty">
                    <span className="teacher-students-icon">
                      <Users size={30} aria-hidden="true" />
                    </span>
                    <h3>Los estudiantes del curso aparecerán aquí</h3>
                    <p>
                      Cuando se conecte el servicio, podrás seleccionar un curso
                      y consultar la contribución de cada estudiante.
                    </p>
                    <span className="teacher-students-badge">
                      Información pendiente
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <aside className="teacher-students-guidance">
        <ShieldCheck size={20} aria-hidden="true" />
        <div>
          <h2>La participación es una señal orientativa</h2>
          <p>
            Los datos técnicos ayudan a identificar estudiantes que podrían
            necesitar acompañamiento. Revisa siempre la evidencia antes de tomar
            una decisión académica.
          </p>
        </div>
      </aside>
      <p className="teacher-students-notice">
        <Info size={15} aria-hidden="true" />
        El listado y sus indicadores estarán disponibles cuando se integre el
        servicio.
      </p>
    </section>
  );
}
