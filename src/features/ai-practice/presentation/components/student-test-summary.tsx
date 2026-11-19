import { Check, ClipboardCheck, Clock3 } from 'lucide-react';

export function StudentTestSummary({ values }: { values?: [string, string, string] }) {
  return (
    <div
      className="student-tests-summary"
      aria-label="Indicadores de mis tests"
    >
      {[
        { label: 'Tests pendientes', icon: Clock3, tone: 'amber' },
        { label: 'Tests completados', icon: Check, tone: 'green' },
        { label: 'Promedio de tests', icon: ClipboardCheck, tone: 'blue' },
      ].map(({ label, icon: Icon, tone }, index) => (
        <article className="student-tests-panel student-tests-stat" key={label}>
          <span className={`student-tests-icon student-tests-${tone}`}>
            <Icon size={20} aria-hidden="true" />
          </span>
          <div>
            <h2>{label}</h2>
            <p
              className="student-tests-value"
              aria-label={values ? undefined : 'Información pendiente'}
            >
              {values?.[index] ?? '—'}
            </p>
            {!values && <p className="student-tests-muted">Información pendiente</p>}
          </div>
        </article>
      ))}
    </div>
  );
}
