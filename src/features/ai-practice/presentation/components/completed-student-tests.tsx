import { ListChecks } from 'lucide-react';

export function CompletedStudentTests() {
  return (
    <section aria-labelledby="completed-tests-heading">
      <header className="student-tests-section-heading">
        <h2 id="completed-tests-heading">Completados</h2>
        <p>Resultados y retroalimentación para seguir aprendiendo.</p>
      </header>
      <div className="student-tests-panel student-tests-empty">
        <span className="student-tests-icon student-tests-green">
          <ListChecks size={25} aria-hidden="true" />
        </span>
        <div className="student-tests-empty-copy">
          <h3>Tu aprendizaje también queda registrado</h3>
          <p>
            Aquí podrás revisar tus resultados y lo que aprendiste, con
            explicaciones que te ayuden a avanzar.
          </p>
          <span className="student-tests-muted">
            Resultados pendientes de información
          </span>
        </div>
      </div>
    </section>
  );
}
