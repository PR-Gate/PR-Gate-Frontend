import { Activity, Info } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/shared/services/auth/auth-context';
import type { StudentOverviewState } from '../../domain/entities/student-overview.entity';
import { StudentSummaryCards } from '../components/student-summary-cards';
import { StudentProjectsOverview } from '../components/student-projects-overview';
import { StudentLatestEvaluation } from '../components/student-latest-evaluation';
import { StudentNextStep } from '../components/student-next-step';
import '../styles/student-dashboard.css';

const initialState: StudentOverviewState = { status: 'integration-pending' };

export default function StudentDashboardPage({
  state = initialState,
}: {
  state?: StudentOverviewState;
}) {
  const { user } = useAuth();
  const firstName = user?.name.trim().split(/\s+/)[0];
  const overview = state.status === 'available' ? state.overview : undefined;
  const today = new Date();
  return (
    <section
      className="student-dashboard"
      aria-labelledby="student-dashboard-heading"
    >
      <header className="student-page-heading">
        <div>
          <p className="eyebrow">
            <time
              dateTime={new Intl.DateTimeFormat('en-CA', {
                timeZone: 'America/Lima',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              }).format(today)}
            >
              {new Intl.DateTimeFormat('es-PE', {
                timeZone: 'America/Lima',
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              }).format(today)}
            </time>
          </p>
          <h1 id="student-dashboard-heading">
            Hola{firstName ? `, ${firstName}` : ''}
          </h1>
          <p>Tu progreso técnico, explicado con claridad.</p>
        </div>
        <div className="student-execution-action">
          <Button disabled aria-describedby="student-execution-help">
            <Activity size={16} aria-hidden="true" />
            Ver última ejecución
          </Button>
          <p className="student-action-help" id="student-execution-help">
            Sin ejecución disponible
          </p>
        </div>
      </header>
      <StudentSummaryCards overview={overview} />
      <div className="student-widget-grid">
        <StudentProjectsOverview overview={overview} />
        <StudentLatestEvaluation overview={overview} />
      </div>
      <StudentNextStep overview={overview} />
      {state.status === 'integration-pending' && (
        <p className="student-data-notice">
          <Info size={15} aria-hidden="true" />
          <span>
            Tu resumen estará disponible cuando se conecte la información
            académica.
          </span>
        </p>
      )}
    </section>
  );
}
