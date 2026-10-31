import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { ProjectsContext } from '@/features/projects/presentation/hooks/projects-context';
import { AuthContext } from '@/shared/services/auth/auth-context';
import { createDependencies } from '@/app/di/container';
import { createDemoSession } from '@/features/users/infrastructure/auth/demo-session.adapter';
import { TeacherOverviewContext } from '@/features/metrics/presentation/hooks/use-teacher-overview';
import { AssessmentContext } from '@/features/assessments/presentation/hooks/use-assessments';
import { RubricContext } from '@/features/rubrics/presentation/hooks/use-rubrics';
import { StudentContext } from '@/features/users/presentation/hooks/use-students';
export function createTestWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const dependencies = createDependencies(
    'http://localhost/api',
    createDemoSession(),
  );
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter>
        <QueryClientProvider client={client}>
          <AuthContext.Provider
            value={{
              user: {
                id: 'teacher',
                name: 'Docente',
                email: 'teacher@example.test',
                roles: ['TEACHER'],
              },
              loading: false,
              error: null,
              login: async () => {},
              logout: async () => {},
            }}
          >
            <ProjectsContext.Provider value={dependencies.projects}>
              <TeacherOverviewContext.Provider
                value={dependencies.teacherOverview}
              >
                <AssessmentContext.Provider value={dependencies.assessments}>
                  <RubricContext.Provider value={dependencies.rubrics}>
                    <StudentContext.Provider value={dependencies.students}>
                      {children}
                    </StudentContext.Provider>
                  </RubricContext.Provider>
                </AssessmentContext.Provider>
              </TeacherOverviewContext.Provider>
            </ProjectsContext.Provider>
          </AuthContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>
    );
  }
  return Wrapper;
}
