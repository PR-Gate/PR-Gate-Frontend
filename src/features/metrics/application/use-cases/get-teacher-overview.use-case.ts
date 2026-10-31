import type { TeacherOverviewRepository } from '../../domain/repositories/teacher-overview.repository';
import type { OverviewPeriod } from '../../domain/entities/teacher-overview.entity';
export class GetTeacherOverviewUseCase {
  constructor(private readonly repository: TeacherOverviewRepository) {}
  execute(courseId: string, period: OverviewPeriod, signal?: AbortSignal) {
    return this.repository.getOverview(courseId, period, signal);
  }
}
