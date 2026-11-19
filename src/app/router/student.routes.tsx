import type { RouteObject } from 'react-router';
import { TeacherOnlyRoute } from '@/shared/components/guards/teacher-only-route';
import { ModulePlaceholder } from '@/shared/components/common/module-placeholder';
import { studentRoutes } from '../config/routes.config';
export function createStudentRoutes(demo: boolean): RouteObject[] {
  return [
    {
      element: <TeacherOnlyRoute />,
      children: [
        {
          path: studentRoutes.list,
          lazy: async () => {
            if (!demo) {
              const { LiveTeacherStudentsPage } = await import('@/features/users/presentation/pages/live-teacher-students.page');
              return { Component: LiveTeacherStudentsPage };
            }
            const { TeacherStudentsPage } = await import('@/features/users');
            return { Component: TeacherStudentsPage };
          },
        },
        {
          path: studentRoutes.detail,
          lazy: async () => {
            const { default: StudentContributionPage } =
              await import('@/features/users/presentation/pages/student-contribution.page');
            return {
              Component: () =>
                demo ? (
                  <StudentContributionPage />
                ) : (
                  <ModulePlaceholder
                    title="Contribución del estudiante"
                    description="Todavía no hay datos de contribución individual disponibles."
                  />
                ),
            };
          },
        },
      ],
    },
  ];
}
