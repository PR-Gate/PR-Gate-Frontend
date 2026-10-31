import type { StudentRepository } from '../../domain/repositories/student.repository';
export class GetStudentContributionUseCase {
  constructor(private readonly repository: StudentRepository) {}
  execute(courseId: string, studentId: string, signal?: AbortSignal) {
    return this.repository.contribution(courseId, studentId, signal);
  }
}
