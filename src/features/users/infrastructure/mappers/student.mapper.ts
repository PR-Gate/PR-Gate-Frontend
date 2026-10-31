import type {
  CourseStudent,
  StudentContribution,
  StudentCourse,
  StudentRoster,
} from '../../domain/entities/student.entity';
import type {
  CourseStudentDto,
  StudentContributionDto,
  StudentCourseDto,
  StudentRosterDto,
} from '../dto/student-response.dto';
export function mapStudentCourse(dto: StudentCourseDto): StudentCourse {
  const { student_count, ...rest } = dto;
  return { ...rest, studentCount: student_count };
}
export function mapCourseStudent(dto: CourseStudentDto): CourseStudent {
  const { project_id, project_name, ...rest } = dto;
  return { ...rest, projectId: project_id, projectName: project_name };
}
export function mapStudentRoster(dto: StudentRosterDto): StudentRoster {
  return {
    course: mapStudentCourse(dto.course),
    courses: dto.courses.map(mapStudentCourse),
    students: dto.students.map(mapCourseStudent),
    total: dto.summary.total,
    regularActivity: dto.summary.regular_activity,
    needsReview: dto.summary.needs_review,
    updatedAt: dto.updated_at,
  };
}
export function mapStudentContribution(
  dto: StudentContributionDto,
): StudentContribution {
  return {
    student: mapCourseStudent(dto.student),
    course: mapStudentCourse(dto.course),
    period: dto.period,
    reviewedChanges: dto.reviewed_changes,
    evidence: dto.evidence.map(({ recorded_at, ...rest }) => ({
      ...rest,
      recordedAt: recorded_at,
    })),
    guidance: dto.guidance,
    updatedAt: dto.updated_at,
  };
}
