import type {
  OverviewPeriod,
  TeacherOverview,
} from '../entities/teacher-overview.entity';
export interface TeacherOverviewRepository {
  getOverview(
    courseId: string,
    period: OverviewPeriod,
    signal?: AbortSignal,
  ): Promise<TeacherOverview>;
}
