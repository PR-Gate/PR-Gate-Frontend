import type { Assessment } from '../domain/assessment';
import type { AssessmentDto } from './assessment.dto';
export function mapAssessment(dto: AssessmentDto): Assessment {
  const {
    course_name,
    assigned_count,
    responded_count,
    pending_review,
    pending_responses,
    total_points,
    ...rest
  } = dto;
  return {
    ...rest,
    courseName: course_name,
    assignedCount: assigned_count,
    respondedCount: responded_count,
    pendingReview: pending_review,
    pendingResponses: pending_responses,
    totalPoints: total_points,
  };
}
