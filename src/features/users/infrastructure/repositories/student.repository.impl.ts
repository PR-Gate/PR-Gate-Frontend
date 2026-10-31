import type { StudentRepository } from '../../domain/repositories/student.repository';
import type { StudentApiService } from '../services/student-api.service';
import {
  mapStudentContribution,
  mapStudentRoster,
} from '../mappers/student.mapper';
export class StudentRepositoryImpl implements StudentRepository {
  constructor(private readonly api: StudentApiService) {}
  async roster(courseId: string, signal?: AbortSignal) {
    return mapStudentRoster(await this.api.roster(courseId, signal));
  }
  async contribution(
    courseId: string,
    studentId: string,
    signal?: AbortSignal,
  ) {
    return mapStudentContribution(
      await this.api.contribution(courseId, studentId, signal),
    );
  }
}
