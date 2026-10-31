import type { RouteObject } from 'react-router';
import { RoleGuard } from './role-guard';
import { ModulePlaceholder } from '@/shared/components/common/module-placeholder';
import { studentRoutes } from '../config/routes.config';
export function createStudentRoutes(demo: boolean): RouteObject[] {
  return [
    {
      element: <RoleGuard roles={['TEACHER']} />,
      children: [
        {
          path: studentRoutes.list,
          lazy: async () => {
            const { default: StudentsPage } =
              await import('@/features/users/presentation/pages/students.page');
            return {
              Component: () =>
                demo ? (
                  <StudentsPage />
                ) : (
                  <ModulePlaceholder
                    title="Estudiantes"
                    description="La consulta real de estudiantes se habilitará cuando estén definidos los endpoints del backend."
                  />
                ),
            };
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
                    description="La consulta real de contribuciones está pendiente del backend."
                  />
                ),
            };
          },
        },
      ],
    },
  ];
}
