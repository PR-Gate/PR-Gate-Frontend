import { Button } from '@/shared/components/ui/button';

export function EvaluationError({ retry }: { retry?: () => void }) {
  return <div className="evaluation-message evaluation-error" role="alert">
    <p>No pudimos completar la consulta de evaluación. Comprueba tu acceso e inténtalo nuevamente.</p>
    {retry && <Button variant="outline" onClick={retry}>Reintentar</Button>}
  </div>;
}
export function EvaluationEmpty({ children }: { children: React.ReactNode }) {
  return <div className="evaluation-message">{children}</div>;
}
export const evaluationStatus = (status: string) => ({
  PASSED: 'Cumple', FAILED: 'No cumple', NOT_EVALUABLE: 'Evidencia pendiente',
  PARTIAL: 'Evaluación parcial', COMPLETED: 'Evaluación completa', PENDING: 'Preparando',
  DELIVERED: 'En sincronización', APPLIED: 'Configurado', SUPERSEDED: 'Versión anterior',
  COLLECTED: 'Evidencia recopilada', UNAVAILABLE: 'Evidencia no disponible',
}[status] ?? status);
