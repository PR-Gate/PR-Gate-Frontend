import { createHttpClient } from '@/shared/services/http/axios.config';
import { ProjectApiService } from '@/features/projects/infrastructure/services/project-api.service';
import { ProjectRepositoryImpl } from '@/features/projects/infrastructure/repositories/project.repository.impl';
import { GetProjectsUseCase } from '@/features/projects/application/use-cases/get-projects.use-case';
import { GetProjectByIdUseCase } from '@/features/projects/application/use-cases/get-project-by-id.use-case';
import { CreateProjectUseCase } from '@/features/projects/application/use-cases/create-project.use-case';
import type { AuthSessionService } from '@/shared/services/auth/auth-session.service';
import type { AppDependencies } from './dependencies';
import { MetricsApiService } from '@/features/metrics/infrastructure/services/metrics-api.service';
import { TeacherOverviewRepositoryImpl } from '@/features/metrics/infrastructure/repositories/teacher-overview.repository.impl';
import { GetTeacherOverviewUseCase } from '@/features/metrics/application/use-cases/get-teacher-overview.use-case';
import { AssessmentApiService } from '@/features/assessments/infrastructure/assessment-api.service';
import { AssessmentRepositoryImpl } from '@/features/assessments/infrastructure/assessment.repository.impl';
import { RubricApiService } from '@/features/rubrics/infrastructure/rubric-api.service';
import { RubricRepositoryImpl } from '@/features/rubrics/infrastructure/rubric.repository.impl';
import { StudentApiService } from '@/features/users/infrastructure/services/student-api.service';
import { StudentRepositoryImpl } from '@/features/users/infrastructure/repositories/student.repository.impl';
import { GetCourseStudentsUseCase } from '@/features/users/application/use-cases/get-course-students.use-case';
import { GetStudentContributionUseCase } from '@/features/users/application/use-cases/get-student-contribution.use-case';
import {
  ArchiveRubricUseCase,
  DeleteRubricUseCase,
  DuplicateRubricUseCase,
  GetRubricLibraryUseCase,
  GetStudentRubricUseCase,
  PreviewRubricImportUseCase,
  PublishRubricUseCase,
  SaveRubricDraftUseCase,
} from '@/features/rubrics/application/rubric.use-cases';
import {
  GetTestCatalogUseCase,
  GetTestsUseCase,
  GetTestUseCase,
  PublishTestUseCase,
  RemindTestUseCase,
  ReviewTestUseCase,
  SaveTestDraftUseCase,
} from '@/features/assessments/application/assessment.use-cases';

export function createDependencies(
  baseUrl: string,
  auth: AuthSessionService,
): AppDependencies {
  const http = createHttpClient(
    baseUrl,
    () => auth.getAccessToken(),
    () => auth.expire(),
  );
  const repository = new ProjectRepositoryImpl(new ProjectApiService(http));
  const assessments = new AssessmentRepositoryImpl(
    new AssessmentApiService(http),
  );
  const rubrics = new RubricRepositoryImpl(new RubricApiService(http));
  const students = new StudentRepositoryImpl(new StudentApiService(http));
  return {
    auth,
    students: {
      roster: new GetCourseStudentsUseCase(students),
      contribution: new GetStudentContributionUseCase(students),
    },
    rubrics: {
      library: new GetRubricLibraryUseCase(rubrics),
      save: new SaveRubricDraftUseCase(rubrics),
      publish: new PublishRubricUseCase(rubrics),
      duplicate: new DuplicateRubricUseCase(rubrics),
      archive: new ArchiveRubricUseCase(rubrics),
      remove: new DeleteRubricUseCase(rubrics),
      importPreview: new PreviewRubricImportUseCase(rubrics),
      student: new GetStudentRubricUseCase(rubrics),
    },
    assessments: {
      list: new GetTestsUseCase(assessments),
      get: new GetTestUseCase(assessments),
      catalog: new GetTestCatalogUseCase(assessments),
      save: new SaveTestDraftUseCase(assessments),
      publish: new PublishTestUseCase(assessments),
      remind: new RemindTestUseCase(assessments),
      review: new ReviewTestUseCase(assessments),
    },
    teacherOverview: new GetTeacherOverviewUseCase(
      new TeacherOverviewRepositoryImpl(new MetricsApiService(http)),
    ),
    projects: {
      getProjects: new GetProjectsUseCase(repository),
      getProjectById: new GetProjectByIdUseCase(repository),
      createProject: new CreateProjectUseCase(repository),
    },
  };
}
