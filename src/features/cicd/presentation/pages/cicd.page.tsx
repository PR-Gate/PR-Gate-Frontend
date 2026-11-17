import { CircleDashed, GitBranch, Info, ShieldCheck } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import '../styles/cicd.css';

function Notice() {
  return (
    <aside className="cicd-notice">
      <ShieldCheck size={22} aria-hidden="true" />
      <div>
        <h2>Tu código permanece bajo tu control</h2>
        <p>
          Consulta métricas y evidencias de tu proyecto. Esta vista no realiza
          cambios en tu repositorio.
        </p>
      </div>
    </aside>
  );
}
function PendingNotice() {
  return (
    <p className="cicd-data-notice">
      <Info size={15} aria-hidden="true" />
      Información pendiente de integración con el servicio.
    </p>
  );
}
function Navigation({ quality = false }: { quality?: boolean }) {
  const { projectId: routeProjectId } = useParams();
  const [searchParams] = useSearchParams();
  const projectId = routeProjectId ?? searchParams.get('projectId');
  const context = projectId
    ? `?projectId=${encodeURIComponent(projectId)}`
    : '';
  return (
    <nav className="cicd-navigation" aria-label="Navegación del proyecto">
      <Link to="/projects">Proyectos</Link>
      <span aria-hidden="true">/</span>
      {quality ? (
        <>
          <Link to={`/pipelines${context}`}>Ejecuciones CI/CD</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Quality Gate</span>
        </>
      ) : (
        <span aria-current="page">Ejecuciones CI/CD</span>
      )}
    </nav>
  );
}
export function PipelinesPage() {
  const { projectId: routeProjectId } = useParams();
  const [searchParams] = useSearchParams();
  const projectId = routeProjectId ?? searchParams.get('projectId');
  const context = projectId
    ? `?projectId=${encodeURIComponent(projectId)}`
    : '';
  return (
    <section className="cicd-page" aria-labelledby="pipeline-heading">
      <Navigation />
      <header>
        <p className="eyebrow">SEGUIMIENTO DEL PROYECTO</p>
        <h1 id="pipeline-heading" className="page-title">
          Ejecución CI/CD
        </h1>
        <p className="cicd-subtitle">
          Consulta las etapas del pipeline y comprende cómo se obtiene tu
          evaluación.
        </p>
      </header>
      <div className="cicd-tabs">
        <span>
          <GitBranch size={16} aria-hidden="true" />
          Ejecuciones CI/CD
        </span>
        <Button variant="ghost" disabled aria-describedby="activity-help">
          Mi actividad
        </Button>
      </div>
      <p className="cicd-help" id="activity-help">
        El historial de actividad estará disponible al integrar el servicio.
      </p>
      <dl className="cicd-panel cicd-summary">
        {['Commit y rama', 'Iniciado', 'Duración', 'Estado de ejecución'].map(
          (label) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd aria-label="Información pendiente">—</dd>
            </div>
          ),
        )}
      </dl>
      <section
        className="cicd-panel cicd-timeline"
        aria-labelledby="stages-heading"
      >
        <h2 id="stages-heading">Etapas de la ejecución</h2>
        <p className="cicd-help">
          La secuencia real y sus estados se recibirán desde el backend.
        </p>
        <ol>
          {[
            ['Commit', 'Referencia del cambio que inicia la ejecución.'],
            ['Build', 'Compilación y preparación del proyecto.'],
            ['Tests', 'Resultados de las pruebas automatizadas.'],
            ['SonarQube', 'Análisis técnico y métricas de código.'],
            [
              'Quality Gate',
              'Comparación con las reglas de calidad aplicables.',
            ],
            ['Evaluación', 'Resultado académico y estado de revisión.'],
          ].map(([name, description]) => (
            <li key={name}>
              <span className="cicd-stage-icon">
                <CircleDashed size={20} aria-hidden="true" />
              </span>
              <div className="cicd-stage-copy">
                <div className="cicd-stage-title">
                  <h3>{name}</h3>
                  <span className="cicd-badge">Sin información</span>
                </div>
                <p>{description}</p>
                <span className="cicd-help">Pendiente de integración</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled
                aria-label={`Ver detalles de ${name}`}
                aria-describedby="details-help"
              >
                Ver detalles
              </Button>
            </li>
          ))}
        </ol>
        <p className="cicd-help" id="details-help">
          Los detalles se habilitarán cuando exista una ejecución disponible.
        </p>
      </section>
      <aside className="cicd-notice">
        <ShieldCheck size={22} aria-hidden="true" />
        <div>
          <h2>¿Cómo se genera la evaluación?</h2>
          <p>
            Las métricas se comparan con reglas institucionales. Los resultados
            y el estado de revisión aparecerán cuando estén disponibles.
          </p>
        </div>
      </aside>
      <div className="cicd-footer">
        <Button asChild variant="outline">
          <Link to={`/quality-gate${context}`}>
            Ver resultado del Quality Gate
          </Link>
        </Button>
      </div>
      <PendingNotice />
    </section>
  );
}
export function QualityGatesPage() {
  const { projectId: routeProjectId } = useParams();
  const [searchParams] = useSearchParams();
  const projectId = routeProjectId ?? searchParams.get('projectId');
  const context = projectId
    ? `?projectId=${encodeURIComponent(projectId)}`
    : '';
  return (
    <section className="cicd-page" aria-labelledby="gate-heading">
      <Navigation quality />
      <header className="cicd-heading">
        <div>
          <p className="eyebrow">CALIDAD DEL CÓDIGO</p>
          <h1 id="gate-heading" className="page-title">
            Resultado del Quality Gate
          </h1>
          <p className="cicd-subtitle">
            Comprende tus métricas y las reglas de calidad de tu proyecto.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to={`/pipelines${context}`}>Volver a la ejecución</Link>
        </Button>
      </header>
      <section
        className="cicd-panel cicd-result"
        aria-labelledby="result-heading"
      >
        <span className="cicd-result-icon">
          <CircleDashed size={28} aria-hidden="true" />
        </span>
        <div className="cicd-result-copy">
          <p className="eyebrow">RESULTADO</p>
          <h2 id="result-heading">Resultado pendiente</h2>
          <p>
            El estado del Quality Gate se mostrará cuando exista una evaluación
            disponible.
          </p>
        </div>
        <div>
          <Button disabled aria-describedby="correction-help">
            Ver cómo corregir
          </Button>
          <p id="correction-help" className="cicd-help">
            Requiere un resultado disponible.
          </p>
        </div>
      </section>
      <div className="cicd-metric-grid" aria-label="Métricas del Quality Gate">
        {['Cobertura', 'Deuda técnica', 'Duplicidad', 'Vulnerabilidades'].map(
          (label) => (
            <article className="cicd-panel cicd-metric" key={label}>
              <div className="cicd-metric-label">
                <CircleDashed size={18} aria-hidden="true" />
                <h2>{label}</h2>
              </div>
              <p className="cicd-value" aria-label="Información pendiente">
                —
              </p>
              <p className="cicd-help">Umbral pendiente de información</p>
              <span className="cicd-badge">Sin evaluar</span>
            </article>
          ),
        )}
      </div>
      <section
        className="cicd-panel cicd-rules"
        aria-labelledby="rules-heading"
      >
        <h2 id="rules-heading">Reglas y criterios de evaluación</h2>
        <p className="cicd-help">
          Comprende qué condiciones se cumplen y cuáles requieren corrección.
        </p>
        <div className="cicd-empty">
          <ShieldCheck size={30} aria-hidden="true" />
          <h3>Las reglas evaluadas aparecerán aquí</h3>
          <p>
            Se mostrarán el valor observado, el umbral, el resultado y la
            versión de la regla proporcionados por el servicio.
          </p>
          <span className="cicd-badge">Información pendiente</span>
        </div>
      </section>
      <Notice />
      <PendingNotice />
    </section>
  );
}
