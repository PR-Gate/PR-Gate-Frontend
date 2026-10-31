import type { StudentRepository } from '../../domain/repositories/student.repository';
export class GetCourseStudentsUseCase {
  constructor(private readonly repository: StudentRepository) {}
  execute(courseId: string, signal?: AbortSignal) {
    return this.repository.roster(courseId, signal);
  }
}
