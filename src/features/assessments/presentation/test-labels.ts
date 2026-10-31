import type { ResponseStatus, TestStatus } from '../domain/assessment';
export const testStatusLabels: Record<TestStatus, string> = {
  draft: 'Borrador',
  scheduled: 'Programado',
  published: 'Publicado',
  finished: 'Finalizado',
};
export const responseLabels: Record<ResponseStatus, string> = {
  not_started: 'Sin iniciar',
  in_progress: 'En progreso',
  submitted: 'Entregado',
  needs_review: 'Requiere revisión',
  graded: 'Calificado',
};
export function testDate(iso: string) {
  return iso
    ? new Intl.DateTimeFormat('es-PE', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/Lima',
      }).format(new Date(iso))
    : 'Sin definir';
}
