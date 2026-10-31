import type {
  EvidenceSource,
  EvaluationType,
  RubricStatus,
} from '../domain/rubric';
export const sourceLabels: Record<
  EvidenceSource,
  { name: string; explanation: string }
> = {
  sonarqube: {
    name: 'SonarQube',
    explanation:
      'Utiliza métricas verificadas de cobertura, duplicidad, deuda técnica y seguridad.',
  },
  'quality-gate': {
    name: 'Quality Gate',
    explanation:
      'Relaciona el criterio con los resultados de las reglas técnicas del proyecto.',
  },
  github: {
    name: 'GitHub',
    explanation:
      'Consulta evidencias de cambios y revisiones. La cantidad de commits no determina una nota.',
  },
  gitlab: {
    name: 'GitLab',
    explanation:
      'Relaciona cambios y revisiones del repositorio con la evidencia del equipo.',
  },
  pipeline: {
    name: 'Pipeline CI/CD',
    explanation:
      'Utiliza ejecuciones, pruebas y reportes registrados por el pipeline.',
  },
  'academic-test': {
    name: 'Test académico',
    explanation:
      'Relaciona respuestas de una prueba con los objetivos de aprendizaje.',
  },
  'teacher-review': {
    name: 'Revisión docente',
    explanation:
      'El docente revisa la evidencia y registra su decisión académica.',
  },
  manual: {
    name: 'Evidencia manual',
    explanation:
      'Permite documentar entregables o evidencias revisadas por el docente.',
  },
};
export const evaluationLabels: Record<EvaluationType, string> = {
  automatic: 'Regla automática',
  'teacher-review': 'Revisión docente',
  'automatic-with-review': 'Regla automática con revisión docente',
};
export const statusLabels: Record<RubricStatus, string> = {
  draft: 'Borrador',
  published: 'Publicada',
  archived: 'Archivada',
};
export const evaluationNotice =
  'Las reglas automáticas calculan un resultado preliminar. La decisión académica final permanece bajo control del docente.';
export function rubricDate(iso: string) {
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeZone: 'America/Lima',
  }).format(new Date(iso));
}
export function numericValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}
