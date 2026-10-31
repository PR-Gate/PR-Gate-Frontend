import type { HttpClient } from '@/shared/services/http/http-client';
import {
  studentContributionSchema,
  studentRosterSchema,
} from '../dto/student-response.dto';
// Provisional MSW contracts. No production endpoint is assumed.
export class StudentApiService {
  constructor(private readonly http: HttpClient) {}
  async roster(courseId: string, signal?: AbortSignal) {
    return studentRosterSchema.parse(
      await this.http.get<unknown>(
        `/demo/students?${new URLSearchParams({ course: courseId })}`,
        signal,
      ),
    );
  }
  async contribution(
    courseId: string,
    studentId: string,
    signal?: AbortSignal,
  ) {
    return studentContributionSchema.parse(
      await this.http.get<unknown>(
        `/demo/students/${encodeURIComponent(studentId)}?${new URLSearchParams({ course: courseId })}`,
        signal,
      ),
    );
  }
}
