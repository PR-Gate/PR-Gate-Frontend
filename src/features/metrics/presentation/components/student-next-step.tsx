import { Activity } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { StudentOverview } from '../../domain/entities/student-overview.entity';

export function StudentNextStep({ overview }: { overview?: StudentOverview }) {
  const recommendation = overview?.recommendation;
  return (
    <section
      className="student-panel student-next-step"
      aria-labelledby="student-next-step-heading"
    >
      <span className="student-icon student-icon-blue">
        <Activity size={21} aria-hidden="true" />
      </span>
      <div className="student-next-step-copy">
        <h2 id="student-next-step-heading">Siguiente paso recomendado</h2>
        <h3>
          {recommendation?.title ??
            'Cada evaluación, una oportunidad para mejorar'}
        </h3>
        <p id="student-recommendation-help">
          {recommendation?.description ??
            'Las recomendaciones estarán disponibles cuando tengas una evaluación.'}
        </p>
      </div>
      <div className="student-next-step-action">
        <Button disabled aria-describedby="student-recommendation-action-help">
          Ver cómo mejorar
        </Button>
        <p
          className="student-action-help"
          id="student-recommendation-action-help"
        >
          Orientación aún no disponible.
        </p>
      </div>
    </section>
  );
}
