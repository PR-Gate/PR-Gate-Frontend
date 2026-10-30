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

export function createAppRouter(demo: boolean) {
  return createBrowserRouter([
    {
      element: <MainLayout />,
      errorElement: <RouteError />,
      children: [
        {
          element: <AuthLayout />,
          children: [
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
              element: <DashboardLayout demo={demo} />,
              children: [
                { index: true, element: <Navigate to="/dashboard" replace /> },
                { path: '/dashboard', element: <DashboardPage /> },
                {
                  path: '/projects',
                  lazy: async () => ({
                    Component: (
                      await import('@/features/projects/presentation/pages/projects.page')
                    ).default,
                  }),
                },
                {
                  path: '/projects/:projectId',
                  lazy: async () => ({
                    Component: (
                      await import('@/features/projects/presentation/pages/project-detail.page')
                    ).default,
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
                  lazy: async () => ({
                    Component: (
                      await import('@/features/users/presentation/pages/profile.page')
                    ).default,
                  }),
                },
                {
                  element: <RoleGuard roles={['TEACHER', 'ADMIN']} />,
                  children: teacherRoutes.map((route) => ({
                    path: route.path,
                    element: (
                      <ModulePlaceholder
                        title={route.title}
                        description="Herramientas docentes para acompañar y evaluar el aprendizaje basado en proyectos."
                      />
                    ),
                  })),
                },
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
              ],
            },
          ],
        },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ]);
}
