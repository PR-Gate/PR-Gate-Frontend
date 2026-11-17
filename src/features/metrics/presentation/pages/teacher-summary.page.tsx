import {
  BookOpen,
  Check,
  Clock3,
  Download,
  Folder,
  Info,
  ShieldAlert,
  Timer,
  Activity,
} from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/shared/services/auth/auth-context';
import '../styles/teacher-summary.css';

export function TeacherSummaryPage() {
  const { user } = useAuth();
  const name = user?.name.trim().split(/\s+/)[0];
  return (
    <section
      className="teacher-summary"
      aria-labelledby="teacher-summary-heading"
    >
      <header className="teacher-summary-heading">
        <div>
          <p className="eyebrow">
            {new Intl.DateTimeFormat('es-PE', {
              timeZone: 'America/Lima',
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }).format(new Date())}
          </p>
          <h1 className="page-title" id="teacher-summary-heading">
            Hola{name ? `, ${name}` : ''}
          </h1>
          <p>Esto es lo que requiere tu atención hoy.</p>
        </div>
        <div className="teacher-summary-actions">
          <div>
            <Button
              variant="outline"
              disabled
              aria-describedby="teacher-export-help"
            >
              <Download size={16} aria-hidden="true" />
              Exportar reporte
            </Button>
            <p id="teacher-export-help">
              Disponible cuando haya datos del curso.
            </p>
          </div>
          <Button asChild>
            <Link to="/projects">
              <Folder size={16} aria-hidden="true" />
              Revisar proyectos
            </Link>
          </Button>
        </div>
      </header>
      <div className="teacher-summary-stats" aria-label="Indicadores docentes">
        {[
          { label: 'Cursos activos', icon: BookOpen, tone: 'blue' },
          { label: 'Proyectos evaluados', icon: Check, tone: 'green' },
          { label: 'Evaluaciones pendientes', icon: Clock3, tone: 'amber' },
          { label: 'Alertas críticas', icon: ShieldAlert, tone: 'red' },
        ].map(({ label, icon: Icon, tone }) => (
          <article
            className="teacher-summary-panel teacher-summary-stat"
            key={label}
          >
            <span className={`teacher-summary-icon teacher-summary-${tone}`}>
              <Icon size={20} aria-hidden="true" />
            </span>
            <div>
              <h2>{label}</h2>
              <p
                className="teacher-summary-value"
                aria-label="Información pendiente"
              >
                —
              </p>
              <p className="teacher-summary-muted">Información pendiente</p>
            </div>
          </article>
        ))}
      </div>
      <section
        className="teacher-summary-strip"
        aria-label="Tiempo y participación"
      >
        <Timer size={23} aria-hidden="true" />
        <div>
          <h2>Tiempo estimado ahorrado este mes</h2>
          <p aria-label="Tiempo pendiente">—</p>
        </div>
        <span className="teacher-summary-strip-help">
          Estimación pendiente de información
        </span>
        <div className="teacher-summary-participation">
          <h2>Estudiantes activos</h2>
          <p aria-label="Estudiantes activos pendientes">—</p>
        </div>
      </section>
      <div className="teacher-summary-widgets">
        <section
          className="teacher-summary-panel teacher-summary-distribution"
          aria-labelledby="teacher-project-status-heading"
        >
          <header>
            <h2 id="teacher-project-status-heading">Estado de proyectos</h2>
            <p className="teacher-summary-muted">
              La distribución se mostrará cuando esté disponible la información
              del curso.
            </p>
          </header>
          <div className="teacher-summary-chart-content">
            <div
              className="teacher-summary-chart"
              aria-label="Distribución pendiente de información"
            >
              <strong>—</strong>
              <span>proyectos</span>
            </div>
            <dl>
              {[
                'Aprobado',
                'En revisión',
                'Requiere corrección',
                'Fallido',
              ].map((label, index) => (
                <div key={label}>
                  <dt>
                    <span
                      className={`teacher-summary-dot teacher-summary-dot-${index}`}
                    />
                    {label}
                  </dt>
                  <dd aria-label="Información pendiente">—</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
        <section
          className="teacher-summary-panel teacher-summary-activity"
          aria-labelledby="teacher-activity-heading"
        >
          <header>
            <h2 id="teacher-activity-heading">Actividad reciente</h2>
            <p className="teacher-summary-muted">
              Ejecuciones, evaluaciones y cambios de tus proyectos.
            </p>
          </header>
          <div className="teacher-summary-empty">
            <span className="teacher-summary-icon teacher-summary-blue">
              <Activity size={24} aria-hidden="true" />
            </span>
            <h3>La actividad aparecerá aquí</h3>
            <p>
              Podrás consultar los eventos del curso cuando se conecte el
              servicio.
            </p>
          </div>
        </section>
      </div>
      <section
        className="teacher-summary-panel teacher-summary-attention"
        aria-labelledby="teacher-attention-heading"
      >
        <header>
          <div>
            <h2 id="teacher-attention-heading">
              Proyectos que requieren atención
            </h2>
            <p className="teacher-summary-muted">
              Estados y evidencias para orientar la revisión.
            </p>
          </div>
          <span className="teacher-summary-badge">Información pendiente</span>
        </header>
        <div className="teacher-summary-table-scroll">
          <table>
            <caption className="sr-only">
              Proyectos pendientes de revisión
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
                  <div className="teacher-summary-empty">
                    <h3>
                      Los proyectos que necesiten revisión aparecerán aquí
                    </h3>
                    <p>
                      Su prioridad, estado y calificación serán proporcionados
                      por el servicio.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <p className="teacher-summary-notice">
        <Info size={15} aria-hidden="true" />
        El resumen estará disponible cuando se conecte la información académica.
      </p>
    </section>
  );
}
