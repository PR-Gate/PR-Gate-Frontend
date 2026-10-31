import type { ProjectsDependencies } from '@/features/projects/presentation/hooks/projects-context';
import type { AuthSessionService } from '@/shared/services/auth/auth-session.service';
import type { GetTeacherOverviewUseCase } from '@/features/metrics/application/use-cases/get-teacher-overview.use-case';
import type { AssessmentDependencies } from '@/features/assessments/presentation/hooks/use-assessments';
import type { RubricDependencies } from '@/features/rubrics/presentation/hooks/use-rubrics';
import type { StudentDependencies } from '@/features/users/presentation/hooks/use-students';
export interface AppDependencies {
  projects: ProjectsDependencies;
  auth: AuthSessionService;
  teacherOverview: GetTeacherOverviewUseCase;
  assessments: AssessmentDependencies;
  rubrics: RubricDependencies;
  students: StudentDependencies;
}
