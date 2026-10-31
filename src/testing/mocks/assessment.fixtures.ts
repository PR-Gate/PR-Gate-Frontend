import type { AssessmentDto } from '@/features/assessments/infrastructure/assessment.dto';
import type {
  AssessmentCatalog,
  Question,
} from '@/features/assessments/domain/assessment';
export const savedTestQuestions: Question[] = [
  {
    id: 'q-gate',
    kind: 'multiple',
    prompt: '¿Qué propósito tiene un Quality Gate?',
    options: [
      'Verificar criterios de calidad',
      'Reemplazar al docente',
      'Eliminar las pruebas',
    ],
    correctAnswer: '0',
    points: 2,
    feedback:
      'Un Quality Gate verifica los criterios técnicos definidos para el proyecto.',
  },
  {
    id: 'q-coverage',
    kind: 'boolean',
    prompt: 'Una cobertura alta garantiza por sí sola que no existen errores.',
    options: ['Verdadero', 'Falso'],
    correctAnswer: '1',
    points: 1,
    feedback:
      'La cobertura es una evidencia, no una garantía de ausencia de errores.',
  },
  {
    id: 'q-open',
    kind: 'open',
    prompt: 'Explica cómo usarías las métricas para mejorar tu proyecto.',
    options: [],
    correctAnswer: '',
    points: 3,
    feedback: '',
  },
];
export const testCatalog: AssessmentCatalog = {
  courses: [
    {
      id: 'software',
      name: 'Ingeniería de Software',
      section: '01',
      teams: [
        { id: 'kernel', name: 'Kernel' },
        { id: 'orbita', name: 'Órbita' },
      ],
      students: [
        { id: 's1', name: 'Juan Pérez', teamId: 'kernel' },
        { id: 's2', name: 'Lucía Ramos', teamId: 'kernel' },
        { id: 's3', name: 'Diego López', teamId: 'orbita' },
        { id: 's4', name: 'Ana Torres', teamId: 'orbita' },
        { id: 's5', name: 'Mateo Ruiz', teamId: 'kernel' },
      ],
    },
    {
      id: 'architecture',
      name: 'Arquitectura de Software',
      section: '02',
      teams: [{ id: 'lambda', name: 'Lambda' }],
      students: [
        { id: 's6', name: 'Sofía Medina', teamId: 'lambda' },
        { id: 's7', name: 'Luis Campos', teamId: 'lambda' },
      ],
    },
  ],
  savedQuestions: savedTestQuestions,
};
export function createAssessmentFixtures(now = new Date()): AssessmentDto[] {
  const date = (days: number) =>
    new Date(now.getTime() + days * 86400000).toISOString();
  const base: AssessmentDto = {
    id: 'quality-gates',
    title: 'Quality Gates y métricas de código',
    courseId: 'software',
    course_name: 'Ingeniería de Software',
    section: '01',
    durationMinutes: 45,
    instructions: 'Lee cada pregunta con atención. Tendrás un solo intento.',
    questions: structuredClone(savedTestQuestions),
    assignment: { mode: 'all', ids: [] },
    opensAt: date(-2),
    closesAt: date(7),
    status: 'published',
    assigned_count: 5,
    responded_count: 3,
    pending_responses: 2,
    pending_review: 2,
    total_points: 6,
    participants: testCatalog.courses[0]!.students.map((student, index) => ({
      id: student.id,
      name: student.name,
      status: (
        [
          'not_started',
          'in_progress',
          'needs_review',
          'graded',
          'submitted',
        ] as const
      )[index]!,
      submittedAt: index > 1 ? date(-1) : null,
      score: index === 3 ? 5 : null,
      answers:
        index > 1
          ? savedTestQuestions.map((question) => ({
              questionId: question.id,
              value:
                question.kind === 'open'
                  ? 'Revisaría la cobertura y los fallos junto con el equipo para decidir qué mejorar.'
                  : question.correctAnswer,
              score:
                index === 3
                  ? question.points - (question.kind === 'open' ? 1 : 0)
                  : question.kind === 'open'
                    ? null
                    : question.points,
              feedback: index === 3 ? 'Revisión docente completada.' : '',
            }))
          : [],
    })),
    results: {
      average: 5,
      participation: 60,
      difficultQuestions: [
        {
          label: 'Métricas y mejora del proyecto',
          detail: 'Pregunta abierta: requiere revisión docente.',
        },
      ],
      distribution: [
        { label: '0–2 puntos', count: 0 },
        { label: 'Más de 2–4 puntos', count: 0 },
        { label: 'Más de 4–6 puntos', count: 1 },
      ],
      support: [
        {
          name: 'Lucía Ramos',
          reason:
            'Respuesta pendiente · ofrece acompañamiento para completar el test.',
        },
      ],
    },
  };
  return [
    base,
    {
      ...structuredClone(base),
      id: 'draft-test',
      title: 'Repaso de integración continua',
      status: 'draft',
      opensAt: '',
      closesAt: '',
      participants: [],
      assigned_count: 0,
      responded_count: 0,
      pending_responses: 0,
      pending_review: 0,
      results: {
        average: null,
        participation: 0,
        difficultQuestions: [],
        distribution: [],
        support: [],
      },
    },
    {
      ...structuredClone(base),
      id: 'scheduled-test',
      title: 'Práctica de revisión de código',
      status: 'scheduled',
      opensAt: date(2),
      closesAt: date(9),
      participants: base.participants.map((p) => ({
        ...p,
        status: 'not_started',
        score: null,
        submittedAt: null,
        answers: [],
      })),
      responded_count: 0,
      pending_responses: 5,
      pending_review: 0,
      results: {
        average: null,
        participation: 0,
        difficultQuestions: [],
        distribution: [],
        support: [],
      },
    },
    {
      ...structuredClone(base),
      id: 'finished-test',
      title: 'Fundamentos de pruebas de software',
      status: 'finished',
      opensAt: date(-10),
      closesAt: date(-2),
    },
  ];
}
