import type {
  AttentionProject,
  OverviewPeriod,
  TeacherOverview,
} from '../../domain/entities/teacher-overview.entity';
function csvCell(value: string | number | null) {
  const text = String(value ?? '');
  // Spreadsheet applications must not execute text supplied by an external API.
  return `"${(/^[=+@\-\t\r\n]/.test(text) ? `'${text}` : text).replaceAll('"', '""')}"`;
}
export function serializeOverviewCsv(
  overview: TeacherOverview,
  projects: readonly AttentionProject[],
  period: OverviewPeriod,
): string {
  const rows: (string | number | null)[][] = [
    ['PR Gate · DEMOSTRACIÓN · Datos simulados'],
    ['Curso', overview.course.name, 'Sección', overview.course.section],
    ['Periodo (días)', period],
    ['Fecha de los datos (UTC)', overview.generatedAt.toISOString()],
    ['Cursos activos', overview.activeCourses],
    ['Proyectos evaluados', overview.evaluatedProjects],
    ['Evaluaciones pendientes', overview.pendingEvaluations],
    ['Alertas críticas', overview.criticalAlerts],
    ['Tiempo estimado ahorrado (minutos)', overview.savedMinutes],
    ['Estudiantes activos', overview.activeStudents],
    ['Estudiantes del curso', overview.totalStudents],
    [],
    ['Estado', 'Cantidad', 'Porcentaje'],
    ...overview.distribution.map((item) => [
      item.status,
      item.count,
      item.percentage,
    ]),
    [],
    [
      'Proyecto',
      'Equipo',
      'Repositorio',
      'Último commit (UTC)',
      'Pipeline',
      'Quality Gate',
      'Calificación',
    ],
    ...projects.map((project) => [
      project.name,
      project.team,
      project.repository,
      project.lastCommit.toISOString(),
      project.pipeline,
      project.qualityGate,
      project.grade,
    ]),
    [],
    ['Actividad', 'Detalle', 'Fecha (UTC)'],
    ...overview.activities.map((item) => [
      item.title,
      item.detail,
      item.occurredAt.toISOString(),
    ]),
  ];
  return '\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}
export function downloadOverviewCsv(
  overview: TeacherOverview,
  projects: readonly AttentionProject[],
  period: OverviewPeriod,
) {
  const blob = new Blob([serializeOverviewCsv(overview, projects, period)], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pr-gate-demo-${overview.course.id}-${period}dias.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
