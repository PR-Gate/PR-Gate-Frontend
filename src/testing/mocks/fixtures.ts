import type { ProjectResponseDto } from '@/features/projects/infrastructure/dto/project-response.dto';
export const projectFixtures: ProjectResponseDto[] = [
  {
    id: 'campus-connect',
    name: 'Campus Connect',
    description:
      'Una comunidad digital para conectar estudiantes, actividades y oportunidades dentro del campus.',
    course_name: 'Ingeniería de Software II',
    status: 'ACTIVE',
    repository_url: 'https://github.com/example/campus-connect',
    member_count: 4,
    updated_at: '2026-10-28T15:00:00Z',
  },
  {
    id: 'biblioteca-digital',
    name: 'Biblioteca Digital',
    description:
      'Gestión de préstamos y catálogo de recursos académicos con una experiencia accesible para todos.',
    course_name: 'Arquitectura de Software',
    status: 'ACTIVE',
    repository_url: 'https://github.com/example/biblioteca-digital',
    member_count: 5,
    updated_at: '2026-10-27T15:00:00Z',
  },
  {
    id: 'eco-track',
    name: 'EcoTrack',
    description:
      'Seguimiento de iniciativas sostenibles y participación de la comunidad universitaria.',
    course_name: 'Ingeniería de Software II',
    status: 'ACTIVE',
    repository_url: 'https://github.com/example/eco-track',
    member_count: 3,
    updated_at: '2026-10-26T15:00:00Z',
  },
  {
    id: 'study-flow',
    name: 'StudyFlow',
    description:
      'Planificación colaborativa de sesiones de estudio y seguimiento de objetivos del equipo.',
    course_name: 'Desarrollo Web',
    status: 'ACTIVE',
    repository_url: null,
    member_count: 4,
    updated_at: '2026-10-25T15:00:00Z',
  },
  {
    id: 'reserva-lab',
    name: 'ReservaLab',
    description:
      'Reserva de laboratorios y equipos para optimizar los espacios de trabajo de la universidad.',
    course_name: 'Arquitectura de Software',
    status: 'ACTIVE',
    repository_url: null,
    member_count: 4,
    updated_at: '2026-10-24T15:00:00Z',
  },
  {
    id: 'mentor-hub',
    name: 'MentorHub',
    description:
      'Un punto de encuentro entre mentores y estudiantes para compartir conocimiento y experiencias.',
    course_name: 'Proyecto Integrador',
    status: 'ARCHIVED',
    repository_url: null,
    member_count: 5,
    updated_at: '2026-09-30T15:00:00Z',
  },
];
