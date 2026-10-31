import type { HttpClient } from '@/shared/services/http/http-client';
import type { OverviewPeriod } from '../../domain/entities/teacher-overview.entity';
import { teacherOverviewSchema } from '../dto/teacher-overview-response.dto';
// Provisional MSW-only contract; replace this boundary after backend agreement.
export class MetricsApiService {
  constructor(private readonly http: HttpClient) {}
  async getTeacherOverview(
    courseId: string,
    period: OverviewPeriod,
    signal?: AbortSignal,
  ) {
    const params = new URLSearchParams({ course: courseId, period });
    return teacherOverviewSchema.parse(
      await this.http.get<unknown>(`/demo/teacher-overview?${params}`, signal),
    );
  }
}
