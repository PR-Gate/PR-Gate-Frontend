import type { TeacherOverview } from '../../domain/entities/teacher-overview.entity';
import type { TeacherOverviewResponseDto } from '../dto/teacher-overview-response.dto';
export function mapTeacherOverview(
  dto: TeacherOverviewResponseDto,
): TeacherOverview {
  return {
    course: dto.course,
    courses: dto.courses,
    generatedAt: new Date(dto.generated_at),
    activeCourses: dto.active_courses,
    evaluatedProjects: dto.evaluated_projects,
    pendingEvaluations: dto.pending_evaluations,
    criticalAlerts: dto.critical_alerts,
    savedMinutes: dto.saved_minutes,
    activeStudents: dto.active_students,
    totalStudents: dto.total_students,
    totalProjects: dto.total_projects,
    distribution: dto.distribution,
    activities: dto.activities.map((item) => ({
      id: item.id,
      kind: item.kind,
      title: item.title,
      detail: item.detail,
      occurredAt: new Date(item.occurred_at),
      projectId: item.project_id,
    })),
    projects: dto.projects.map((item) => ({
      id: item.id,
      name: item.name,
      team: item.team,
      repository: item.repository,
      lastCommit: new Date(item.last_commit),
      pipeline: item.pipeline,
      qualityGate: item.quality_gate,
      grade: item.grade,
    })),
    students: dto.students,
  };
}
