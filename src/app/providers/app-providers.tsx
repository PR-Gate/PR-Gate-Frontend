import { useState, type ReactNode } from 'react';
import { EvaluationContext } from '@/features/metrics/presentation/hooks/use-evaluation';
import { Toaster } from 'sonner';
import { ProjectsContext } from '@/features/projects/presentation/hooks/projects-context';
import { createQueryClient } from '../config/query-client.config';
import type { AppDependencies } from '../di/dependencies';
import { QueryProvider } from './query-provider';
import { AuthProvider } from './auth-provider';
import { TeacherOverviewContext } from '@/features/metrics/presentation/hooks/use-teacher-overview';
import { AssessmentContext } from '@/features/assessments/presentation/hooks/use-assessments';
import { RubricContext } from '@/features/rubrics/presentation/hooks/use-rubrics';
import { StudentContext } from '@/features/users/presentation/hooks/use-students';
import { GitHubLinkContext } from '@/features/users/presentation/hooks/use-github-link';
import { RepositoryProjectsContext } from '@/features/projects/presentation/hooks/use-repository-projects';
export function AppProviders({
  dependencies,
  children,
}: {
  dependencies: AppDependencies;
  children: ReactNode;
}) {
  const [client] = useState(createQueryClient);
  return (
    <QueryProvider client={client}>
      <AuthProvider service={dependencies.auth} queryClient={client}>
        <ProjectsContext.Provider value={dependencies.projects}>
          <TeacherOverviewContext.Provider value={dependencies.teacherOverview}>
            <AssessmentContext.Provider value={dependencies.assessments}>
              <RubricContext.Provider value={dependencies.rubrics}>
                <StudentContext.Provider value={dependencies.students}>
                  <GitHubLinkContext.Provider value={dependencies.github}>
                    <RepositoryProjectsContext.Provider
                      value={dependencies.repositoryProjects}
                    >
                      <EvaluationContext.Provider value={dependencies.evaluation}>
                        {children}
                      </EvaluationContext.Provider>
                    </RepositoryProjectsContext.Provider>
                  </GitHubLinkContext.Provider>
                </StudentContext.Provider>
              </RubricContext.Provider>
            </AssessmentContext.Provider>
          </TeacherOverviewContext.Provider>
          <Toaster richColors position="bottom-right" />
        </ProjectsContext.Provider>
      </AuthProvider>
    </QueryProvider>
  );
}
