import { ClipboardCheck, Info, ShieldCheck } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import '../styles/student-result.css';

export function StudentResultPage() {
  return (
    <section
      className="student-result"
      aria-labelledby="student-result-heading"
    >
      <header className="student-result-heading">
        <div>
          <p className="eyebrow">TU APRENDIZAJE</p>
          <h1 className="page-title" id="student-result-heading">
            Mi rúbrica
          </h1>
          <p>
            Conoce qué se evalúa, cuánto vale cada criterio y cómo se explica tu
            resultado.
          </p>
        </div>
        <span className="student-result-badge">Resultado pendiente</span>
      </header>
      <section
        className="student-result-panel student-result-summary"
        aria-labelledby="result-summary-heading"
      >
        <div>
          <h2 id="result-summary-heading">Resultado actual</h2>
          <p
            className="student-result-score"
            aria-label="Calificación pendiente"
          >
            —
          </p>
          <p className="student-result-muted">
            Escala pendiente de información
          </p>
        </div>
        <div className="student-result-reading">
          <h2>¿Cómo leer esta rúbrica?</h2>
          <p>
            Cuando estén disponibles los criterios, podrás seleccionar uno para
            conocer su puntaje, la evidencia utilizada y qué puedes mejorar.
          </p>
          <p className="student-result-muted">
            El progreso se mostrará junto con tu resultado.
          </p>
        </div>
        <div>
          <Button
            variant="outline"
            disabled
            aria-describedby="result-improve-help"
          >
            Ver cómo mejorar
          </Button>
          <p className="student-result-muted" id="result-improve-help">
            Requiere una evaluación disponible.
          </p>
        </div>
      </section>
      <div className="student-result-grid">
        <section
          className="student-result-panel student-result-criteria"
          aria-labelledby="result-criteria-heading"
        >
          <header>
            <h2 id="result-criteria-heading">Criterios de evaluación</h2>
            <p className="student-result-muted">
              Los criterios y su puntaje serán proporcionados por tu evaluación.
            </p>
          </header>
          <div className="student-result-empty">
            <span className="student-result-icon">
              <ClipboardCheck size={30} aria-hidden="true" />
            </span>
            <h3>Tu rúbrica aparecerá aquí</h3>
            <p>
              Podrás consultar qué se evalúa y cuánto aporta cada criterio a tu
              resultado.
            </p>
            <span className="student-result-badge">Información pendiente</span>
          </div>
        </section>
        <section
          className="student-result-panel student-result-detail"
          aria-labelledby="result-detail-heading"
        >
          <p className="eyebrow">CRITERIO SELECCIONADO</p>
          <h2 id="result-detail-heading">Detalle del criterio</h2>
          <p className="student-result-muted">
            Disponible cuando recibas los criterios de tu evaluación.
          </p>
          <dl className="student-result-points">
            {['Tu puntaje', 'Progreso'].map((label) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd aria-label="Información pendiente">—</dd>
              </div>
            ))}
          </dl>
          <section
            className="student-result-evidence"
            aria-labelledby="result-evidence-heading"
          >
            <h3 id="result-evidence-heading">
              <ShieldCheck size={17} aria-hidden="true" />
              Evidencia utilizada
            </h3>
            <p>
              Las métricas, reglas aplicadas y evidencias del criterio
              aparecerán aquí.
            </p>
            <span className="student-result-badge">
              Sin evidencia disponible
            </span>
          </section>
          <section
            className="student-result-guidance"
            aria-labelledby="result-guidance-heading"
          >
            <h3 id="result-guidance-heading">¿Qué puedes mejorar?</h3>
            <p>
              Las recomendaciones estarán disponibles junto con el resultado de
              tu evaluación.
            </p>
          </section>
          <Button
            variant="outline"
            disabled
            aria-describedby="result-evidence-help"
          >
            Ver evidencia completa
          </Button>
          <p className="student-result-muted" id="result-evidence-help">
            Requiere evidencia asociada al criterio.
          </p>
        </section>
      </div>
      <aside className="student-result-notice">
        <ShieldCheck size={20} aria-hidden="true" />
        <div>
          <h2>Comprende de dónde viene tu resultado</h2>
          <p>
            Cuando esté disponible, podrás consultar los criterios y la
            evidencia que sustentan cada puntaje.
          </p>
        </div>
      </aside>
      <p className="student-result-availability">
        <Info size={15} aria-hidden="true" />
        Tus resultados estarán disponibles cuando se conecte el servicio de
        evaluaciones.
      </p>
    </section>
  );
}
