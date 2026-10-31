import type { Rubric, StudentRubric } from '../domain/rubric';
import type { RubricDto, StudentRubricDto } from './rubric.dto';
export function mapRubric(dto: RubricDto): Rubric {
  const { total_score, updated_at, ...rest } = dto;
  return { ...rest, totalScore: total_score, updatedAt: updated_at };
}
export function mapStudentRubric(dto: StudentRubricDto): StudentRubric {
  return {
    rubric: mapRubric(dto.rubric),
    courseName: dto.course_name,
    projectName: dto.project_name,
    reviewStatus: dto.review_status,
    score: dto.score,
    maxScore: dto.max_score,
    results: dto.results,
  };
}
