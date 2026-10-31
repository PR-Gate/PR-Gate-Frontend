import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { GetCourseStudentsUseCase } from '../../application/use-cases/get-course-students.use-case';
import type { GetStudentContributionUseCase } from '../../application/use-cases/get-student-contribution.use-case';
export interface StudentDependencies {
  roster: GetCourseStudentsUseCase;
  contribution: GetStudentContributionUseCase;
}
export const StudentContext = createContext<StudentDependencies | null>(null);
function useStudentCases() {
  const value = useContext(StudentContext);
  if (!value) throw new Error('StudentContext es obligatorio');
  return value;
}
export const studentKeys = {
  roster: (course: string) => ['students', 'roster', course] as const,
  detail: (course: string, id: string) =>
    ['students', 'detail', course, id] as const,
};
export function useStudents(course: string) {
  const cases = useStudentCases();
  return useQuery({
    queryKey: studentKeys.roster(course),
    queryFn: ({ signal }) => cases.roster.execute(course, signal),
  });
}
export function useStudentContribution(course: string, id: string) {
  const cases = useStudentCases();
  return useQuery({
    queryKey: studentKeys.detail(course, id),
    queryFn: ({ signal }) => cases.contribution.execute(course, id, signal),
    enabled: Boolean(id),
  });
}
