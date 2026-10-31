import type { TeacherOverviewResponseDto } from '@/features/metrics/infrastructure/dto/teacher-overview-response.dto';
export const academicCourses = [
  { id: 'software', name: 'Ingeniería de Software II', section: '01' },
  { id: 'architecture', name: 'Arquitectura de Software', section: '02' },
  { id: 'web', name: 'Desarrollo Web', section: '01' },
];
export function createTeacherOverviewFixture(
  courseId = 'software',
  period = '30',
): TeacherOverviewResponseDto {
  const course =
    academicCourses.find((item) => item.id === courseId) ?? academicCourses[0]!;
  const software = course.id === 'software';
  const projects: TeacherOverviewResponseDto['projects'] = software
    ? [
        {
          id: 'campus-connect',
          name: 'Campus Connect',
          team: 'Kernel',
          repository: 'GitHub',
          last_commit: '2026-10-30T14:36:00Z',
          pipeline: 'success',
          quality_gate: 'failed',
          grade: 14.8,
        },
        {
          id: 'eco-track',
          name: 'EcoTrack',
          team: 'Órbita',
          repository: 'GitHub',
          last_commit: '2026-10-30T14:00:00Z',
          pipeline: 'failed',
          quality_gate: 'pending',
          grade: null,
        },
      ]
    : course.id === 'architecture'
      ? [
          {
            id: 'biblioteca-digital',
            name: 'Biblioteca Digital',
            team: 'Lambda',
            repository: 'GitHub',
            last_commit: '2026-10-30T13:00:00Z',
            pipeline: 'success',
            quality_gate: 'pending',
            grade: null,
          },
          {
            id: 'reserva-lab',
            name: 'ReservaLab',
            team: 'Delta',
            repository: 'Sin repositorio',
            last_commit: '2026-10-29T18:00:00Z',
            pipeline: 'failed',
            quality_gate: 'failed',
            grade: 12,
          },
        ]
      : [];
  return {
    course,
    courses: academicCourses,
    generated_at: '2026-10-30T15:00:00Z',
    active_courses: 3,
    evaluated_projects:
      course.id === 'web' ? 0 : period === '7' ? 8 : software ? 24 : 16,
    pending_evaluations: course.id === 'web' ? 0 : software ? 7 : 4,
    critical_alerts: software ? 3 : course.id === 'web' ? 0 : 1,
    saved_minutes: course.id === 'web' ? 0 : period === '7' ? 320 : 1120,
    active_students: software ? 86 : course.id === 'web' ? 0 : 42,
    total_students: software ? 92 : course.id === 'web' ? 0 : 48,
    total_projects: course.id === 'web' ? 0 : software ? 32 : 20,
    distribution:
      course.id === 'web'
        ? []
        : software
          ? [
              { status: 'approved', count: 18, percentage: 56.25 },
              { status: 'review', count: 7, percentage: 21.875 },
              { status: 'correction', count: 4, percentage: 12.5 },
              { status: 'failed', count: 3, percentage: 9.375 },
            ]
          : [
              { status: 'approved', count: 12, percentage: 60 },
              { status: 'review', count: 4, percentage: 20 },
              { status: 'correction', count: 3, percentage: 15 },
              { status: 'failed', count: 1, percentage: 5 },
            ],
    projects,
    activities: projects.flatMap((project, index) => [
      {
        id: `${course.id}-${index}`,
        kind: index === 0 ? ('pipeline' as const) : ('gate' as const),
        title:
          index === 0
            ? 'Pipeline #184 finalizado'
            : 'Quality Gate requiere revisión',
        detail: `${project.name} · ${project.team}`,
        occurred_at: project.last_commit,
        project_id: project.id,
      },
      {
        id: `${course.id}-${index}-extra`,
        kind: index === 0 ? ('push' as const) : ('evaluation' as const),
        title:
          index === 0
            ? 'Nuevo push de Juan Pérez'
            : 'Evaluación lista para revisión',
        detail: `${project.name} · ${project.team}`,
        occurred_at: project.last_commit,
        project_id: project.id,
      },
    ]),
    students:
      course.id === 'web'
        ? []
        : [
            {
              id: 's1',
              name: 'Juan Pérez',
              team: software ? 'Kernel' : 'Lambda',
              active: true,
            },
            {
              id: 's2',
              name: 'Lucía Ramos',
              team: software ? 'Órbita' : 'Delta',
              active: true,
            },
            {
              id: 's3',
              name: 'Diego López',
              team: software ? 'Kernel' : 'Lambda',
              active: false,
            },
          ],
  };
}
