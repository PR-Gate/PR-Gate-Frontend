import { ChartNoAxesColumnIncreasing, ShieldCheck } from 'lucide-react';
import { LoginPipelineSteps } from './login-pipeline-steps';

export function LoginBrandPanel() {
  return (
    <section
      className="login-brand-panel"
      aria-labelledby="login-brand-heading"
    >
      <div className="login-brand-mark">
        <span className="login-brand-symbol">
          <ChartNoAxesColumnIncreasing size={24} aria-hidden="true" />
        </span>
        <span>
          <strong>Orquestador</strong>
          <span className="login-brand-subtitle">ACADÉMICO</span>
        </span>
      </div>
      <div className="login-brand-content">
        <span className="login-brand-tag">Evaluación técnica trazable</span>
        <h2 id="login-brand-heading">
          Evidencia técnica que impulsa el aprendizaje.
        </h2>
        <p className="login-brand-description">
          Orquesta CI/CD, Quality Gates y rúbricas institucionales en una
          experiencia clara, objetiva y formativa.
        </p>
        <LoginPipelineSteps />
        <p className="login-brand-note">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>
            Las calificaciones se generan con reglas deterministas y métricas
            objetivas. La decisión final siempre es docente.
          </span>
        </p>
      </div>
      <div className="login-brand-rings" aria-hidden="true" />
    </section>
  );
}
