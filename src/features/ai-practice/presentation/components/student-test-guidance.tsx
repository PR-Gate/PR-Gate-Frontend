import { ShieldCheck } from 'lucide-react';

export function StudentTestGuidance() {
  return (
    <aside
      className="student-tests-guidance"
      aria-labelledby="student-test-guidance-heading"
    >
      <ShieldCheck size={20} aria-hidden="true" />
      <div>
        <h2 id="student-test-guidance-heading">Antes de comenzar</h2>
        <p>
          Lee las instrucciones de cada test, revisa su duración y asegúrate de
          contar con una conexión estable.
        </p>
      </div>
    </aside>
  );
}
