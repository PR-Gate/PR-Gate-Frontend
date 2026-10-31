import type {
  CourseStudentDto,
  StudentContributionDto,
  StudentCourseDto,
  StudentRosterDto,
} from '@/features/users/infrastructure/dto/student-response.dto';
export const studentCourses: StudentCourseDto[] = [
  {
    id: 'software',
    name: 'Ingeniería de Software',
    section: '01',
    term: 'Ciclo 2026-II',
    student_count: 5,
  },
  {
    id: 'quality',
    name: 'Calidad de Software',
    section: '02',
    term: 'Ciclo 2026-II',
    student_count: 4,
  },
  {
    id: 'integrator',
    name: 'Proyecto Integrador II',
    section: '01',
    term: 'Ciclo 2026-II',
    student_count: 3,
  },
];
const base: CourseStudentDto[] = [
  {
    id: 's1',
    name: 'Juan Pérez',
    email: 'juan.perez@universidad.example',
    team: 'Equipo Kernel',
    project_id: 'campus-connect',
    project_name: 'Campus Connect',
    participation: 78,
    commits: 26,
    status: 'up_to_date',
  },
  {
    id: 's2',
    name: 'Lucía Ramos',
    email: 'lucia.ramos@universidad.example',
    team: 'Equipo Kernel',
    project_id: 'campus-connect',
    project_name: 'Campus Connect',
    participation: 54,
    commits: 14,
    status: 'review',
  },
  {
    id: 's3',
    name: 'Diego López',
    email: 'diego.lopez@universidad.example',
    team: 'Equipo Órbita',
    project_id: 'eco-track',
    project_name: 'EcoTrack',
    participation: 31,
    commits: 8,
    status: 'support',
  },
  {
    id: 's4',
    name: 'Ana Torres',
    email: 'ana.torres@universidad.example',
    team: 'Equipo Órbita',
    project_id: 'eco-track',
    project_name: 'EcoTrack',
    participation: 69,
    commits: 21,
    status: 'up_to_date',
  },
  {
    id: 's5',
    name: 'Mateo Ruiz',
    email: 'mateo.ruiz@universidad.example',
    team: 'Equipo Kernel',
    project_id: 'study-flow',
    project_name: 'StudyFlow',
    participation: 72,
    commits: 23,
    status: 'up_to_date',
  },
];
export function createStudentRoster(courseId = 'software'): StudentRosterDto {
  const course =
    studentCourses.find((course) => course.id === courseId) ??
    studentCourses[0]!;
  const students = structuredClone(
    course.id === 'software'
      ? base
      : course.id === 'quality'
        ? base.slice(0, 4).map((student) => ({
            ...student,
            team: 'Equipo Lambda',
            project_id: 'biblioteca-digital',
            project_name: 'Biblioteca Digital',
          }))
        : base.slice(2).map((student) => ({
            ...student,
            team: 'Equipo Integrador',
            project_id: 'mentor-hub',
            project_name: 'MentorHub',
          })),
  );
  return {
    course,
    courses: structuredClone(studentCourses),
    students,
    summary: {
      total: course.student_count,
      regular_activity:
        course.id === 'software' ? 3 : course.id === 'quality' ? 2 : 2,
      needs_review: course.id === 'integrator' ? 1 : 2,
    },
    updated_at: '2026-10-30T15:00:00Z',
  };
}
export function createStudentContribution(
  courseId: string,
  studentId: string,
): StudentContributionDto | null {
  const roster = createStudentRoster(courseId);
  const student = roster.students.find((student) => student.id === studentId);
  if (!student) return null;
  return {
    student,
    course: roster.course,
    period: 'Últimos 30 días · muestra de demostración',
    reviewed_changes: student.id === 's3' ? 2 : 7,
    evidence: [
      {
        id: `${courseId}-${studentId}-commits`,
        title: 'Historial de cambios del proyecto',
        description: `${student.commits} commits registrados en la muestra. Este conteo no determina por sí solo una calificación.`,
        recorded_at: '2026-10-30T14:00:00Z',
      },
      {
        id: `${courseId}-${studentId}-review`,
        title: 'Evidencia de colaboración',
        description:
          'Muestra de participación en revisiones y conversaciones del equipo. Requiere interpretación del docente y no representa una consulta real a GitHub.',
        recorded_at: '2026-10-29T18:00:00Z',
      },
    ],
    guidance:
      student.status === 'up_to_date'
        ? 'Revisa la calidad de los aportes y conversa con el estudiante sobre su aprendizaje.'
        : 'Revisa las evidencias y conversa con el estudiante para identificar si necesita acompañamiento. No tomes una decisión académica únicamente con estos indicadores.',
    updated_at: roster.updated_at,
  };
}
