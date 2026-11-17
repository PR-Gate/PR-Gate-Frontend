import {
  Check,
  ClipboardCheck,
  Clock3,
  Info,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import '../styles/teacher-tests.css';

function ReviewNotice() {
  return (
    <aside className="teacher-tests-notice">
      <ShieldCheck size={21} aria-hidden="true" />
      <div>
        <h2>La IA propone; el docente revisa</h2>
        <p>
          Contrasta la respuesta del alumno con la respuesta esperada y la
          evidencia. Podrás corregir el puntaje y justificar el ajuste antes de
          confirmar la evaluación.
        </p>
      </div>
    </aside>
  );
}

export function TeacherTestsPage() {
  return (
    <section className="teacher-tests" aria-labelledby="teacher-tests-heading">
      <header>
        <p className="eyebrow">SUPERVISIÓN DOCENTE</p>
        <h1 className="page-title" id="teacher-tests-heading">
          Tests y evaluaciones
        </h1>
        <p className="teacher-tests-subtitle">
          Revisa los tests generados por IA, sus respuestas esperadas y los
          resultados de tus estudiantes.
        </p>
      </header>
      <div className="teacher-tests-stats">
        {[
          { label: 'Tests publicados', icon: ClipboardCheck, tone: 'blue' },
          { label: 'Alumnos por responder', icon: Clock3, tone: 'amber' },
          { label: 'Respuestas por revisar', icon: Check, tone: 'green' },
        ].map(({ label, icon: Icon, tone }) => (
          <article
            className="teacher-tests-panel teacher-tests-stat"
            key={label}
          >
            <span className={`teacher-tests-icon teacher-tests-${tone}`}>
              <Icon size={21} aria-hidden="true" />
            </span>
            <div>
              <h2>{label}</h2>
              <p
                className="teacher-tests-value"
                aria-label="Información pendiente"
              >
                —
              </p>
              <p className="teacher-tests-help">Información pendiente</p>
            </div>
          </article>
        ))}
      </div>
      <section aria-labelledby="teacher-test-list-heading">
        <header className="teacher-tests-library-heading">
          <div>
            <h2 id="teacher-test-list-heading">Mis tests</h2>
            <p className="teacher-tests-help">
              Selecciona un test para revisar sus preguntas, respuestas y
              calificaciones.
            </p>
          </div>
          <div>
            <label
              className="teacher-tests-search"
              htmlFor="teacher-test-search"
            >
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Buscar test</span>
              <input
                id="teacher-test-search"
                type="search"
                placeholder="Buscar test"
                disabled
                aria-describedby="teacher-test-search-help"
              />
            </label>
            <p className="teacher-tests-help" id="teacher-test-search-help">
              Disponible cuando se carguen los tests.
            </p>
          </div>
        </header>
        <div className="teacher-tests-panel teacher-tests-empty">
          <span className="teacher-tests-icon teacher-tests-blue">
            <ClipboardCheck size={28} aria-hidden="true" />
          </span>
          <h3>Los tests generados por IA aparecerán aquí</h3>
          <p>
            Podrás consultar el curso, estado, participación y respuestas
            pendientes de revisión de cada test.
          </p>
          <span className="teacher-tests-badge">Pendiente de integración</span>
        </div>
      </section>
      <ReviewNotice />
      <p className="teacher-tests-availability">
        <Info size={15} aria-hidden="true" />
        Los tests y resultados estarán disponibles cuando se conecte el
        servicio.
      </p>
    </section>
  );
}

export function TeacherTestReviewPage() {
  return (
    <section
      className="teacher-tests"
      aria-labelledby="teacher-test-review-heading"
    >
      <Link className="teacher-tests-back" to="/teacher/evaluations">
        Volver a mis tests
      </Link>
      <header>
        <p className="eyebrow">REVISIÓN DE EVALUACIÓN</p>
        <h1 className="page-title" id="teacher-test-review-heading">
          Respuestas y resultados
        </h1>
        <p className="teacher-tests-subtitle">
          Compara las respuestas y revisa el puntaje sugerido por IA.
        </p>
      </header>
      <div className="teacher-tests-review-grid">
        <section className="teacher-tests-panel teacher-tests-review-panel">
          <h2>Estudiantes y entregas</h2>
          <label htmlFor="review-student" className="teacher-tests-field">
            Estudiante
            <select id="review-student" disabled>
              <option>Entregas pendientes de información</option>
            </select>
          </label>
          <label htmlFor="review-question" className="teacher-tests-field">
            Pregunta
            <select id="review-question" disabled>
              <option>Preguntas pendientes de información</option>
            </select>
          </label>
          <p className="teacher-tests-help">
            El estudiante, sus entregas y las preguntas se recibirán del
            servicio.
          </p>
        </section>
        <section className="teacher-tests-panel teacher-tests-review-panel">
          <h2>Comparación de respuestas</h2>
          {[
            'Pregunta del test',
            'Respuesta esperada y criterio de corrección',
            'Respuesta del estudiante',
            'Explicación y evidencia de la IA',
          ].map((label) => (
            <section className="teacher-tests-answer" key={label}>
              <h3>{label}</h3>
              <p>Información pendiente</p>
            </section>
          ))}
        </section>
      </div>
      <section
        className="teacher-tests-panel teacher-tests-review-panel"
        aria-labelledby="teacher-score-heading"
      >
        <h2 id="teacher-score-heading">Revisión manual del puntaje</h2>
        <dl className="teacher-tests-scores">
          {[
            'Puntaje sugerido por IA',
            'Puntaje máximo',
            'Puntaje confirmado por docente',
          ].map((label) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd aria-label="Información pendiente">—</dd>
            </div>
          ))}
        </dl>
        <form onSubmit={(event) => event.preventDefault()}>
          <label className="teacher-tests-field" htmlFor="teacher-score">
            Puntaje corregido
            <input
              id="teacher-score"
              type="number"
              disabled
              aria-describedby="score-help"
            />
          </label>
          <p className="teacher-tests-help" id="score-help">
            La escala y los límites se recibirán de la evaluación.
          </p>
          <label className="teacher-tests-field" htmlFor="teacher-score-reason">
            Justificación del ajuste
            <textarea
              id="teacher-score-reason"
              rows={3}
              disabled
              placeholder="Explica qué corriges y en qué evidencia te basas."
            />
          </label>
          <Button disabled aria-describedby="review-save-help">
            Guardar revisión docente
          </Button>
          <p className="teacher-tests-help" id="review-save-help">
            Disponible cuando exista una respuesta evaluada y se integre el
            guardado. No se ha registrado ningún cambio.
          </p>
        </form>
      </section>
      <ReviewNotice />
    </section>
  );
}
