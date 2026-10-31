import type {
  RubricCourse,
  RubricCriterion,
} from '@/features/rubrics/domain/rubric';
import type {
  RubricDto,
  StudentRubricDto,
} from '@/features/rubrics/infrastructure/rubric.dto';
export const rubricCourses: RubricCourse[] = [
  {
    id: 'software',
    name: 'Ingeniería de Software',
    expectedScore: 20,
    sections: [
      { id: '01', name: 'Sección 01' },
      { id: '02', name: 'Sección 02' },
    ],
  },
  {
    id: 'integrator',
    name: 'Proyecto Integrador II',
    expectedScore: 20,
    sections: [{ id: '01', name: 'Sección 01' }],
  },
  {
    id: 'quality',
    name: 'Calidad de Software',
    expectedScore: 20,
    sections: [{ id: '02', name: 'Sección 02' }],
  },
];
function levels(id: string, max: number, achieved: number) {
  return [
    {
      id: `${id}-4`,
      name: 'Excelente',
      description: 'Evidencia completa y consistente.',
      condition: 'Cumple todos los criterios descritos por el docente.',
      score: max,
    },
    {
      id: `${id}-3`,
      name: 'Logrado',
      description: 'Cumple los objetivos principales.',
      condition: 'Cumple los objetivos principales con mejoras pendientes.',
      score: achieved,
    },
  ];
}
export function rubricCriteria(): RubricCriterion[] {
  return [
    {
      id: 'code',
      name: 'Calidad del código',
      description: 'Código legible y sin errores críticos.',
      maxScore: 5,
      evidenceSource: 'quality-gate',
      evaluationType: 'automatic-with-review',
      levels: levels('code', 5, 4),
    },
    {
      id: 'coverage',
      name: 'Cobertura de pruebas',
      description: 'Pruebas automatizadas que cubren los casos principales.',
      maxScore: 5,
      evidenceSource: 'sonarqube',
      evaluationType: 'automatic-with-review',
      levels: [
        {
          id: 'coverage-4',
          name: 'Excelente',
          description: 'Cobertura de los escenarios principales.',
          condition: 'Cobertura mayor o igual a 80%',
          score: 5,
        },
        {
          id: 'coverage-3',
          name: 'Logrado',
          description: 'Cobertura suficiente con oportunidades de mejora.',
          condition: 'Cobertura entre 70% y 79%',
          score: 3,
        },
        {
          id: 'coverage-2',
          name: 'En proceso',
          description: 'Faltan escenarios por probar.',
          condition: 'Cobertura entre 60% y 69%',
          score: 2,
        },
        {
          id: 'coverage-1',
          name: 'Inicial',
          description: 'Requiere acompañamiento para ampliar las pruebas.',
          condition: 'Cobertura menor a 60%',
          score: 1,
        },
      ],
    },
    {
      id: 'maintainability',
      name: 'Mantenibilidad',
      description:
        'Complejidad y deuda técnica dentro de los límites definidos.',
      maxScore: 4,
      evidenceSource: 'sonarqube',
      evaluationType: 'automatic-with-review',
      levels: levels('maintainability', 4, 3),
    },
    {
      id: 'security',
      name: 'Seguridad',
      description: 'Ausencia de vulnerabilidades críticas.',
      maxScore: 2,
      evidenceSource: 'pipeline',
      evaluationType: 'automatic-with-review',
      levels: levels('security', 2, 1),
    },
    {
      id: 'contribution',
      name: 'Contribución individual',
      description: 'Participación verificable dentro del equipo.',
      maxScore: 4,
      evidenceSource: 'github',
      evaluationType: 'teacher-review',
      levels: levels('contribution', 4, 3.5),
    },
  ];
}
export function createRubricFixtures(): RubricDto[] {
  const first: RubricDto = {
    id: 'quality-rubric',
    name: 'Calidad de Software',
    description:
      'Rúbrica para evaluar calidad técnica, pruebas, seguridad y contribución individual.',
    courseId: 'software',
    sectionId: '01',
    expectedScore: 20,
    version: '1.0',
    criteria: rubricCriteria(),
    status: 'published',
    total_score: 20,
    updated_at: '2026-10-30T15:00:00Z',
  };
  return [
    first,
    {
      ...structuredClone(first),
      id: 'final-project',
      name: 'Evaluación de proyecto final',
      courseId: 'integrator',
      status: 'draft',
    },
    {
      ...structuredClone(first),
      id: 'cicd-rubric',
      name: 'Prácticas de CI/CD',
      courseId: 'quality',
      sectionId: '02',
      criteria: rubricCriteria()
        .slice(0, 4)
        .map((criterion, index) => ({
          ...criterion,
          id: `cicd-${index}`,
          maxScore: 5,
          levels: criterion.levels.map((level, position) => ({
            ...level,
            score: position === 0 ? 5 : level.score,
          })),
        })),
      status: 'published',
    },
    {
      ...structuredClone(first),
      id: 'archived-rubric',
      name: 'Rúbrica del semestre anterior',
      status: 'archived',
    },
  ];
}
export function createStudentRubricFixture(): StudentRubricDto {
  return {
    rubric: structuredClone(createRubricFixtures()[0]!),
    course_name: 'Ingeniería de Software — Sección 01',
    project_name: 'Campus Connect',
    review_status: 'Pendiente de revisión docente',
    score: 15.5,
    max_score: 20,
    results: [
      {
        criterionId: 'code',
        score: 4,
        maxScore: 5,
        percentage: 80,
        evidence: 'Quality Gate · Informe técnico de ejemplo',
        appliedRule: 'Cumple los objetivos principales con mejoras pendientes.',
        achievementLevel: 'Logrado',
        technicalResult:
          'Sin errores críticos; dos observaciones de legibilidad.',
        recommendation:
          'Simplifica los métodos extensos y documenta las decisiones del equipo.',
        evidenceDetails:
          'EVIDENCIA SIMULADA\nProyecto: Campus Connect\nInforme QG-184\nEstado técnico: aprobado con observaciones\nFecha: 30/10/2026, 10:00 Lima\nNo representa una consulta a un servicio real.',
      },
      {
        criterionId: 'coverage',
        score: 3,
        maxScore: 5,
        percentage: 60,
        evidence: 'SonarQube · Reporte de cobertura de ejemplo',
        appliedRule: 'Cobertura entre 70% y 79% = 3 puntos',
        achievementLevel: 'Logrado',
        technicalResult: 'Cobertura registrada: 72%',
        recommendation:
          'Agrega pruebas para ReservationService y BookAvailability para alcanzar el umbral de 80%.',
        evidenceDetails:
          'EVIDENCIA SIMULADA\nProyecto: Campus Connect\nPipeline: #184\nCobertura de líneas: 72%\nMódulos por reforzar: ReservationService, BookAvailability\nRegla de rúbrica v1.0: 70%–79% → Logrado → 3/5 puntos\nEl porcentaje de cumplimiento académico es 60%, distinto de la cobertura técnica de 72%.',
      },
      {
        criterionId: 'maintainability',
        score: 3,
        maxScore: 4,
        percentage: 75,
        evidence: 'SonarQube · Mantenibilidad de ejemplo',
        appliedRule: 'Cumple los objetivos principales con mejoras pendientes.',
        achievementLevel: 'Logrado',
        technicalResult:
          'Complejidad dentro de los límites; deuda técnica por revisar.',
        recommendation: 'Refactoriza los métodos con mayor complejidad.',
        evidenceDetails:
          'EVIDENCIA SIMULADA\nInforme MT-184\nDeuda técnica: observaciones no críticas\nResultado preliminar: 3/4\nPendiente de revisión docente.',
      },
      {
        criterionId: 'security',
        score: 2,
        maxScore: 2,
        percentage: 100,
        evidence: 'Pipeline CI/CD · Análisis de seguridad de ejemplo',
        appliedRule: 'Sin vulnerabilidades críticas en el análisis registrado.',
        achievementLevel: 'Excelente',
        technicalResult: '0 vulnerabilidades críticas registradas.',
        recommendation:
          'Mantén las dependencias actualizadas y revisa futuros avisos.',
        evidenceDetails:
          'EVIDENCIA SIMULADA\nPipeline #184\nVulnerabilidades críticas: 0\nNo constituye una garantía de ausencia de vulnerabilidades.',
      },
      {
        criterionId: 'contribution',
        score: 3.5,
        maxScore: 4,
        percentage: 87.5,
        evidence: 'GitHub / revisión docente · Muestra de contribuciones',
        appliedRule:
          'Participación verificable y revisión cualitativa del aporte.',
        achievementLevel: 'Logrado',
        technicalResult: 'Aportes documentados en el historial del equipo.',
        recommendation:
          'Explica las decisiones tomadas en tus siguientes revisiones.',
        evidenceDetails:
          'EVIDENCIA SIMULADA\nEquipo: Kernel\nFuente: historial de contribuciones de ejemplo\nLa cantidad de commits no determina por sí sola una calificación.',
      },
    ],
  };
}
