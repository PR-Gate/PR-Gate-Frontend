import { ClipboardList, Sparkles } from 'lucide-react';

export function PendingStudentTests() {
  return (
    <section aria-labelledby="pending-tests-heading">
      <header className="student-tests-section-heading">
        <h2 id="pending-tests-heading">Pendientes</h2>
        <p>Actividades para reforzar lo que necesitas mejorar en tu código.</p>
      </header>
      <div className="student-tests-panel student-tests-empty student-tests-pending">
        <span className="student-tests-icon student-tests-amber">
          <ClipboardList size={25} aria-hidden="true" />
        </span>
        <div className="student-tests-empty-copy">
          <h3>Tus tests personalizados aparecerán aquí</h3>
          <p>
            La IA propondrá actividades a partir de los fallos detectados en tu
            código para ayudarte a comprenderlos y mejorar.
          </p>
          <span className="student-tests-badge">
            <Sparkles size={12} aria-hidden="true" />
            Refuerzo personalizado
          </span>
        </div>
      </div>
    </section>
  );
}
