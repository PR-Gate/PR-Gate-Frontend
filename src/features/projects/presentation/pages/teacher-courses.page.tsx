import { BookOpen, Clock3, Info } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import '../styles/teacher-courses.css';

export function TeacherCoursesPage() {
  return (
    <section
      className="teacher-courses"
      aria-labelledby="teacher-courses-heading"
    >
      <header className="teacher-courses-heading">
        <div>
          <p className="eyebrow">DOCENCIA</p>
          <h1 className="page-title" id="teacher-courses-heading">
            Mis cursos
          </h1>
          <p>Gestiona cursos, equipos y proyectos académicos.</p>
        </div>
        <div>
          <Button disabled aria-describedby="create-course-help">
            <BookOpen size={16} aria-hidden="true" />
            Crear curso
          </Button>
          <p className="teacher-courses-help" id="create-course-help">
            Disponible al integrar la gestión de cursos.
          </p>
        </div>
      </header>
      <section
        className="teacher-courses-panel"
        aria-labelledby="teacher-course-list-heading"
      >
        <header>
          <h2 id="teacher-course-list-heading">Tus cursos</h2>
          <p className="teacher-courses-help">
            Consulta las secciones, estudiantes, equipos y proyectos de cada
            curso.
          </p>
        </header>
        <div className="teacher-courses-empty">
          <span className="teacher-courses-icon">
            <BookOpen size={32} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <h3>Tus cursos aparecerán aquí</h3>
          <p>
            Cuando se conecte la información académica, podrás consultar los
            cursos que tienes a cargo y acceder a su detalle.
          </p>
          <span className="teacher-courses-badge">
            <Clock3 size={13} aria-hidden="true" />
            Información pendiente
          </span>
        </div>
      </section>
      <p className="teacher-courses-notice">
        <Info size={15} aria-hidden="true" />
        El listado estará disponible cuando se integre el servicio de cursos.
      </p>
    </section>
  );
}
