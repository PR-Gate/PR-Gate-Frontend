import { createBrowserRouter, Navigate } from 'react-router';
import { MainLayout } from '../layouts/main-layout';
import { AuthLayout } from '../layouts/auth-layout';
import { DashboardLayout } from '../layouts/dashboard-layout';
import { ProtectedRoute } from './protected-route';
import { RoleGuard } from './role-guard';
import { RouteError } from '@/shared/components/feedback/route-error';
import { ModulePlaceholder } from '@/shared/components/common/module-placeholder';
import { adminRoutes, teacherRoutes } from '../config/routes.config';
import { DashboardPage, NotFoundPage, UnauthorizedPage } from './static-pages';
import { createStudentRoutes } from './student.routes';
import RepositoryProjectsPage from '@/features/projects/presentation/pages/repository-projects.page';
import { StudentOnlyRoute } from '@/shared/components/guards/student-only-route';
import { TeacherOnlyRoute } from '@/shared/components/guards/teacher-only-route';

export function createAppRouter(demo: boolean) {
  return createBrowserRouter([
    {
      element: <MainLayout />,
      hydrateFallbackElement: (
        <p role="status" className="p-10">
          Cargando espacio académico…
        </p>
      ),
      errorElement: <RouteError />,
      children: [
        {
          element: <AuthLayout />,
          children: [
            {
              path: '/register',
              lazy: async () => ({
                Component: (
                  await import('@/features/users/presentation/pages/register.page')
                ).default,
              }),
            },
            {
              path: '/login',
              lazy: async () => {
                const { default: Login } =
                  await import('@/features/users/presentation/pages/login.page');
                return { Component: () => <Login demo={demo} /> };
              },
            },
          ],
        },
        { path: '/unauthorized', element: <UnauthorizedPage /> },
        {
          element: <ProtectedRoute />,
          children: [
            {
              path: '/account',
              lazy: async () => {
                const { default: AccountPage } =
                  await import('@/features/users/presentation/pages/account.page');
                return { Component: () => <AccountPage demo={demo} /> };
              },
            },
            {
              element: <DashboardLayout demo={demo} />,
              children: [
                { index: true, element: <Navigate to="/dashboard" replace /> },
                { path: '/dashboard', element: <DashboardPage /> },
                {
                  path: '/teacher/courses',
                  element: <TeacherOnlyRoute />,
                  children: [
                    {
                      index: true,
                      lazy: async () => ({
                        Component: (await import('@/features/projects'))
                          .TeacherCoursesPage,
                      }),
                    },
                  ],
                },
                {
                  path: '/pipelines',
                  element: <StudentOnlyRoute />,
                  children: [
                    {
                      index: true,
                      lazy: async () => ({
                        Component: (await import('@/features/cicd'))
                          .PipelinesPage,
                      }),
                    },
                  ],
                },
                {
                  path: '/quality-gate',
                  lazy: async () => ({
                    Component: (await import('@/features/cicd'))
                      .QualityGatesPage,
                  }),
                },
                {
                  path: '/projects',
                  lazy: async () => ({
                    Component: demo
                      ? (
                          await import('@/features/projects/presentation/pages/projects.page')
                        ).default
                      : () => (
                          <RoleGuard roles={['STUDENT', 'TEACHER']}>
                            <RepositoryProjectsPage />
                          </RoleGuard>
                        ),
                  }),
                },
                {
                  path: '/projects/:projectId',
                  lazy: async () => ({
                    Component: demo
                      ? (
                          await import('@/features/projects/presentation/pages/project-detail.page')
                        ).default
                      : () => (
                          <ModulePlaceholder
                            title="Detalle del proyecto"
                            description="La consulta del proyecto está pendiente de conectar el servicio local de proyectos."
                          />
                        ),
                  }),
                },
                {
                  path: '/projects/:projectId/pipelines',
                  element: <StudentOnlyRoute />,
                  children: [
                    {
                      index: true,
                      lazy: async () => ({
                        Component: (await import('@/features/cicd'))
                          .PipelinesPage,
                      }),
                    },
                  ],
                },
                {
                  path: '/projects/:projectId/quality-gates',
                  lazy: async () => ({
                    Component: (await import('@/features/cicd'))
                      .QualityGatesPage,
                  }),
                },
                {
                  path: '/projects/:projectId/metrics',
                  lazy: async () => ({
                    Component: (await import('@/features/metrics')).MetricsPage,
                  }),
                },
                {
                  path: '/practice',
                  lazy: async () => {
                    const { StudentTestsPage } =
                      await import('@/features/ai-practice');
                    return {
                      Component: () => (
                        <RoleGuard roles={['STUDENT']}>
                          <StudentTestsPage />
                        </RoleGuard>
                      ),
                    };
                  },
                },
                {
                  path: '/notifications',
                  lazy: async () => ({
                    Component: (await import('@/features/notifications'))
                      .NotificationsPage,
                  }),
                },
                {
                  path: '/profile',
                  lazy: async () => {
                    const { default: ProfilePage } =
                      await import('@/features/users/presentation/pages/profile.page');
                    return { Component: () => <ProfilePage demo={demo} /> };
                  },
                },
                {
                  element: <RoleGuard roles={['TEACHER', 'ADMIN']} />,
                  children: [
                    ...teacherRoutes.map((route) =>
                      route.path === '/teacher/dashboard'
                        ? {
                            path: route.path,
                            lazy: async () => ({
                              Component: (await import('@/features/metrics'))
                                .TeacherSummaryPage,
                            }),
                          }
                        : route.path === '/teacher/rubrics'
                          ? {
                              path: route.path,
                              lazy: async () => {
                                const { TeacherRubricsPage } =
                                  await import('@/features/rubrics');
                                return {
                                  Component: () => (
                                    <TeacherOnlyRoute>
                                      <TeacherRubricsPage />
                                    </TeacherOnlyRoute>
                                  ),
                                };
                              },
                            }
                          : route.path === '/teacher/evaluations'
                            ? {
                                path: route.path,
                                lazy: async () => {
                                  const { TeacherTestsPage } =
                                    await import('@/features/assessments');
                                  return {
                                    Component: () => (
                                      <TeacherOnlyRoute>
                                        <TeacherTestsPage />
                                      </TeacherOnlyRoute>
                                    ),
                                  };
                                },
                              }
                            : {
                                path: route.path,
                                element: (
                                  <ModulePlaceholder
                                    title={route.title}
                                    description="Herramientas docentes para acompañar y evaluar el aprendizaje basado en proyectos."
                                  />
                                ),
                              },
                    ),
                    {
                      path: '/teacher/evaluations/:testId',
                      lazy: async () => {
                        const { TeacherTestReviewPage } =
                          await import('@/features/assessments');
                        return {
                          Component: () => (
                            <TeacherOnlyRoute>
                              <TeacherTestReviewPage />
                            </TeacherOnlyRoute>
                          ),
                        };
                      },
                    },
                  ],
                },
                ...createStudentRoutes(demo),
                {
                  element: <RoleGuard roles={['ADMIN']} />,
                  children: adminRoutes.map((route) => ({
                    path: route.path,
                    element: (
                      <ModulePlaceholder
                        title={route.title}
                        description="Administración de cuentas y configuración del espacio académico."
                      />
                    ),
                  })),
                },
                {
                  path: '/my-rubric',
                  lazy: async () => {
                    const { StudentResultPage } =
                      await import('@/features/rubrics');
                    return {
                      Component: () => (
                        <RoleGuard roles={['STUDENT']}>
                          <StudentResultPage />
                        </RoleGuard>
                      ),
                    };
                  },
                },
              ],
            },
          ],
        },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ]);
}
