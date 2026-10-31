import type { TeacherOverviewRepository } from '../../domain/repositories/teacher-overview.repository';
import type { OverviewPeriod } from '../../domain/entities/teacher-overview.entity';
import type { MetricsApiService } from '../services/metrics-api.service';
import { mapTeacherOverview } from '../mappers/teacher-overview.mapper';
export class TeacherOverviewRepositoryImpl implements TeacherOverviewRepository {
  constructor(private readonly api: MetricsApiService) {}
  async getOverview(
    courseId: string,
    period: OverviewPeriod,
    signal?: AbortSignal,
  ) {
    return mapTeacherOverview(
      await this.api.getTeacherOverview(courseId, period, signal),
    );
  }
}
