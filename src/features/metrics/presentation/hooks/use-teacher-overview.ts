import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { GetTeacherOverviewUseCase } from '../../application/use-cases/get-teacher-overview.use-case';
import type { OverviewPeriod } from '../../domain/entities/teacher-overview.entity';
export const TeacherOverviewContext =
  createContext<GetTeacherOverviewUseCase | null>(null);
export const overviewKeys = {
  summary: (course: string, period: OverviewPeriod) =>
    ['teacher-overview', course, period] as const,
};
export function useTeacherOverview(course: string, period: OverviewPeriod) {
  const useCase = useContext(TeacherOverviewContext);
  if (!useCase) throw new Error('TeacherOverviewContext es obligatorio');
  return useQuery({
    queryKey: overviewKeys.summary(course, period),
    queryFn: ({ signal }) => useCase.execute(course, period, signal),
  });
}
