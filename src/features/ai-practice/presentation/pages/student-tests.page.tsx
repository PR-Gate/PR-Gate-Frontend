import { Info } from 'lucide-react';
import type { StudentTestsState } from '../../domain/entities/student-tests.entity';
import { StudentTestSummary } from '../components/student-test-summary';
import { PendingStudentTests } from '../components/pending-student-tests';
import { CompletedStudentTests } from '../components/completed-student-tests';
import { StudentTestGuidance } from '../components/student-test-guidance';
import '../styles/student-tests.css';
import { LiveStudentTestsPage } from './live-student-tests.page';

const state: StudentTestsState = { status: 'integration-pending' };

export function StudentTestsPage({ demo = true }: { demo?: boolean }) {
  if (!demo) return <LiveStudentTestsPage />;
  return (
    <section
      className="student-tests"
      aria-labelledby="student-tests-heading"
      data-state={state.status}
    >
      <header className="student-tests-heading">
        <p className="eyebrow">REFUERZO PERSONALIZADO</p>
        <h1 id="student-tests-heading">Mis tests</h1>
        <p>
          Refuerza lo que necesitas mejorar en tu código con tests
          personalizados.
        </p>
      </header>
      <StudentTestSummary />
      <PendingStudentTests />
      <CompletedStudentTests />
      <StudentTestGuidance />
      <p className="student-tests-notice">
        <Info size={15} aria-hidden="true" />
        <span>
          Tus tests estarán disponibles cuando se conecte la información de tus
          evaluaciones.
        </span>
      </p>
    </section>
  );
}
