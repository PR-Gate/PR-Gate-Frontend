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
                  lazy: async () => ({
                    Component: (await import('@/features/cicd')).PipelinesPage,
                  }),
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
                  path: '/feedback',
                  lazy: async () => ({
                    Component: (await import('@/features/ai-practice'))
                      .FeedbackPage,
                  }),
                },
                {
                  path: '/practice',
                  lazy: async () => ({
                    Component: (await import('@/features/ai-practice'))
                      .PracticePage,
                  }),
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
                              Component: demo
                                ? (await import('@/features/metrics'))
                                    .TeacherDashboardPage
                                : () => (
                                    <ModulePlaceholder
                                      title="Resumen docente"
                                      description="El resumen está disponible en la demostración local. Su conexión con datos reales se habilitará cuando el contrato del backend esté definido."
                                    />
                                  ),
                            }),
                          }
                        : route.path === '/teacher/rubrics'
                          ? {
                              path: route.path,
                              lazy: async () => {
                                const { RubricsPage } =
                                  await import('@/features/rubrics');
                                return {
                                  Component: () => (
                                    <RoleGuard roles={['TEACHER']}>
                                      {demo ? (
                                        <RubricsPage />
                                      ) : (
                                        <ModulePlaceholder
                                          title="Rúbricas"
                                          description="La conexión real de rúbricas se habilitará cuando los endpoints del backend estén definidos."
                                        />
                                      )}
                                    </RoleGuard>
                                  ),
                                };
                              },
                            }
                          : route.path === '/teacher/evaluations'
                            ? {
                                path: route.path,
                                lazy: async () => {
                                  const { AssessmentsPage } =
                                    await import('@/features/assessments');
                                  return {
                                    Component: () => (
                                      <RoleGuard roles={['TEACHER']}>
                                        {demo ? (
                                          <AssessmentsPage />
                                        ) : (
                                          <ModulePlaceholder
                                            title="Tests y evaluaciones"
                                            description="Esta sección usa datos de demostración. La conexión real se habilitará cuando el backend y sus contratos estén definidos."
                                          />
                                        )}
                                      </RoleGuard>
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
                        const { AssessmentDetailPage } =
                          await import('@/features/assessments');
                        return {
                          Component: () => (
                            <RoleGuard roles={['TEACHER']}>
                              {demo ? (
                                <AssessmentDetailPage />
                              ) : (
                                <ModulePlaceholder
                                  title="Tests y evaluaciones"
                                  description="La integración con datos reales sigue pendiente del backend."
                                />
                              )}
                            </RoleGuard>
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
                    const { StudentRubricPage } =
                      await import('@/features/rubrics');
                    return {
                      Component: () => (
                        <RoleGuard roles={['STUDENT']}>
                          {demo ? (
                            <StudentRubricPage />
                          ) : (
                            <ModulePlaceholder
                              title="Mi rúbrica"
                              description="La consulta de la rúbrica asignada se habilitará al integrar el backend."
                            />
                          )}
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
