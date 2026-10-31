import type {
  StudentContribution,
  StudentRoster,
} from '../entities/student.entity';
export interface StudentRepository {
  roster(courseId: string, signal?: AbortSignal): Promise<StudentRoster>;
  contribution(
    courseId: string,
    studentId: string,
    signal?: AbortSignal,
  ): Promise<StudentContribution>;
}
